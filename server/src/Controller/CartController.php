<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\Product;
use App\Entity\Model;
use App\Entity\Stock;
use App\Entity\Promotion;
use App\Entity\AnonymousCart;
use App\Repository\CartRepository;
use App\Repository\ProductRepository;
use App\Repository\ModelRepository;
use App\Repository\StockRepository;
use App\Repository\AnonymousCartRepository;
use App\Repository\CartItemRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\Encoder\JsonDecode;
use Symfony\Component\Validator\Constraints\Json;
use Symfony\Config\Framework\HttpClient\DefaultOptions\RetryFailedConfig;

#[Route('/api/cart')]
class CartController extends AbstractController
{
    private CartRepository $cartRepository;
    private ProductRepository $productRepository;
    private ModelRepository $modelRepository;
    private StockRepository $stockRepository;
    private EntityManagerInterface $entityManager;
    private AnonymousCartRepository $anonymousCartRepository;
    private CartItemRepository $cartItemsRepository;
    private UserRepository $userRepository;
    private $session;

    public function __construct(
        CartRepository $cartRepository,
        ProductRepository $productRepository,
        ModelRepository $modelRepository,
        StockRepository $stockRepository,
        EntityManagerInterface $entityManager,
        AnonymousCartRepository $anonymousCartRepository,
        CartItemRepository $cartItemRepository,
        UserRepository $userRepository,
        RequestStack $requestStack
    ) {
        $this->cartRepository = $cartRepository;
        $this->productRepository = $productRepository;
        $this->modelRepository = $modelRepository;
        $this->stockRepository = $stockRepository;
        $this->entityManager = $entityManager;
        $this->anonymousCartRepository = $anonymousCartRepository;
        $this->cartItemsRepository = $cartItemRepository;
        $this->userRepository = $userRepository;
        $this->session = $requestStack->getSession();
    }

    #[Route('/add/{productId}', name: 'cart_add_item', methods: ['POST'])]
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

