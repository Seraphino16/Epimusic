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
use App\Entity\AdminOrder;
use App\Entity\AdminOrderItem;
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

      
        $entityManager->persist($product);
        $entityManager->flush();

        $model = new Model();
        $model->setProduct($product);
        if ($color) $model->setColor($color);
        if ($size) $model->setSize($size);
        $model->setPrice($data['price']);

        $entityManager->persist($model);

        $weight = new Weight();
        $weight->setValue($data['weight']);
        $weight->setProduct($product);

        $entityManager->persist($weight);

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


        $stock = new Stock();
        $stock->setProduct($product);
        $stock->setQuantity($data['stock']);
        if ($color) $stock->setColor($color);
        if ($size) $stock->setSize($size);

        $entityManager->persist($stock);


        if ($category->getId() == 1 && isset($data['brand'])) {
            $brand = new Brand();
            $brand->setName($data['brand']);
            $brand->setProduct($product);
            $entityManager->persist($brand);
        }


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
       
        foreach ($product->getModels() as $model) {
            foreach ($model->getImage() as $image) {
                $imagePath = $this->getParameter('uploads_directory') . '/' . basename($image->getPath());
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
                $entityManager->remove($image); 
            }
        }

      
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
    public function getProduct(EntityManagerInterface $entityManager, ProductRepository $productRepository, $id): JsonResponse
    {   
    
        $product = $productRepository->find($id);
        $now = new \DateTime();
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

        if (!$product) {
            return $this->json(['error' => 'The product does not exist'], 404);
        }

        $category = $product->getCategory();
        $categoryData =  [
            'id' => $category->getId(),
            'name' => $category->getName()
        ];

        $models = [];
        foreach ($product->getModels() as $model) {
            $images = [];
            foreach ($model->getImage() as $image) {
                $images[] = [
                    'path' => $image->getPath(),
                    'is_main' => $image->isMain()
                ];
            }

            $stock = $entityManager->getRepository(Stock::class)->findOneBy([
                'product' => $product,
                'color' => $model->getColor(),
                'size' => $model->getSize()
            ]);
            $quantity = $stock ? $stock->getQuantity() : 0;

            $models[] = [
                'model_id' => $model->getId(),
                'color_id' => $model->getColor() ? $model->getColor()->getId() : null,
                'size_id' => $model->getSize() ? $model->getSize()->getId() : null,
                'price' => $model->getPrice(),
                'images' => $images,
                'stock' => $quantity
            ];
        
        }

        $data = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'category' => $categoryData,
            'weight' => $product->getWeights()->first()?->getValue() ?? 0,
            'models' => $models,
            'promotions' => $promoDetails,
        ];

        return $this->json($data);
    }

    #[Route('/api/admin/products/{id}', name: 'api_product_update', methods: ['PUT'])]
