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
        return $this->createQueryBuilder('p')
            ->select('p.id', 'p.name', 'p.description', 'c.name as category')
            ->leftJoin('p.category', 'c')
            ->where('p.id = :id')
            ->setParameter('id', $productId)
            ->getQuery()
            ->getArrayResult();
    }
}