        $price = $model->getPrice();
        $promoPrice = null;
        $now = new \DateTime();
        $promotions = $this->entityManager->getRepository(Promotion::class)
            ->createQueryBuilder('p')
            ->where('p.product = :product')
            ->andWhere('p.start_date <= :now')
            ->andWhere('p.end_date >= :now')
            ->setParameter('product', $product)
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        if (!empty($promotions)) {
            foreach ($promotions as $promotion) {
                if ($now >= $promotion->getStartDate() && $now <= $promotion->getEndDate()) {
                    $promoPrice = $promotion->getPromoPrice();
                    break;
                }
            }
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
                return new JsonResponse(
                    ['error' => 'Panier anonyme non trouvé'],
                    Response::HTTP_NOT_FOUND
                );
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
            $cartItem->setGiftWrap(false);

            $this->entityManager->persist($cartItem);
            $cart->calculateTotal();
            $this->entityManager->flush();

            return new JsonResponse([
                'message' => 'Article ajouté au panier',
                'token' => $token ?? null,
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
                return new JsonResponse(
                    ['error' => 'La quantité dépasse le stock disponible'],
                    Response::HTTP_BAD_REQUEST
                );
            }
            $cartItem->setQuantity($newQuantity);
        } else {

            $cartItem = new CartItem();
            $cartItem->setProduct($product);
            $cartItem->setModel($model);
            $cartItem->setQuantity($quantity);
            $cartItem->setPrice($price);
            $cartItem->setPromoPrice($promoPrice);

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

    public function getCartItems(Request $request)
    {
        $token = $request->query->get('token');
        $userId = $request->query->get('userId');

        if (!$token && !$userId) {
            return new JsonResponse(['error' => "Aucune donnéee n'a été trouvée"], Response::HTTP_BAD_REQUEST);
        }

        if ($token) {
            $cart = $this->anonymousCartRepository->findOneBy(['token' => $token]);
        }

        if ($userId) {
            $cart = $this->cartRepository->findOneBy(['user' => $userId]);
        }

        $cartItems = $cart->getItems();

        return $cartItems;
    }

    #[Route('/', name: 'cart_get_items', methods: ["GET"])]
    public function getJsonCartItems(Request $request): JsonResponse
    {
        $token = $request->query->get('token');
        $userId = $request->query->get('userId');

        if (!$token && !$userId) {
            return new JsonResponse(['error' => "Aucune donnéee n'a été trouvée"], Response::HTTP_BAD_REQUEST);
        }

        if ($token) {
            $cart = $this->anonymousCartRepository->findOneBy(['token' => $token]);
        }

        if ($userId) {
            $cart = $this->cartRepository->findOneBy(['user' => $userId]);
        }

        $cartItems = $cart->getItems();


        $itemsData = [];
        foreach ($cartItems as $cartItem) {

            $image = null;
            foreach ($cartItem->getModel()->getImage() as $img) {
                if ($img->isMain()) {
                    $image = $img->getPath();
                    break;
                }
            }

            $quantity = $cartItem->getQuantity();
            $price = $cartItem->getModel()->getPrice();

            $total = $quantity * $price;
            $formattedTotal = number_format($total, 2, '.', '');

            $promoPrice = $cartItem->getPromoPrice();
            $totalPromotions = $promoPrice !== null ? $quantity * $promoPrice : 0;
            $formattedTotalPromotion = $promoPrice !== null ? number_format($totalPromotions, 2, '.', '') : null;

            $itemsData[] = [
                'id' => $cartItem->getId(),
                'product' => $cartItem->getProduct()->getName(),
                'product_id' => $cartItem->getProduct()->getId(),
                'quantity' => $cartItem->getQuantity(),
                'image_path' => $image,
                'price' => $cartItem->getPrice(),
                'promo_price' => $cartItem->getPromoPrice(),
                'total' => $formattedTotal,
                'total_promotion' => $formattedTotalPromotion,
                'isGift' => $cartItem->isGiftWrap(),
            ];
        }

        $data = [
            'items' => $itemsData
        ];

        return new JsonResponse($data);
    }

    #[Route('/item/{itemId}', name: 'update_cart_item_quantity_token', methods: ['PATCH'])]
    public function updateItemQuantity(int $itemId, Request $request, EntityManagerInterface $entityManager)
    {
        $data = json_decode($request->getContent(), true);
        $quantity = $data['quantity'];

        if (!$quantity) {
            return new JsonResponse(['error' => "Nous n'avons pas pu effectuer ce changement sur notre serveur"], Response::HTTP_BAD_REQUEST);
        }

        $cartItem = $entityManager->getRepository(CartItem::class)->find($itemId);

        $stock = $entityManager->getRepository(Stock::class)->findOneBy([
            'product' => $cartItem->getProduct()->getId()
        ])->getQuantity();

        if ($quantity < 1) {
            return new JsonResponse(['error' => "Il doit rester au moins 1 article"], 400);
        } else if ($quantity > $stock) {
            return new JsonResponse(['error' => "Il ne reste plus d'autres articles disponibles"], 400);
        }

        $cartItem->setQuantity($quantity);

        $entityManager->persist($cartItem);
        $entityManager->flush();

        $newQuantity = $cartItem->getQuantity();
        $price = $cartItem->getModel()->getPrice();

        $total = $newQuantity * $price;
        $formattedTotal = number_format($total, 2, '.', '');

        $promoPrice = $cartItem->getPromoPrice();
        $totalPromotions = $promoPrice !== null ? $newQuantity * $promoPrice : 0;
        $formattedTotalPromotion = $promoPrice !== null ? number_format($totalPromotions, 2, '.', '') : null;

        $itemData = [
            'id' => $cartItem->getId(),
            'product' => $cartItem->getProduct()->getName(),
            'product_id' => $cartItem->getProduct()->getId(),
            'quantity' => $cartItem->getQuantity(),
            'promo_price' => $cartItem->getPromoPrice(),
            'price' => $cartItem->getModel()->getPrice(),
            'total' => $formattedTotal,
            'total_promotion' => $formattedTotalPromotion
        ];

        $data = [
            'message' => "La quantité a bien été modifiée",
            'item' => $itemData
        ];

        return new JsonResponse($data);
    }

    #[Route('/item/delete/{itemId}', name: 'delete_cart_item', methods: ['DELETE'])]
    public function deleteItem(int $itemId, EntityManagerInterface $entityManager)
    {
        $cartItem = $entityManager->getRepository(CartItem::class)->find($itemId);

        if (!$cartItem) {
            return new JsonResponse(
                ['error' => "Le produit n'a pas été  trouvé sur le serveur"],
                Response::HTTP_NOT_FOUND
            );
        }

        $entityManager->remove($cartItem);
        $entityManager->flush();

        return new JsonResponse(
            ['message' => "Le produit a été enlevé de votre panier"],
            Response::HTTP_OK
        );
    }

    #[Route('/item/gift/{itemId}', name:'update_item_gift', methods:['PATCH'])]
    public function updateIsGift(int $itemId, EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $cartItem = $entityManager->getRepository(CartItem::class)->find($itemId);

        if (!$cartItem) {
            return new JsonResponse(['error' => "Le produit n'a pas été trouvé"], 404);
        }

        $data = json_decode($request->getContent(), true);
        $isGift = $data['isGift'];

        $cartItem->setGiftWrap($isGift);

        $entityManager->persist($cartItem);
        $entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/', name:'delete_cart', methods:['DELETE'])]
    public function deleteCart(Request $request)
    {
        $token = $request->query->get('token');
        $userId = $request->query->get('userId');

        if (!$token && !$userId) {
            return new JsonResponse(['error' => "Aucune donnéee n'a été trouvée"], Response::HTTP_BAD_REQUEST);
        }

        if ($token) {
            $cart = $this->anonymousCartRepository->findOneBy(['token' => $token]);
        }

        if ($userId) {
            $cart = $this->cartRepository->findOneBy(['user' => $userId]);
        }

        $this->entityManager->remove($cart);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/items/count', name: 'cart_items_count', methods: ['GET'])]
    public function countCartItems(Request $request) : JsonResponse {
        $userId = $request->query->get('userId');
        $token = $request->query->get('token');

        if (!$userId && !$token) {
            return new JsonResponse(['error' => 'User ID or Token is required'], Response::HTTP_BAD_REQUEST);
        }

        $cart = null;
        if ($userId) {
            $cart = $this->cartRepository->findOneBy(['user' => $userId]);
        } elseif ($token) {
            $cart = $this->anonymousCartRepository->findOneBy(['token' => $token]);
        }

        if (!$cart) {
            return new JsonResponse(['itemCount' => 0], Response::HTTP_OK);
        }

        $cartItems = $cart->getItems()->toArray();

        $itemCount = array_reduce($cartItems, function($count, $item) {
            return $count + $item->getQuantity();
        }, 0);

        return new JsonResponse(['itemCount' => $itemCount], Response::HTTP_OK);
    }

}