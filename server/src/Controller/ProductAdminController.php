<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Category;
use App\Entity\Color;
use App\Entity\Size;
use App\Entity\Image;
use App\Entity\Model;
use App\Entity\Stock;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ProductAdminController extends AbstractController
{
    #[Route('/api/admin/products', name: 'api_products', methods: ['GET'])]
    public function getProducts(EntityManagerInterface $entityManager): JsonResponse
    {
        $products = $entityManager->getRepository(Product::class)->findAll();
        $data = [];

        foreach ($products as $product) {
            $models = [];
            foreach ($product->getModels() as $model) {
                $images = [];
                foreach ($model->getImage() as $image) {
                    $images[] = [
                        'path' => $image->getPath(),
                        'is_main' => $image->isMain(),
                    ];
                }
                $models[] = [
                    'color' => $model->getColor() ? $model->getColor()->getName() : null,
                    'size' => $model->getSize() ? $model->getSize()->getValue() : null,
                    'price' => $model->getPrice(),
                    'images' => $images,
                ];
            }

            $data[] = [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'category' => $product->getCategory()->getName(),
                'models' => $models,
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/admin/products', name: 'api_products_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['category'], $data['name'], $data['description'], $data['price'], $data['photoPaths'], $data['mainImageIndex'], $data['quantity'])) {
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

        // Handle stock
        $stock = new Stock();
        $stock->setProduct($product);
        $stock->setQuantity($data['quantity']);
        if ($color) $stock->setColor($color);
        if ($size) $stock->setSize($size);

        $entityManager->persist($stock);
        $entityManager->flush();

        return new JsonResponse(['id' => $product->getId()], 201);
    }

    #[Route('/api/admin/products/{id}', name: 'api_product_delete', methods: ['DELETE'])]
    public function delete(Product $product, EntityManagerInterface $entityManager): JsonResponse
    {
        $entityManager->remove($product);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Product deleted'], 200);
    }

    #[Route('/api/admin/products/{id}', name: 'api_product_get', methods: ['GET'])]
    public function getProduct(Product $product): JsonResponse
    {
        $models = [];
        foreach ($product->getModels() as $model) {
            $images = [];
            foreach ($model->getImage() as $image) {
                $images[] = [
                    'path' => $image->getPath(),
                    'is_main' => $image->isMain(),
                ];
            }
            $models[] = [
                'color' => $model->getColor()?->getName(),
                'size' => $model->getSize()?->getValue(),
                'price' => $model->getPrice(),
                'images' => $images,
            ];
        }

        // Get stock details
        $stocks = $product->getStocks();
        $stockData = [];
        foreach ($stocks as $stock) {
            $stockData[] = [
                'color' => $stock->getColor()?->getName(),
                'size' => $stock->getSize()?->getValue(),
                'quantity' => $stock->getQuantity(),
            ];
        }

        $data = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'category' => $product->getCategory()->getName(),
            'category_id' => $product->getCategory()->getId(), // Needed for the form
            'models' => $models,
            'stocks' => $stockData,
        ];

        return new JsonResponse($data);
    }

    #[Route('/api/admin/products/{id}', name: 'api_product_update', methods: ['PUT'])]
    public function update(Request $request, Product $product, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['category'], $data['name'], $data['description'], $data['price'], $data['photoPaths'], $data['mainImageIndex'], $data['quantity'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        $category = $entityManager->getRepository(Category::class)->find($data['category']);
        $color = isset($data['color']) ? $entityManager->getRepository(Color::class)->find($data['color']) : null;
        $size = isset($data['size']) ? $entityManager->getRepository(Size::class)->find($data['size']) : null;

        if (!$category || ($data['color'] && !$color) || ($data['size'] && !$size)) {
            return new JsonResponse(['error' => 'Invalid references'], 404);
        }

        $product->setName($data['name']);
        $product->setDescription($data['description']);
        $product->setCategory($category);

        // Update the model
        $model = $product->getModels()[0]; // Assuming there is only one model per product
        if ($color) $model->setColor($color);
        if ($size) $model->setSize($size);
        $model->setPrice($data['price']);

        // Clear existing images
        foreach ($model->getImage() as $image) {
            $model->removeImage($image);
            $entityManager->remove($image);
        }

        // Handle photo paths
        foreach ($data['photoPaths'] as $index => $path) {
            $image = new Image();
            $image->setPath($path);
            $image->setMain($index === $data['mainImageIndex']);
            $model->addImage($image);
            $entityManager->persist($image);
        }

        // Update the stock
        $stock = $entityManager->getRepository(Stock::class)->findOneBy([
            'product' => $product,
            'color' => $color,
            'size' => $size,
        ]);

        if (!$stock) {
            $stock = new Stock();
            $stock->setProduct($product);
            if ($color) $stock->setColor($color);
            if ($size) $stock->setSize($size);
        }

        $stock->setQuantity($data['quantity']);

        $entityManager->persist($product);
        $entityManager->persist($model);
        $entityManager->persist($stock);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Product updated'], 200);
    }
}