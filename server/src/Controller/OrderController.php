<?php

namespace App\Controller;

use App\Entity\Order;
use App\Controller\CartController;
use App\Entity\OrderItems;
use App\Entity\User;
use App\Repository\AnonymousCartRepository;
use App\Repository\CartItemRepository;
use App\Repository\CartRepository;
use App\Repository\ModelRepository;
use App\Repository\ProductRepository;
use App\Repository\StockRepository;
use App\Repository\UserRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/order')]
class OrderController extends AbstractController
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

    #[Route('/', name: 'create_order', methods: ['POST'])]
    public function createOrder(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $userId = isset($data['userId']) ? (int)$data['userId'] : null;
        $token = isset($data['token']) ? $data['token'] : null;

        if (!$token && !$userId) {
            return new JsonResponse(['error' => "Aucune donnée n'a été trouvée"], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer le panier basé sur le token ou l'utilisateur
        if ($token) {
            $cart = $this->anonymousCartRepository->findOneBy(['token' => $token]);
        } elseif ($userId) {
            $user = $this->userRepository->find($userId);
            if (!$user) {
                return new JsonResponse(['error' => "Utilisateur non trouvé"], Response::HTTP_NOT_FOUND);
            }
            $cart = $this->cartRepository->findOneBy(['user' => $user]);
        }

        if (!$cart) {
            return new JsonResponse(['error' => "Panier non trouvé"], Response::HTTP_NOT_FOUND);
        }

        $cartItems = $cart->getItems();
        $order = new Order();
        $order->setStatus('pending');
        $order->setPaymentStatus('pending');
        $orderTotal = 0;
        $orderTotalWithPromo = 0;

        foreach ($cartItems as $cartItem) {
            $orderItem = new OrderItems();
            $quantity = $cartItem->getQuantity();
            $unitPrice = $cartItem->getModel()->getPrice();
            $totalItem = $quantity * $unitPrice;
            $unitPromoPrice = $cartItem->getPromoPrice();

            if ($unitPromoPrice) {
                $totalPromo = $quantity * $unitPromoPrice;
                $formattedPromoPrice = number_format($totalPromo, 2, '.', '');
                $orderItem->setUnitPromoPrice($unitPromoPrice);
                $orderItem->setTotalPromoPrice($formattedPromoPrice);
                $orderTotalWithPromo += $totalPromo;
            } else {
                $orderTotalWithPromo += $totalItem;
            }

            $orderTotal += $totalItem;
            $formattedTotal = number_format($totalItem, 2, '.', '');
            $orderItem->setProductName($cartItem->getProduct()->getName());

            $color = $cartItem->getModel()->getColor();
            if ($color) {
                $orderItem->setColor($color->getName());
            }
            $orderItem->setQuantity($quantity);
            $orderItem->setUnitPrice($unitPrice);
            $orderItem->setTotalPrice($formattedTotal);
            $orderItem->setGiftWrap(false);
            $order->addOrderItem($orderItem);
        }

        $formattedOrderTotal = number_format($orderTotal, 2, '.', '');
        $formatOrderTotalWithPromo = number_format($orderTotalWithPromo, 2, '.', '');
        $order->setTotalPrice($formattedOrderTotal);
        $order->setTotalWithPromo($formatOrderTotalWithPromo);

        $now = new DateTime();
        $order->setCreatedAt($now);
        $order->setUpdatedAt($now);

        // Associer l'utilisateur à la commande si l'utilisateur est authentifié
        if (isset($user)) {
            $order->setUser($user);
        }

        $this->entityManager->persist($order);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Commande créée avec succès', 'orderId' => $order->getId()], Response::HTTP_CREATED);
    }

    #[Route('/{userId}/orders', name: 'api_user_orders', methods: ['GET'])]
    public function getUserOrders($userId, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        $orders = $entityManager->getRepository(Order::class)->findBy(['user' => $user]);

        $data = [];
        foreach ($orders as $order) {
            $data[] = [
                'id' => $order->getId(),
                'status' => $order->getStatus(),
                'createdAt' => $order->getCreatedAt()->format('d/m/Y'),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/{orderId}/details', name: 'api_order_details', methods: ['GET'])]
    public function getOrderDetails($orderId, EntityManagerInterface $entityManager): JsonResponse
    {
        $order = $entityManager->getRepository(Order::class)->find($orderId);

        if (!$order) {
            return new JsonResponse(['error' => 'Commande non trouvée'], 404);
        }

        $user = $order->getUser();
        $orderAddress = $order->getOrderAddress();

        $orderItems = $order->getOrderItems();
        $orderItemsData = [];

        foreach ($orderItems as $item) {
            $orderItemsData[] = [
                'productName' => $item->getProductName(),
                'color' => $item->getColor(),
                'size' => $item->getSize(),
                'quantity' => $item->getQuantity(),
                'unitPrice' => $item->getUnitPrice(),
            ];
        }

        $orderData = [
            'id' => $order->getId(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('d/m/Y'),
            'totalPrice' => $order->getTotalPrice(),
            'ShippingCost' => $order->getShippingCost(),
            'totalWithShippingCost' => $order->getTotalWithShippingCost(),
            'firstName' => $user ? $user->getFirstName() : null,
            'lastName' => $user ? $user->getLastName() : null,
            'address' => $orderAddress ? [
                'name' => $orderAddress->getName(),
                'telephone' => $orderAddress->getTelephone(),
                'email' => $orderAddress->getEmail(),
                'address' => $orderAddress->getAddress(),
                'complement' => $orderAddress->getComplement(),
                'postalCode' => $orderAddress->getPostalCode(),
                'city' => $orderAddress->getCity(),
                'country' => $orderAddress->getCountry(),
            ] : null,
            'items' => $orderItemsData,
        ];

        return new JsonResponse($orderData);
    }
}