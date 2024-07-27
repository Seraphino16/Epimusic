<?php
// src/Controller/ProductController.php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Category;
use App\Entity\Color;
use App\Entity\Size;
use App\Entity\Image;
use App\Entity\Model;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ProductController extends AbstractController
{
    #[Route('/api/products', name: 'api_products', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['category'], $data['name'], $data['description'], $data['price'], $data['photoPaths'], $data['mainImageIndex'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        $category = $entityManager->getRepository(Category::class)->find($data['category']);
        $color = isset($data['color']) ? $entityManager->getRepository(Color::class)->find($data['color']) : null;
        $size = isset($data['size']) ? $entityManager->getRepository(Size::class)->find($data['size']) : null;

        if (!$category || ($data['color'] && !$color) || ($data['size'] && !$size)) {
            return new JsonResponse(['error' => 'Invalid references'], 404);
        }

        $product = new Product();
        $product->setName($data['name']);
        $product->setDescription($data['description']);
        $product->setCategory($category);

        // Create a new model
        $model = new Model();
        $model->setProduct($product);
        if ($color) $model->setColor($color);
        if ($size) $model->setSize($size);
        $model->setPrice($data['price']);

        $entityManager->persist($product);
        $entityManager->persist($model);

        // Handle photo paths
        foreach ($data['photoPaths'] as $index => $path) {
            $image = new Image();
            $image->setPath($path);
            $image->setMain($index === $data['mainImageIndex']);
            $model->addImage($image);
            $entityManager->persist($image);
        }

        $entityManager->flush();

        return new JsonResponse(['id' => $product->getId()], 201);
    }
}