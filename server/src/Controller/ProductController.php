<?php
// src/Controller/ProductController.php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Category;
use App\Entity\Color;
use App\Entity\Size;
use App\Entity\Model; // Assurez-vous que cette ligne est présente
use App\Entity\Image; // Assurez-vous que cette ligne est présente
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

        if (!isset($data['category'], $data['color'], $data['size'], $data['name'], $data['description'], $data['price'], $data['imagePath'], $data['isMainImage'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        $category = $entityManager->getRepository(Category::class)->find($data['category']);
        $color = $entityManager->getRepository(Color::class)->find($data['color']);
        $size = $entityManager->getRepository(Size::class)->find($data['size']);

        if (!$category || !$color || !$size) {
            return new JsonResponse(['error' => 'Invalid references'], 404);
        }

        $product = new Product();
        $product->setName($data['name']);
        $product->setDescription($data['description']);
        $product->setCategory($category);

        // Create a new model
        $model = new Model();
        $model->setProduct($product);
        $model->setColor($color);
        $model->setSize($size);
        $model->setPrice($data['price']);

        // Create a new image
        $image = new Image();
        $image->setPath($data['imagePath']);
        $image->setMain($data['isMainImage']);
        $model->addImage($image);

        $entityManager->persist($product);
        $entityManager->persist($model);
        $entityManager->persist($image);
        $entityManager->flush();

        return new JsonResponse(['id' => $product->getId()], 201);
    }
}