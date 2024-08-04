<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\Product;
use App\Entity\Model;
use App\Entity\AnonymousCart;
use App\Repository\CartRepository;
use App\Repository\ProductRepository;
use App\Repository\ModelRepository;
use App\Repository\StockRepository;
use App\Repository\AnonymousCartRepository;
use App\Repository\UserRepository;
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
    private ModelRepository $modelRepository;
    private StockRepository $stockRepository;
    private EntityManagerInterface $entityManager;
    private AnonymousCartRepository $anonymousCartRepository;
    private UserRepository $userRepository;

    public function __construct(
        CartRepository $cartRepository,
        ProductRepository $productRepository,
        ModelRepository $modelRepository,
        StockRepository $stockRepository,
        EntityManagerInterface $entityManager,
        AnonymousCartRepository $anonymousCartRepository,
        UserRepository $userRepository
    ) {
        $this->cartRepository = $cartRepository;
        $this->productRepository = $productRepository;
        $this->modelRepository = $modelRepository;
        $this->stockRepository = $stockRepository;
        $this->entityManager = $entityManager;
        $this->anonymousCartRepository = $anonymousCartRepository;
        $this->userRepository = $userRepository;
    }

    #[Route('/cart/add/{productId}', name: 'cart_add_item', methods: ['POST'])]
    public function addToCart(int $productId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;
        $userId = isset($data['user_id']) ? (int)$data['user_id'] : null;
        $modelId = isset($data['model_id']) ? (int)$data['model_id'] : null;
        $token = isset($data['token']) ? $data['token'] : null;


        $product = $this->productRepository->find($productId);
        $model = $this->modelRepository->find($modelId);

        if (!$product || !$model) {
            return new JsonResponse(['error' => 'Produit ou modèle non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $color = $model->getColor();
        $size = $model->getSize();
        $colorId = $color ? $color->getId() : null;
        $sizeId = $size ? $size->getId() : null;

        $stock = $this->stockRepository->findStockForProduct($productId, $colorId, $sizeId);

        if ($quantity > $stock) {
            return new JsonResponse(['error' => 'La quantité dépasse le stock disponible'], Response::HTTP_BAD_REQUEST);
        }

        if ($userId) {

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
        } elseif ($token) {

            $anonymousCart = $this->anonymousCartRepository->findOneBy(['token' => $token]);
            if (!$anonymousCart) {
                return new JsonResponse(['error' => 'Panier anonyme non trouvé'],
                                            Response::HTTP_NOT_FOUND);
            }
            $cart = $anonymousCart;
        } else {

            $token = bin2hex(random_bytes(16));
            $anonymousCart = new AnonymousCart();
            $anonymousCart->setToken($token);
            $this->entityManager->persist($anonymousCart);
            $this->entityManager->flush();

            $cart = $anonymousCart;

            $cartItem = new CartItem();
            $cartItem->setProduct($product);
            $cartItem->setModel($model);
            $cartItem->setQuantity($quantity);
            $cartItem->setPrice($model->getPrice());
            $cartItem->setAnonymousCart($cart);

            $this->entityManager->persist($cartItem);
            $cart->calculateTotal();
            $this->entityManager->flush();

            return new JsonResponse([
                'message' => 'Article ajouté au panier',
                'token' => $token,
                'cart_total' => $cart->getTotal()
            ], Response::HTTP_OK);
        }


        $cartItem = $this->entityManager->getRepository(CartItem::class)
            ->findOneBy([
                'cart' => $cart instanceof Cart ? $cart : null,
                'anonymousCart' => $cart instanceof AnonymousCart ? $cart : null,
                'product' => $product,
                'model' => $model
            ]);

        if ($cartItem) {
            $newQuantity = $cartItem->getQuantity() + $quantity;
            if ($newQuantity > $stock) {
                return new JsonResponse(['error' => 'La quantité dépasse le stock disponible'],
                                         Response::HTTP_BAD_REQUEST);
            }
            $cartItem->setQuantity($newQuantity);
        } else {
            $cartItem = new CartItem();
            $cartItem->setProduct($product);
            $cartItem->setModel($model);
            $cartItem->setQuantity($quantity);
            $cartItem->setPrice($model->getPrice());

            if ($cart instanceof Cart) {
                $cartItem->setCart($cart);
            } elseif ($cart instanceof AnonymousCart) {
                $cartItem->setAnonymousCart($cart);
            }

            $this->entityManager->persist($cartItem);
        }

        $this->entityManager->flush();

        $cart->calculateTotal();
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Article ajouté au panier',
            'cart_total' => $cart->getTotal()
        ], Response::HTTP_OK);
    }
}