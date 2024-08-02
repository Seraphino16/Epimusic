<?php
namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\Product;
use App\Entity\Model;
use App\Entity\Size;
use App\Entity\Color;
use App\Repository\CartRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use App\Repository\ModelRepository;
use App\Repository\StockRepository;
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
    private StockRepository $stockRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        CartRepository $cartRepository,
        ProductRepository $productRepository,
        UserRepository $userRepository,
        ModelRepository $modelRepository,
        StockRepository $stockRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->cartRepository = $cartRepository;
        $this->productRepository = $productRepository;
        $this->userRepository = $userRepository;
        $this->modelRepository = $modelRepository;
        $this->stockRepository = $stockRepository;
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

        $color = $model->getColor();
        $size = $model->getSize();
        
        $colorId = $color ? $color->getId() : null;
        $sizeId = $size ? $size->getId() : null;

        $stock = $this->stockRepository->findStockForProduct($productId, $colorId, $sizeId);

        if ($quantity > $stock) {
            return new JsonResponse(['error' => 'La quantité totale dépasse le stock disponible'], Response::HTTP_BAD_REQUEST);
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

            $newQuantity = $cartItem->getQuantity() + $quantity;

            if ($newQuantity > $stock) {
                return new JsonResponse(['error' => 'La quantité totale dépasse le stock disponible'], Response::HTTP_BAD_REQUEST);
            }
        
            $cartItem->setQuantity($cartItem->getQuantity() + $quantity);
        } else {
    
            $cartItem = new CartItem();
            $cartItem->setCart($cart);
            $cartItem->setProduct($product);
            $cartItem->setModel($model);
            $cartItem->setQuantity($quantity);
            $cartItem->setPrice($model->getPrice());
            $this->entityManager->persist($cartItem);
        }


        $this->entityManager->flush();
        $cart->calculateTotal();
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Votre article a bien été ajouté au panier',
            'cart_total' => $cart->getTotal()
        ], Response::HTTP_OK);
    }


}
