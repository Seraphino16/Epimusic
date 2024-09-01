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
use Doctrine\ORM\EntityManagerInterface;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

 
#[Route('/api')]
class ProductController extends AbstractController
{
    
    #[Route('/products', name: 'app_product', methods: ['GET'])]
    public function index(ProductRepository $productRepository, Request $request, PaginatorInterface $paginator): JsonResponse
    {
        $page = $request->query->get("page", 1);
        $limit= $request->query->get('limit', 25);

        $filters = $this->getFilters($request);

        if (!preg_match('/^[\p{L}\p{N}\s\'\"“”‘’]*$/u', $filters['search'])) {
            return new JsonResponse(['error' => 'Votre recherche contient des caractères invalides'], 400);
        }

        $queryBuilder = $productRepository->findAllProductsPaginated($filters);

        $pagination = $paginator->paginate(
            $queryBuilder,
            $page,
            $limit
        );

        return new JsonResponse([
            'total' => $pagination->getTotalItemCount(),
            'page' => (int) $page,
            'limit' => (int) $limit,
            'products' => $pagination->getItems()
        ]);
    }

    public function getFilters($request)
    {
        $filters['category'] = $request->query->get('category');
        $filters['search'] = $request->query->get('search');
        $filters['color'] = $request->query->get('color');
        $filters['size'] = $request->query->get('size');
        $filters['minWeight'] = $request->query->get('minWeight');
        $filters['maxWeight'] = $request->query->get('maxWeight');
        $filters['minPrice'] = $request->query->get('minPrice');
        $filters['maxPrice'] = $request->query->get('maxPrice');

        $filters['search'] = trim($filters['search']);

        return $filters;
    }

    #[Route('/products/{id}', name: 'product_show')]
    public function show(EntityManagerInterface $entityManager, ProductRepository $productRepository,$id) : JsonResponse
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
                'color' => $model->getColor() ? $model->getColor()->getName() : null,
                'size' => $model->getSize() ? $model->getSize()->getValue() : null,
                'price' => $model->getPrice(),
                'images' => $images,
                'stock' => $quantity
            ];
        
        }

        $reviews = [];
        foreach ($product->getReviews() as $review) {
            $reviews[] = [
                'review_id' => $review->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'created_at' => $review->getCreatedAt()->format('Y-m-d H:i:s'),
                'user_id' => $review->getUser()->getId(),
                'user_firstname' => $review->getUser()->getFirstName(),
                'user_lastname' => $review->getUser()->getLastName()
            ];
        }

        $data = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'category' => $categoryData,
            'weight' => $product->getWeights()->first()?->getValue() ?? 0,
            'models' => $models,
            'reviews' => $reviews,
            'promotions' => $promoDetails,
        ];

        return $this->json($data);
    }

    #[Route('/products/category/{categoryId}', name: 'products_by_category', methods: ['GET'])]
    public function productsByCategory(EntityManagerInterface $entityManager, Request $request, $categoryId): JsonResponse
    {
        $filters = $this->getFilters($request);
    
        if (!preg_match('/^[\p{L}\p{N}\s\'\"“”‘’]*$/u', $filters['search'])) {
            return new JsonResponse(['error' => 'Votre recherche contient des caractères invalides'], 400);
        }
    
        $queryBuilder = $entityManager->createQueryBuilder();
        $queryBuilder
            ->select('p')
            ->from(Product::class, 'p')
            ->leftJoin('p.models', 'm')
            ->leftJoin('m.color', 'c')
            ->leftJoin('m.size', 's');
            
        if ($categoryId !== null && $categoryId !== '' && $categoryId !== 'undefined') {
            $queryBuilder->where('p.category = :category')
                        ->setParameter('category', $categoryId);
        }
    
        if ($filters['search']) {
            $queryBuilder->andWhere('p.name LIKE :search')
                ->setParameter('search', '%' . $filters['search'] . '%');
        }
    
        if ($filters['color']) {
            $queryBuilder->andWhere('c.name = :color')
                ->setParameter('color', $filters['color']);
        }
        if ($filters['size']) {
            $queryBuilder->andWhere('s.value = :size')
                ->setParameter('size', $filters['size']);
        }
        if ($filters['minWeight']) {
            $queryBuilder->andWhere('m.weight >= :minWeight')
                ->setParameter('minWeight', $filters['minWeight']);
        }
        if ($filters['maxWeight']) {
            $queryBuilder->andWhere('m.weight <= :maxWeight')
                ->setParameter('maxWeight', $filters['maxWeight']);
        }
        if ($filters['minPrice']) {
            $queryBuilder->andWhere('m.price >= :minPrice')
                ->setParameter('minPrice', $filters['minPrice']);
        }
        if ($filters['maxPrice']) {
            $queryBuilder->andWhere('m.price <= :maxPrice')
                ->setParameter('maxPrice', $filters['maxPrice']);
        }
    
        $products = $queryBuilder->getQuery()->getResult();
        $now = new \DateTime();
        $data = [];
    
        foreach ($products as $product) {
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
            $models = [];
            foreach ($product->getModels() as $model) {
                if (($filters['color'] && $filters['color'] !== $model->getColor()?->getName()) ||
                    ($filters['size'] && $filters['size'] !== $model->getSize()?->getValue()) ||
                    ($filters['minWeight'] && $filters['minWeight'] > $model->getWeight()) ||
                    ($filters['maxWeight'] && $filters['maxWeight'] < $model->getWeight()) ||
                    ($filters['minPrice'] && $filters['minPrice'] > $model->getPrice()) ||
                    ($filters['maxPrice'] && $filters['maxPrice'] < $model->getPrice())) {
                    continue;
                }
    
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
    
                $models[] = [
                    'model_id' => $model->getId(),
                    'color' => $model->getColor() ? $model->getColor()->getName() : null,
                    'size' => $model->getSize() ? $model->getSize()->getValue() : null,
                    'price' => $model->getPrice(),
                    'images' => $images,
                    'weight' => $model->getWeight(),
                    'stock' => $quantity,
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
                'models' => $models,
                'brands' => $brands,
                'tags' => $tags,
                'weight' => $product->getWeights()->first()?->getValue() ?? 0,
                'promotions' => $promoDetails,
            ];
        }
    
        return new JsonResponse($data);
    }

    
}