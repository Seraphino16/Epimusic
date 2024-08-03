<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Category;
use App\Entity\Color;
use App\Entity\Size;
use App\Entity\Image;
use App\Entity\Model;
use App\Entity\Stock;
use App\Entity\Brand;
use App\Entity\Tag;
use App\Entity\Weight;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

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

            $brands = $product->getCategory()->getId() === 1
                ? $product->getBrands()->map(fn($brand) => $brand->getName())->toArray()
                : [];

            $tags = $product->getTags()->map(fn($tag) => $tag->getName())->toArray();

            $data[] = [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'category' => $product->getCategory()->getName(),
                'weight' => $product->getWeights()[0]->getValue(),
                'models' => $models,
                'stocks' => $stockData,
                'brands' => $brands,
                'tags' => $tags,
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/admin/products', name: 'api_products_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['category'], $data['name'], $data['description'], $data['price'], $data['stock'], $data['weight'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        if ($data['price'] <= 0 || $data['stock'] < 0 || $data['weight'] < 0) {
            return new JsonResponse(['error' => 'Le prix doit être supérieur à zéro, le stock et le poids ne peuvent pas être négatifs !'], 400);
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

        // Persist the product to get its ID
        $entityManager->persist($product);
        $entityManager->flush();

        // Create a new model
        $model = new Model();
        $model->setProduct($product);
        if ($color) $model->setColor($color);
        if ($size) $model->setSize($size);
        $model->setPrice($data['price']);

        $entityManager->persist($model);

        // Handle weight
        $weight = new Weight();
        $weight->setValue($data['weight']);
        $weight->setProduct($product);

        $entityManager->persist($weight);

        // Handle photo paths
        $photoPaths = $data['photoPaths'];
        foreach ($photoPaths as $index => $path) {
            $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($path);
            $newFileName = $product->getId() . '_' . $index . '.' . pathinfo($originalFilePath, PATHINFO_EXTENSION);
            $newFilePath = $this->getParameter('uploads_directory') . '/' . $newFileName;

            try {
                rename($originalFilePath, $newFilePath);
            } catch (FileException $e) {
                return new JsonResponse(['error' => 'Failed to rename file'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $image = new Image();
            $image->setPath('/uploads/' . $newFileName);
            $image->setMain($index === $data['mainImageIndex']);
            $model->addImage($image);
            $entityManager->persist($image);
        }

        // Handle stock
        $stock = new Stock();
        $stock->setProduct($product);
        $stock->setQuantity($data['stock']);
        if ($color) $stock->setColor($color);
        if ($size) $stock->setSize($size);

        $entityManager->persist($stock);

        // Handle brand
        if ($category->getId() == 1 && isset($data['brand'])) {
            $brand = new Brand();
            $brand->setName($data['brand']);
            $brand->setProduct($product);
            $entityManager->persist($brand);
        }

        // Handle tags
        foreach ($data['tags'] as $tagName) {
            $tag = new Tag();
            $tag->setName($tagName);
            $tag->setProduct($product);
            $entityManager->persist($tag);
        }

        $entityManager->flush();

        return new JsonResponse(['id' => $product->getId()], 201);
    }

    #[Route('/api/admin/products/{id}', name: 'api_product_delete', methods: ['DELETE'])]
    public function delete(Product $product, EntityManagerInterface $entityManager): JsonResponse
    {
        // Remove the product images from the file system and the database
        foreach ($product->getModels() as $model) {
            foreach ($model->getImage() as $image) {
                $imagePath = $this->getParameter('uploads_directory') . '/' . basename($image->getPath());
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
                $entityManager->remove($image); // Remove image from the database
            }
        }

        // Remove related brands and tags
        foreach ($product->getBrands() as $brand) {
            $entityManager->remove($brand);
        }

        foreach ($product->getTags() as $tag) {
            $entityManager->remove($tag);
        }

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

        $brands = $product->getBrands()->map(fn($brand) => $brand->getName())->toArray();
        $tags = $product->getTags()->map(fn($tag) => $tag->getName())->toArray();

        $weight = $product->getWeights()->first() ? $product->getWeights()->first()->getValue() : 0;

        $data = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'category' => $product->getCategory()->getName(),
            'category_id' => $product->getCategory()->getId(),
            'weight' => $weight,
            'models' => $models,
            'stocks' => $stockData,
            'brands' => $brands,
            'tags' => $tags,
        ];

        return new JsonResponse($data);
    }

    #[Route('/api/admin/products/{id}', name: 'api_product_update', methods: ['PUT'])]
    public function update(Request $request, Product $product, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['category'], $data['name'], $data['description'], $data['price'], $data['photoPaths'], $data['mainImageIndex'], $data['stock'], $data['weight'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        if ($data['price'] <= 0 || $data['stock'] < 0 || $data['weight'] < 0) {
            return new JsonResponse(['error' => 'Le prix doit être supérieur à zéro, le stock et le poids ne peuvent pas être négatifs !'], 400);
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
        $model = $product->getModels()[0];
        if ($color) $model->setColor($color);
        if ($size) $model->setSize($size);
        $model->setPrice($data['price']);

        // Clear existing images and delete them from the file system
        foreach ($model->getImage() as $image) {
            if (!in_array($image->getPath(), $data['photoPaths'])) {
                $existingImagePath = $this->getParameter('uploads_directory') . '/' . basename($image->getPath());
                if (file_exists($existingImagePath)) {
                    unlink($existingImagePath);
                }
                $model->removeImage($image);
                $entityManager->remove($image);
            }
        }

        // Handle new photo paths
        foreach ($data['photoPaths'] as $index => $path) {
            // Check if the image already exists in the database
            $existingImage = $model->getImage()->filter(function ($image) use ($path) {
                return $image->getPath() === $path;
            })->first();

            if (!$existingImage) {
                if (!str_contains($path, '/uploads/')) {
                    $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($path);
                    $newFileName = $product->getId() . '_' . $index . '.' . pathinfo($originalFilePath, PATHINFO_EXTENSION);
                    $newFilePath = $this->getParameter('uploads_directory') . '/' . $newFileName;

                    try {
                        rename($originalFilePath, $newFilePath);
                    } catch (FileException $e) {
                        return new JsonResponse(['error' => 'Failed to rename file'], Response::HTTP_INTERNAL_SERVER_ERROR);
                    }

                    $path = '/uploads/' . $newFileName;
                }

                $image = new Image();
                $image->setPath($path);
                $image->setMain($index === $data['mainImageIndex']);
                $model->addImage($image);
                $entityManager->persist($image);
            } else {
                // If the image exists, just update the main flag
                $existingImage->setMain($index === $data['mainImageIndex']);
            }
        }

        // Handle stock
        $stock = $product->getStocks()[0];
        $stock->setQuantity($data['stock']);
        if ($color) $stock->setColor($color);
        if ($size) $stock->setSize($size);

        $entityManager->persist($stock);

        // Update brand
        foreach ($product->getBrands() as $brand) {
            $entityManager->remove($brand);
        }
        if ($data['category'] == 1 && isset($data['brand'])) {
            $brand = new Brand();
            $brand->setName($data['brand']);
            $brand->setProduct($product);
            $entityManager->persist($brand);
        }

        // Update tags
        foreach ($product->getTags() as $tag) {
            $entityManager->remove($tag);
        }
        foreach ($data['tags'] as $tagName) {
            $tag = new Tag();
            $tag->setName($tagName);
            $tag->setProduct($product);
            $entityManager->persist($tag);
        }

        // Handle weight
        $weight = $entityManager->getRepository(Weight::class)->findOneBy(['product' => $product]);
        if ($weight) {
            $weight->setValue($data['weight']);
        } else {
            $weight = new Weight();
            $weight->setValue($data['weight']);
            $weight->setProduct($product);
            $entityManager->persist($weight);
        }

        $entityManager->persist($product);
        $entityManager->persist($model);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Product updated'], 200);
    }

    // New endpoint to rename uploaded files
    #[Route('/rename-upload', name: 'rename_upload', methods: ['POST'])]
    public function renameUpload(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['oldPath'], $data['newPath'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        $uploadsDirectory = $this->getParameter('uploads_directory');
        $oldFilePath = $uploadsDirectory . '/' . basename($data['oldPath']);
        $newFilePath = $uploadsDirectory . '/' . basename($data['newPath']);

        try {
            rename($oldFilePath, $newFilePath);
        } catch (FileException $e) {
            return new JsonResponse(['error' => 'Failed to rename file'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['status' => 'File renamed'], 200);
    }
}