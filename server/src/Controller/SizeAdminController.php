<?php
// src/Controller/SizeAdminController.php

namespace App\Controller;

use App\Entity\Size;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class SizeAdminController extends AbstractController
{
    #[Route('/api/admin/sizes', name: 'api_sizes', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $sizes = $entityManager->getRepository(Size::class)->findAll();
        $data = [];

        foreach ($sizes as $size) {
            $data[] = [
                'id' => $size->getId(),
                'name' => $size->getName(),
            ];
        }

        return new JsonResponse($data);
    }
}