<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    public function findAllProductsWithCategoryAndImage()
    {
        return $this->createQueryBuilder('p')
            ->select('p.id', 'p.name', 'p.description', 'c.name as category', 'm.price', 'i.path as image_url')
            ->leftJoin('p.category', 'c')
            ->leftJoin('p.models', 'm')
            ->leftJoin('m.image', 'i')
            ->where('i.is_main = :isMain')
            ->setParameter('isMain', true)
            ->getQuery()
            ->getArrayResult();
    }

    public function findAllProductsPaginated(?string $search, ?string $category)
    {
        $qb = $this->createQueryBuilder('p')
            ->select('p.id', 'p.name', 'p.description', 'c.name as category', 'm.price', 'i.path as image_url')
            ->leftJoin('p.category', 'c')
            ->leftJoin('p.models', 'm')
            ->leftJoin('m.image', 'i')
            ->where('i.is_main = :isMain')
            ->setParameter('isMain', true);

        if ($search) {
            $qb->andWhere('p.name LIKE :search OR p.description LIKE :search')
                ->setParameter(':search', '%' . $search . '%');
        }
        
        if ($category) {
            $qb->andWhere('c.name = :category')
                ->setParameter(':category', $category);
        }
        
        return $qb;
        

        // $totalProducts = $this->createQueryBuilder('p')
        //     ->select('COUNT(p.id)')
        //     ->getQuery()
        //     ->getSingleScalarResult();

        // return [
        //     "totalArticles" => (int)$totalProducts,
        //     "page" => $page,
        //     "limit" => $limit,
        //     "products" => $query->getArrayResult()
        // ];
    }

    public function findProductWithCategory($productId)
    {

    $results = $this->createQueryBuilder('p')
        ->select('p.id', 'p.name', 'p.description', 'c.name as category', 
                'm.id as model_id', 'm.price',
                'col.name as color', 's.value as size_value', 's.unit as size_unit', 
                'st.quantity as stock_quantity',
                'i.path as image_url', 'i.is_main as is_main')
        ->leftJoin('p.category', 'c')
        ->leftJoin('p.models', 'm')
        ->leftJoin('m.color', 'col')
        ->leftJoin('m.size', 's')
        ->leftJoin('p.stocks', 'st')
        ->leftJoin('m.image', 'i')
        ->where('p.id = :id')
        ->setParameter('id', $productId)
        ->getQuery()
        ->getArrayResult();

    $productData = [];
    $productData['images'] = ['main' => [], 'secondary' => []];

    foreach ($results as $result) {
        if (!isset($productData['id'])) {
        
            $productData['id'] = $result['id'];
            $productData['name'] = $result['name'];
            $productData['description'] = $result['description'];
            $productData['category'] = $result['category'];
        }

        if (isset($result['model_id'])) {
            $productData['models'][] = [
                'model_id' => $result['model_id'],
                'price' => $result['price'],
                'color' => $result['color'],
                'size_value' => $result['size_value'],
                'size_unit' => $result['size_unit'],
                'stock_quantity' => $result['stock_quantity'] ?? 0, // Stock de l'entité Stock
            ];
        }

        if ($result['is_main']) {
            $productData['images']['main'][] = $result['image_url'];
        } else {
            $productData['images']['secondary'][] = $result['image_url'];
        }
    }

    return $productData;
}


    public function findProductsByCategory($categoryId) {
        return $this->createQueryBuilder('p')
            ->select('p.id', 'p.name', 'p.description', 'c.name as category',
                     'm.id as model_id', 'm.price', 
                     'col.name as color', 's.value as size_value', 
                     'st.quantity as stock_quantity',
                     'i.path as image_url', 'i.is_main as is_main')
            ->leftJoin('p.category', 'c')
            ->leftJoin('p.models', 'm')
            ->leftJoin('m.color', 'col')
            ->leftJoin('m.size', 's')
            ->leftJoin('m.image', 'i')
            ->leftJoin('p.stocks', 'st')
            ->where('c.id = :categoryId')
            ->setParameter('categoryId', $categoryId)
            ->getQuery()
            ->getArrayResult();
    }



}