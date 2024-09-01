<?php

namespace App\Controller;

use App\Entity\Address;
use App\Entity\User;
use App\Repository\AddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AddressController extends AbstractController
{
    #[Route('/api/user/{userId}/addresses', name: 'api_user_addresses', methods: ['GET'])]
    public function getUserAddresses($userId, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $addresses = $entityManager->getRepository(Address::class)->findBy(['user' => $user]);

        $data = [];
        foreach ($addresses as $address) {
            $data[] = [
                'id' => $address->getId(),
                'name' => $address->getName(),
                'telephone' => $address->getTelephone(),
                'address' => $address->getAddress(),
                'complement' => $address->getComplement(),
                'postalCode' => $address->getPostalCode(),
                'city' => $address->getCity(),
                'country' => $address->getCountry(),
                'isPrimary' => $address->isPrimary(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/user/{userId}/addresses', name: 'api_address_create', methods: ['POST'])]
    public function create($userId, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'], $data['telephone'], $data['address'], $data['postalCode'], $data['city'], $data['country'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        if (isset($data['isPrimary']) && $data['isPrimary'] === true) {
            $existingAddresses = $entityManager->getRepository(Address::class)->findBy(['user' => $user]);
            foreach ($existingAddresses as $existingAddress) {
                $existingAddress->setIsPrimary(false);
                $entityManager->persist($existingAddress);
            }
        }

        $address = new Address();
        $address->setName($data['name']);
        $address->setTelephone($data['telephone']);
        $address->setAddress($data['address']);
        $address->setComplement($data['complement'] ?? null);
        $address->setPostalCode($data['postalCode']);
        $address->setCity($data['city']);
        $address->setCountry($data['country']);
        $address->setIsPrimary($data['isPrimary'] ?? false);

        $address->setUser($user);

        $entityManager->persist($address);
        $entityManager->flush();

        return new JsonResponse(['id' => $address->getId()], 201);
    }

    #[Route('/api/user/{userId}/addresses/{id}', name: 'api_address_delete', methods: ['DELETE'])]
    public function deleteAddress($userId, Address $address, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($address->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Address does not belong to this user'], 403);
        }

        $wasPrimary = $address->isPrimary();

        $entityManager->remove($address);
        $entityManager->flush();

        if ($wasPrimary) {
            $otherAddresses = $entityManager->getRepository(Address::class)->findBy(['user' => $user]);
            if (count($otherAddresses) > 0) {
                $newPrimaryAddress = $otherAddresses[0];
                $newPrimaryAddress->setIsPrimary(true);
                $entityManager->persist($newPrimaryAddress);
                $entityManager->flush();
            }
        }

        return new JsonResponse(['status' => 'Address deleted'], 200);
    }

    #[Route('/api/user/{userId}/addresses/{id}', name: 'api_address_get', methods: ['GET'])]
    public function getAddress($userId, Address $address, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($address->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Address does not belong to this user'], 403);
        }

        $data = [
            'id' => $address->getId(),
            'name' => $address->getName(),
            'telephone' => $address->getTelephone(),
            'address' => $address->getAddress(),
            'complement' => $address->getComplement(),
            'postalCode' => $address->getPostalCode(),
            'city' => $address->getCity(),
            'country' => $address->getCountry(),
            'isPrimary' => $address->isPrimary(),
        ];

        return new JsonResponse($data);
    }

    #[Route('/api/user/{userId}/addresses/{id}', name: 'api_address_update', methods: ['PUT'])]
    public function updateAddress($userId, Request $request, Address $address, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($address->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Address does not belong to this user'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'], $data['telephone'], $data['address'], $data['postalCode'], $data['city'], $data['country'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        if (isset($data['isPrimary']) && $data['isPrimary']) {
           
            $existingAddresses = $entityManager->getRepository(Address::class)->findBy(['user' => $user]);
            foreach ($existingAddresses as $existingAddress) {
                if ($existingAddress->isPrimary()) {
                    $existingAddress->setIsPrimary(false);
                    $entityManager->persist($existingAddress);
                }
            }
        }

        $address->setName($data['name']);
        $address->setTelephone($data['telephone']);
        $address->setAddress($data['address']);
        $address->setComplement($data['complement'] ?? null);
        $address->setPostalCode($data['postalCode']);
        $address->setCity($data['city']);
        $address->setCountry($data['country']);
        $address->setIsPrimary($data['isPrimary'] ?? false);

        $entityManager->persist($address);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Address updated'], 200);
    }

    #[Route('/api/user/{userId}/addresses/{id}/set-primary', name: 'api_address_set_primary', methods: ['PATCH'])]
    public function setPrimaryAddress($userId, Address $address, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($address->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Address does not belong to this user'], 403);
        }

        $existingAddresses = $entityManager->getRepository(Address::class)->findBy(['user' => $user]);
        foreach ($existingAddresses as $existingAddress) {
            if ($existingAddress->isPrimary()) {
                $existingAddress->setIsPrimary(false);
                $entityManager->persist($existingAddress);
            }
        }

        $address->setIsPrimary(true);
        $entityManager->persist($address);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Address set as primary'], 200);
    }
}