public function update(Request $request, Product $product, EntityManagerInterface $entityManager): JsonResponse
{
    $data = json_decode($request->getContent(), true);

    if (!isset($data['category'], $data['name'], $data['description'], $data['models'])) {
        return new JsonResponse(['error' => 'Invalid data'], 400);
    }

    $category = $entityManager->getRepository(Category::class)->find($data['category']);

    $product->setName($data['name']);
    $product->setDescription($data['description']);
    $product->setCategory($category);
    if ($data['weight'] < 0) {
        return new JsonResponse(['error' => 'Le poids ne peut pas être négatifs !'], 400);
    }

    $weight = $entityManager->getRepository(Weight::class)->findOneBy(['product' => $product]);
    if ($weight) {
        $weight->setValue($data['weight']);
    } else {
        $weight = new Weight();
        $weight->setValue($data['weight']);
        $weight->setProduct($product);
        $entityManager->persist($weight);
    }

    $existingModels = $product->getModels();

 
    $newStocks = [];

    foreach ($data['models'] as $index => $modelData) {
        if (!isset($modelData['price']) ||
            !isset($modelData['stock']) ||
            !isset($modelData['photoPaths']) ||
            !isset($modelData['mainImageIndex'])) {
            return new JsonResponse(['error' => 'Invalid model data'], 400);
        }

        if ($modelData['price'] <= 0 || $modelData['stock'] < 0) {
            return new JsonResponse(['error' => 'Le prix doit être supérieur à zéro et le stock ne peut pas être négatifs !'], 400);
        }

      
        $model = $index < count($existingModels) ? $existingModels[$index] : new Model();
        if (!$model->getId()) {
            $product->addModel($model);
        }

        $color = isset($modelData['color']) ? $entityManager->getRepository(Color::class)->find($modelData['color']) : null;
        $size = isset($modelData['size']) ? $entityManager->getRepository(Size::class)->find($modelData['size']) : null;

        $model->setColor($color);
        $model->setSize($size);
        $model->setPrice($modelData['price']);

      
        foreach ($model->getImage() as $image) {
            if (!in_array($image->getPath(), $modelData['photoPaths'])) {
                $existingImagePath = $this->getParameter('uploads_directory') . '/' . basename($image->getPath());
                if (file_exists($existingImagePath)) {
                    unlink($existingImagePath);
                }
                $model->removeImage($image);
                $entityManager->remove($image);
            }
        }

        foreach ($modelData['photoPaths'] as $index => $path) {
            $existingImage = $model->getImage()->filter(fn($image) => $image->getPath() === $path)->first();
            if (!$existingImage) {
                if (!str_contains($path, '/uploads/')) {
                    $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($path);
                    $newFileName = $product->getId() . '_' . $model->getId() . '_' . $index . '.' . pathinfo($originalFilePath, PATHINFO_EXTENSION);
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
                $image->setMain($index === $modelData['mainImageIndex']);
                $model->addImage($image);
                $entityManager->persist($image);
            } else {
                $existingImage->setMain($index === $modelData['mainImageIndex']);
            }
        }

       
        $stock = $entityManager->getRepository(Stock::class)->findOneBy([
            'product' => $product,
            'color' => $color,
            'size' => $size
        ]);

        if (!$stock) {
            $stock = new Stock();
            $stock->setProduct($product);
            $stock->setColor($color);
            $stock->setSize($size);
        }

        $stock->setQuantity($modelData['stock']);
        $newStocks[] = $stock;

     
        if (!$model->getId()) {
            $entityManager->persist($model);
        }
    }


    $existingStocks = $entityManager->getRepository(Stock::class)->findBy(['product' => $product]);
    foreach ($existingStocks as $existingStock) {
        if (!in_array($existingStock, $newStocks, true)) {
            $entityManager->remove($existingStock);
        }
    }


    foreach ($newStocks as $stock) {
        $entityManager->persist($stock);
    }


    foreach ($product->getBrands() as $brand) {
        $entityManager->remove($brand);
    }
    if ($data['category'] == 1 && isset($data['brand'])) {
        $brand = new Brand();
        $brand->setName($data['brand']);
        $brand->setProduct($product);
        $entityManager->persist($brand);
    }

    foreach ($product->getTags() as $tag) {
        $entityManager->remove($tag);
    }
    foreach ($data['tags'] as $tagName) {
        $tag = new Tag();
        $tag->setName($tagName);
        $tag->setProduct($product);
        $entityManager->persist($tag);
    }



    $entityManager->persist($product);
    $entityManager->flush();

    return new JsonResponse(['status' => 'Product updated'], 200);
}


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

            $product->addModel($model);
            $entityManager->persist($model);
            $entityManager->persist($product);

            $entityManager->flush();

            $photoPaths = $data['photoPaths'];
            foreach ($photoPaths as $index => $path) {
                $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($path);
                $fileExtension = pathinfo($originalFilePath, PATHINFO_EXTENSION);
            
                $newFileName = $product->getId() . '_' . $model->getId() . '_' . $index . '.' . $fileExtension;
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
            return new JsonResponse(['error' => 'Modele non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
    
        $product = $model->getProduct();
        if (!$product) {
            return new JsonResponse(['error' => 'Produit non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $color = $model->getColor();
        $size = $model->getSize();
    
        $data = json_decode($request->getContent(), true);
        if (!isset($data['price'], $data['stock'], $data['photoPaths'], $data['mainImageIndex'])) {
            return new JsonResponse(['error' => 'Données invalides'], 400);
        }
    
        if ($data['price'] <= 0 || $data['stock'] < 0) {
            return new JsonResponse(['error' => 'Le prix doit être supérieur à zéro, le stock et le poids ne peuvent pas être négatifs !'], 400);
        }
    
        $model->setPrice($data['price']);
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
    
    private function generateOrderNumber(): string
    {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $orderNumber = '';
        for ($i = 0; $i < 13; $i++) {
            $orderNumber .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $orderNumber;
    }

    /*Route qui permet de passer une commande et généré les informations lié à la commande: date, numérode commande, quantité etc...*/
    #[Route('/api/admin/products/replenish', name: 'api_replenish_products', methods: ['POST'])]
    public function replenishProducts(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // dd($data);

        
        if (!isset($data['products']) || !is_array($data['products'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }
        
       
        $order = new AdminOrder();
        $order->setOrderNumber($this->generateOrderNumber());       
        $order->setStatus('livré');
        $order->setCreatedAt(new \DateTime()); 
        $order->setUpdateAt(new \DateTime());
        
        $entityManager->persist($order);

    
        foreach ($data['products'] as $productData) {
            $product = $entityManager->getRepository(Product::class)->find($productData['id']);
            if (!$product) {
                continue; 
            }
            
            foreach ($productData['models'] as $modelData) {
                $model = $entityManager->getRepository(Model::class)->find($modelData['model_id']);
                if ($model) {
                    $stock = $entityManager->getRepository(Stock::class)->findOneBy([
                        'product' => $product,
                        'color' => $model->getColor(),
                        'size' => $model->getSize()
                    ]);
                    if ($stock) {
                        $stock->setQuantity($modelData['stock']);
                        $entityManager->persist($stock);
                    }
                    
           
                    $orderItem = new AdminOrderItem();
                    $orderItem->setAdminOrder($order);
                    $orderItem->setProduct($product);
                    $orderItem->setModel($model);
                    $orderItem->setModelColor($model->getColor() ? $model->getColor()->getName() : null);
                    $orderItem->setModelSize($model->getSize() ? $model->getSize()->getValue() : null);
                    $orderItem->setQuantity($modelData['stock']);
                    $orderItem->setIsMain(true); 
    
                    $entityManager->persist($orderItem);
                }
            }
        }
        
        $entityManager->flush();
    
        return new JsonResponse(['status' => 'Stock updated and order created successfully'], 200);
    }
    
    /*Route qui permet de mettre à jour le status de la commande: Livré, en cours de préparation, nouvelle commande*/
    #[Route('/api/admin/orders/track-all', name: 'api_track_all_orders', methods: ['GET'])]
    public function trackAllOrders(EntityManagerInterface $entityManager): JsonResponse
    {
        $orders = $entityManager->getRepository(AdminOrder::class)->findAll();
        $currentDate = new \DateTime();
        $updatedOrders = [];
    
        foreach ($orders as $order) {
            $deliveryDate = $order->getDeliveryDate();
            if (!$deliveryDate) {
                $deliveryDate = $order->getCreatedAt(); 
            }
            $interval = $deliveryDate->diff($currentDate);
            $daysElapsed = $interval->days;
    
            switch (true) {
                case ($daysElapsed >= 7):
                    $order->setStatus('Livré');
                    $order->setDeliveryDate($currentDate);
                    break;
                case ($daysElapsed >= 4):
                    $order->setStatus('En cours de livraison');
                    break;
                case ($daysElapsed >= 1):
                    $order->setStatus('En préparation');
                    break;
                default:
                    $order->setStatus('Nouvelle commande');
                    break;
            }
    
            $entityManager->persist($order);
    
            $updatedOrders[] = [
                'order_id' => $order->getId(),
                'status' => $order->getStatus(),
                'created_at' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
                'delivery_date' => $order->getDeliveryDate() ? $order->getDeliveryDate()->format('Y-m-d H:i:s') : null,
                'days_elapsed' => $daysElapsed,
            ];
        }
    
        $entityManager->flush();
    
        return new JsonResponse([
            'orders' => $updatedOrders,
        ], 200);
    }

    /*Recupération du details des produits commandé, c'est l'historique des produits commandés*/
    #[Route('/api/admin/replenish-orders', name: 'api_admin_replenish_orders', methods: ['GET'])]
    public function getReplenishOrders(EntityManagerInterface $entityManager): JsonResponse
    {
       
        $orders = $entityManager->getRepository(AdminOrder::class)->findAll();

        $orderDetails = [];
        foreach ($orders as $order) {
         
            $orderItems = $order->getOrderItems();

            foreach ($orderItems as $item) {
                $product = $item->getProduct();
                $model = $item->getModel();

               
                $stock = $entityManager->getRepository(Stock::class)->findOneBy([
                    'product' => $product,
                    'color' => $model->getColor(),
                    'size' => $model->getSize(),
                ]);

                $orderDetails[] = [
                    'order_number' => $order->getOrderNumber(),
                    'product_name' => $product->getName(),
                    'model_id' => $model->getId(),
                    'current_stock' => $stock ? $stock->getQuantity() : 0,
                    'order_date' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
                    'order_status' => $order->getStatus(),
                    'quantity_ordered' => $item->getQuantity(),
                ];
            }
        }

        return new JsonResponse($orderDetails);
    }
}