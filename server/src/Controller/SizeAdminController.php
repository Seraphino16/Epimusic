<?php
// src/Controller/SizeAdminController.php

namespace App\Controller;

use App\Entity\Category;
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
                'value' => $size->getValue(),
                'unit' => $size->getUnit(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/admin/sizes/category/{categoryId}', name: 'api_sizes_by_category', methods: ['GET'])]
    public function getSizesByCategory(EntityManagerInterface $entityManager, int $categoryId): JsonResponse
    {
        $category = $entityManager->getRepository(Category::class)->find($categoryId);

        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], 404);
        }

        $sizes = $category->getSizes();
        $data = [];

        foreach ($sizes as $size) {
            $data[] = [
                'id' => $size->getId(),
                'value' => $size->getValue(),
                'unit' => $size->getUnit(),
            ];
        }

        return new JsonResponse($data);
    }
}