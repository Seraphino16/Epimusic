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
use App\Entity\Promotion;
use App\Repository\ProductRepository;
use App\Repository\ModelRepository;
use App\Repository\PromotionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class ProductAdminController extends AbstractController
{
    #[Route('/api/admin/products', name: 'api_products', methods: ['GET'])]
public function getProducts(EntityManagerInterface $entityManager): JsonResponse
{
    $now = new \DateTime();
    $products = $entityManager->getRepository(Product::class)->findAll();
    $data = [];

    foreach ($products as $product) {
        $models = [];

        $promotions = $entityManager->getRepository(Promotion::class)
            ->createQueryBuilder('p')
            ->where('p.product = :product')
            ->andWhere('p.start_date <= :now')
            ->andWhere('p.end_date >= :now')
            ->setParameter('product', $product)
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        $promoDetails = [];
        foreach ($promotions as $promotion) {
            if ($promotion->isActive()) {
                $promoDetails[] = [
                    'promo_price' => $promotion->getPromoPrice(),
                    'start_date' => $promotion->getStartDate()->format('Y-m-d'),
                    'end_date' => $promotion->getEndDate()->format('Y-m-d')
                ];
            }
        }

        foreach ($product->getModels() as $model) {
            $images = [];
            foreach ($model->getImage() as $image) {
                $images[] = [
                    'path' => $image->getPath(),
                    'is_main' => $image->isMain(),
                ];
            }

            $stock = $entityManager->getRepository(Stock::class)->findOneBy([
                'product' => $product,
                'color' => $model->getColor(),
                'size' => $model->getSize(),
            ]);
            $quantity = $stock ? $stock->getQuantity() : 0;

            $promoPrice = null;
            if (!empty($promoDetails)) {
                $promoPrice = $promoDetails[0]['promo_price'];
            }

            $models[] = [
                'model_id' => $model->getId(),
                'color' => $model->getColor() ? $model->getColor()->getName() : null,
                'size' => $model->getSize() ? $model->getSize()->getValue() : null,
                'price' => $model->getPrice(),
                'promo_price' => $promoPrice,
                'images' => $images,
                'weight' => $model->getWeight(),
                'stock' => $quantity,
            ];
        }

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
            'weight' => $product->getWeights()->first()?->getValue() ?? 0,
            'models' => $models,
            'stocks' => $stockData,
            'brands' => $brands,
            'tags' => $tags,
            'promotions' => $promoDetails,
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
        $model->setWeight($data['weight']);

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

    #[Route('/api/admin/addModel', name:'admin_add_new_product_model', methods: ['POST'])]
    public function addModel(
        Request $request, 
        ProductRepository $productRepository,
        ModelRepository $modelRepository, 
        EntityManagerInterface $entityManager): JsonResponse {

            $data = json_decode($request->getContent(), true);

            if (!isset($data['productId'], $data['price'], $data['stock'])) {
                return new JsonResponse(['error' => 'Requete invalide'],  Response::HTTP_BAD_REQUEST);
            }

            if ($data['price'] <= 0 || $data['stock'] < 0) {
                return new JsonResponse(['error' => 'Le prix doit être supérieur à zéro, le stock et le poids ne peuvent pas être négatifs !'], Response::HTTP_BAD_REQUEST);
            }

            $productId = $data['productId'];
            $product = $productRepository->find($productId);

            if (!$product) {
                return new JsonResponse(['error' => 'Produit non trouvé'], Response::HTTP_NOT_FOUND);
            }

            $color = isset($data['color']) ? $entityManager->getRepository(Color::class)->find($data['color']) : null;
            $size = isset($data['size']) ? $entityManager->getRepository(Size::class)->find($data['size']) : null;
    
            if (($data['color'] && !$color) || ($data['size'] && !$size)) {
                return new JsonResponse(['error' => 'Reference de taille et/ou de couleur non trouvées'],  Response::HTTP_NOT_FOUND);
            }

            $existingModel = $modelRepository->findOneBy([
                'product' => $product,
                'color' => $color,
                'size' => $size
            ]);

            if ($existingModel) {
                return new JsonResponse([
                    'error' => 'Ce modèle existe déjà. Veuillez le modifier.',
                    'existingModelId' => $existingModel->getId()
                ], Response::HTTP_CONFLICT);
            }

            $model = new Model();
            $model->setProduct($product);
            if ($color) $model->setColor($color);
            if ($size) $model->setSize($size);
            $model->setPrice($data['price']);
            $model->setWeight($data['weight']);

            $product->addModel($model);
            $entityManager->persist($model);
            $entityManager->persist($product);

            $photoPaths = $data['photoPaths'];
            foreach ($photoPaths as $index => $path) {
                $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($path);
                $fileExtension = pathinfo($originalFilePath, PATHINFO_EXTENSION);
                $uniqueId = uniqid();
                $newFileName = $product->getId() . '_' . $model->getId() . '_' . $index . '_' . $uniqueId . '.' . $fileExtension;
                $newFilePath = $this->getParameter('uploads_directory') . '/' . $newFileName;

                try {
                    rename($originalFilePath, $newFilePath);
                } catch (FileException $e) {
                    return new JsonResponse(['error' => 'Erreur lors du renommage du fichier'], Response::HTTP_INTERNAL_SERVER_ERROR);
                }
                $image = new Image();
                $image->setPath('/uploads/' . $newFileName);
                $image->setMain($index === $data['mainImageIndex']);
                $model->addImage($image);
                $entityManager->persist($image);
            }

            $stock = new Stock();
            $stock->setProduct($product);
            $stock->setQuantity($data['stock']);
            if ($color) $stock->setColor($color);
            if ($size) $stock->setSize($size);

            $entityManager->persist($stock);

            try {
                $entityManager->flush();
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Erreur lors de la création du modèle: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return new JsonResponse(['success' => 'Nouveau model créé avec succes'],  Response::HTTP_OK);
    }

    #[Route('/api/admin/model/{id}', name: 'api_model_get', methods: ['GET'])]
    public function getModel($id, EntityManagerInterface $entityManager): JsonResponse {
        $model = $entityManager->getRepository(Model::class)->find($id);

        if (!$model) {
            return new JsonResponse(['error' => 'Model not found'], JsonResponse::HTTP_NOT_FOUND);
        }

      
        $color = $model->getColor();
        $size = $model->getSize();

        $stock = $entityManager->getRepository(Stock::class)->findOneBy([
            'product' => $model->getProduct(),
            'color' => $color,
            'size' => $size,
        ]);
        $quantity = $stock ? $stock->getQuantity() : 0;

        $images = [];
        foreach ($model->getImage() as $image) {
            $images[] = [
                'path' => $image->getPath(),
                'is_main' => $image->isMain(),
            ];
        }

        $data = [
            'id' => $model->getId(),
            'color' => $color ? $color->getName() : null, 
            'size' => $size ? $size->getValue() : null, 
            'price' => $model->getPrice(),
            'weight' => $model ? $model->getWeight() : null,
            'stock' => $quantity,
            'images' => $images,
        ];

        return new JsonResponse($data);
    }

    #[Route('/api/admin/model/{id}', name: 'api_model_update', methods: ['PUT'])]
    public function updateModel($id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
     
        $model = $entityManager->getRepository(Model::class)->find($id);
        if (!$model) {
            return new JsonResponse(['error' => 'Model not found'], JsonResponse::HTTP_NOT_FOUND);
        }
    
    
        $product = $model->getProduct();
        if (!$product) {
            return new JsonResponse(['error' => 'Product not found'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $color = $model->getColor();
        $size = $model->getSize();
    
        $data = json_decode($request->getContent(), true);
        if (!isset($data['price'], $data['stock'], $data['weight'], $data['photoPaths'], $data['mainImageIndex'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }
    
        if ($data['price'] <= 0 || $data['stock'] < 0 || $data['weight'] < 0) {
            return new JsonResponse(['error' => 'The price must be greater than zero, stock and weight cannot be negative!'], 400);
        }
    
        $model->setPrice($data['price']);
        $model->setWeight($data['weight']);
        $color = isset($data['color']) ? $entityManager->getRepository(Color::class)->find($data['color']) : $model->getColor();
        $size = isset($data['size']) ? $entityManager->getRepository(Size::class)->find($data['size']) : $model->getSize();
    
        if (($data['color'] && !$color) || ($data['size'] && !$size)) {
            return new JsonResponse(['error' => 'Invalid references'], 404);
        }
    
        $model->setColor($color);
        $model->setSize($size);
    
        $stock = $entityManager->getRepository(Stock::class)->findOneBy([
            'product' => $product,
            'color' => $color,
            'size' => $size,
        ]);
    
        if ($stock) {
         
            $stock->setQuantity($data['stock']);
            $entityManager->persist($stock);
        } 
    

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
    
        foreach ($data['photoPaths'] as $index => $path) {
            $existingImage = $model->getImage()->filter(function ($image) use ($path) {
                return $image->getPath() === $path;
            })->first();
    
            if (!$existingImage) {
                if (!str_contains($path, '/uploads/')) {
                    $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($path);
                    $newFileName = $model->getId() . '_' . $index . '.' . pathinfo($originalFilePath, PATHINFO_EXTENSION);
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
                $existingImage->setMain($index === $data['mainImageIndex']);
            }
        }
    
       
        $entityManager->flush();
    
     
        return new JsonResponse([
            'id' => $model->getId(),
            'color' => $model->getColor() ? [
                'id' => $model->getColor()->getId(),
                'name' => $model->getColor()->getName()
            ] : null,
            'size' => $model->getSize() ? [
                'id' => $model->getSize()->getId(),
                'value' => $model->getSize()->getValue(),
                'unit' => $model->getSize()->getUnit()
            ] : null,
            'price' => $model->getPrice(),
            'weight' => $model->getWeight(),
            'stock' => $stock->getQuantity(),
            'images' => array_map(function ($image) {
                return [
                    'path' => $image->getPath(),
                    'is_main' => $image->isMain(),
                ];
            }, $model->getImage()->toArray())
        ]);
    }
    


}