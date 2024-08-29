<?php

namespace App\Controller;

use App\Entity\Order;
use App\Controller\CartController;
use App\Entity\OrderItems;
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
        $userId = isset($data['user_id']) ? (int)$data['user_id'] : null;
        $token = isset($data['token']) ? $data['token'] : null;

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

        $order = new Order();
        $order->setStatus('pending');
        $order->setPaymentStatus('pending');

        $orderTotal = 0;

        foreach ($cartItems as $cartItem) {
            $orderItem = new OrderItems();


            $quantity = $cartItem->getQuantity();
            $unitPrice = $cartItem->getModel()->getPrice();

            $totalItem = $quantity * $unitPrice;

            $orderTotal += $totalItem;

            $formattedTotal = number_format($totalItem, 2, '.', '');

            $orderItem->setProductName($cartItem->getProduct()->getName());
            $orderItem->setColor($cartItem->getModel()->getColor());
            $orderItem->setQuantity($quantity);
            $orderItem->setUnitPrice($unitPrice);
            $orderItem->setTotalPrice($formattedTotal);
            $orderItem->setGiftWrap(false);

            $order->addOrderItem($orderItem);
        }

        $formattedOrderTotal = number_format($orderTotal, 2, '.', '');
        $order->setTotalPrice($formattedOrderTotal);

        $now = new DateTime();
        $order->setCreatedAt($now);
        $order->setUpdatedAt($now);

        $this->entityManager->persist($order);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Commande créée avec succès', 'orderId' => $order->getId()], Response::HTTP_CREATED);
        // return new JsonResponse(['message' => 'Commande créée avec succès', 'orderId' => 12345], Response::HTTP_CREATED);
    }
}
