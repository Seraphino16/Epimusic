<?php

namespace App\Controller;

use App\Entity\Order;
use App\Controller\CartController;
use App\Entity\OrderItems;
use App\Entity\Stock;
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
use JsonSerializable;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

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
        $order->setStatus('Pending');
        $order->setPaymentStatus('Pending');
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
            $orderItem->setGiftWrap($cartItem->isGiftWrap());
            $orderItem->setProduct($cartItem->getProduct());
            $order->addOrderItem($orderItem);
        }

        $formattedOrderTotal = number_format($orderTotal, 2, '.', '');
        $formatOrderTotalWithPromo = number_format($orderTotalWithPromo, 2, '.', '');
        $order->setTotalPrice($formattedOrderTotal);
        $order->setTotalWithPromo($formatOrderTotalWithPromo);

        $now = new DateTime();
        $order->setCreatedAt($now);
        $order->setUpdatedAt($now);

     
        if (isset($user)) {
            $order->setUser($user);
        }

        $this->entityManager->persist($order);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Commande créée avec succès', 'orderId' => $order->getId()], Response::HTTP_CREATED);
    }

    #[Route('/{orderId}', name: 'get_order_by_id', methods: ['GET'])]
    public function getOrderById(int $orderId, SerializerInterface $serializer): JsonResponse
    {
        $order = $this->entityManager->getRepository(Order::class)
            ->find($orderId);

        if (!$order) {
            return new JsonResponse(['error' => 'Order not found', 404]);
        }

        $orderItems = $order->getOrderItems();
        $orderItemsCount = 0;

        foreach ($orderItems as $orderItem) {
            $orderItemsCount += $orderItem->getQuantity();
        }

        $data = [
            'totalPrice' => $order->getTotalPrice(),
            'shippingCost' => $order->getShippingCost(),
            'totalWithPromo' => $order->getTotalWithPromo(),
            'totalWithShippingCost' => $order->getTotalWithShippingCost(),
            'itemsQuantity' => $orderItemsCount,
            'status' => $order->getStatus()
        ];

        return new JsonResponse($data);
    }

    #[Route('/validate/{orderId}', name: 'validate_order', methods: ['PATCH'])]
    public function validateOrder(int $orderId): JsonResponse
    {
        $order = $this->entityManager->getRepository(Order::class)
            ->find($orderId);

        $order->setStatus('En préparation');
        $order->setPaymentMethod('Credit Card');
        $order->setUpdatedAt(new \DateTime());

        $orderItems = $order->getOrderItems();
        foreach ($orderItems as $orderItem) {
            $soldQuantity = $orderItem->getQuantity();

            $product = $orderItem->getProduct();

            $color = $orderItem->getColor();
            $size = $orderItem->getSize();

            $criteria = ['product' => $product];
            if ($color !== null) {
                $criteria['color'] = $color;
            }
            if ($size !== null) {
                $criteria['size'] = $size;
            }

            $stock = $this->entityManager->getRepository(Stock::class)
                ->findOneBy($criteria);

            $newQuantity = $stock->getQuantity() - $soldQuantity;

            if ($newQuantity < 0) {
                return new JsonResponse(['error' => "Ce produit n'est pas disponible pour cette quantité"], 400);
            }

            $stock->setQuantity($newQuantity);
            $this->entityManager->persist($stock);
        }

        $this->entityManager->persist($order);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true]);
    }
  
    #[Route('/{userId}/orders', name: 'api_user_orders', methods: ['GET'])]
    public function getUserOrders($userId, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        $queryBuilder = $entityManager->getRepository(Order::class)->createQueryBuilder('o');

        $queryBuilder
            ->where('o.user = :user')
            ->andWhere('o.status != :status')
            ->setParameter('user', $user)
            ->setParameter('status', 'pending');

        $orders = $queryBuilder->getQuery()->getResult();

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
    public function getOrderDetails($orderId): JsonResponse
    {
        $order = $this->entityManager->getRepository(Order::class)->find($orderId);

        if (!$order) {
            return new JsonResponse(['error' => 'Commande non trouvée'], 404);
        }

        $user = $order->getUser();
        $primaryBillingAddress = null;
        $deliveryAddress = $order->getOrderAddress();

        foreach ($user->getAddresses() as $address) {
            if ($address->isPrimary()) {
                $primaryBillingAddress = $address;
                break;
            }
        }

        $orderItems = $order->getOrderItems();
        $orderItemsData = [];

        foreach ($orderItems as $item) {
            $orderItemsData[] = [
                'productName' => $item->getProductName(),
                'color' => $item->getColor(),
                'size' => $item->getSize(),
                'quantity' => $item->getQuantity(),
                'unitPrice' => $item->getUnitPrice(),
                'totalPrice' => $item->getTotalPrice(),
                'discount' => $item->getTotalPromoPrice() ? $item->getTotalPromoPrice() : null,
            ];
        }

        $orderData = [
            'id' => $order->getId(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('d/m/Y'),
            'dueDate' => $order->getCreatedAt()->modify('+30 days')->format('d/m/Y'),
            'subTotal' => $order->getTotalPrice(),
            'vatAmount' => $order->getTotalPrice() * 0.2,
            'ShippingCost' => $order->getShippingCost(),
            'totalWithShippingCost' => $order->getTotalWithShippingCost(),
            'totalPrice' => $order->getTotalWithShippingCost(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'billingAddress' => $primaryBillingAddress ? [
                'name' => $primaryBillingAddress->getName(),
                'telephone' => $primaryBillingAddress->getTelephone(),
                'address' => $primaryBillingAddress->getAddress(),
                'complement' => $primaryBillingAddress->getComplement(),
                'postalCode' => $primaryBillingAddress->getPostalCode(),
                'city' => $primaryBillingAddress->getCity(),
                'country' => $primaryBillingAddress->getCountry(),
            ] : null,
            'deliveryAddress' => $deliveryAddress ? [
                'name' => $deliveryAddress->getName(),
                'telephone' => $deliveryAddress->getTelephone(),
                'email' => $deliveryAddress->getEmail(),
                'address' => $deliveryAddress->getAddress(),
                'complement' => $deliveryAddress->getComplement(),
                'postalCode' => $deliveryAddress->getPostalCode(),
                'city' => $deliveryAddress->getCity(),
                'country' => $deliveryAddress->getCountry(),
            ] : null,
            'items' => $orderItemsData,
        ];

        return new JsonResponse($orderData);
    }
}
