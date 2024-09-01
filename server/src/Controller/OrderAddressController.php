<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderAddress;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class OrderAddressController extends AbstractController
{
    #[Route('/api/order/{orderId}/address', name: 'save_order_address', methods: ['POST'])]
    public function saveOrderAddress(
        int $orderId,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $order = $entityManager->getRepository(Order::class)->find($orderId);

        if (!$order) {
            return new JsonResponse(['error' => 'Order not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $orderAddress = new OrderAddress();
        $orderAddress->setName($data['name']);
        $orderAddress->setTelephone($data['telephone']);
        $orderAddress->setEmail($data['email']);
        $orderAddress->setAddress($data['address']);
        $orderAddress->setComplement($data['complement'] ?? null);
        $orderAddress->setPostalCode($data['postalCode']);
        $orderAddress->setCity($data['city']);
        $orderAddress->setCountry($data['country']);
        $orderAddress->setOrder($order);

        $entityManager->persist($orderAddress);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Address saved successfully'], 201);
    }
}