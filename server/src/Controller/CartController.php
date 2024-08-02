<?php
namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\Product;
use App\Entity\Model;
use App\Repository\CartRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use App\Repository\ModelRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route('/api')]
class CartController extends AbstractController
{
    private CartRepository $cartRepository;
    private ProductRepository $productRepository;
    private UserRepository $userRepository;
    private ModelRepository $modelRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        CartRepository $cartRepository,
        ProductRepository $productRepository,
        UserRepository $userRepository,
        ModelRepository $modelRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->cartRepository = $cartRepository;
        $this->productRepository = $productRepository;
        $this->userRepository = $userRepository;
        $this->modelRepository = $modelRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/cart/add/{productId}', name: 'cart_add_item', methods: ['POST'])]
    public function addToCart(int $productId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;
        $userId = isset($data['user_id']) ? (int)$data['user_id'] : null;
        $modelId = isset($data['model_id']) ? (int)$data['model_id'] : null;

        if (!$userId) {
            return new JsonResponse(['error' => 'ID utilisateur invalide'], Response::HTTP_BAD_REQUEST);
        }

        $product = $this->productRepository->find($productId);
        if (!$product) {
            return new JsonResponse(['error' => 'Produit non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $model = $this->modelRepository->find($modelId);
        if (!$model) {
            return new JsonResponse(['error' => 'Modèle non trouvé pour ce produit'], Response::HTTP_NOT_FOUND);
        }

        $price = $model->getPrice();
        if ($price === null) {
            return new JsonResponse(['error' => 'Prix non disponible pour ce modèle'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $user = $this->userRepository->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $cart = $this->cartRepository->findOneBy(['user' => $user]);

        if (!$cart) {
            $cart = new Cart();
            $cart->setUser($user);
            $this->entityManager->persist($cart);
        }

        $cartItem = $this->entityManager->getRepository(CartItem::class)
            ->findOneBy(['cart' => $cart, 'product' => $product, 'model' => $model]);

        if ($cartItem) {
            $cartItem->setQuantity($cartItem->getQuantity() + $quantity);
        } else {
            $cartItem = new CartItem();
            $cartItem->setCart($cart);
            $cartItem->setProduct($product);
            $cartItem->setModel($model);
            $cartItem->setQuantity($quantity);
            $cartItem->setPrice($price);  // Correction ici pour définir le prix
            $this->entityManager->persist($cartItem);
        }

        $this->entityManager->flush();
        $cart->calculateTotal();  // Mettre à jour le total du panier
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Votre article a bien été ajouté au panier',
            'cart_total' => $cart->getTotal()
        ], Response::HTTP_OK);
    }
}
