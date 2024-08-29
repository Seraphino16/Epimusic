<?php

namespace App\Repository;

use App\Entity\Stock;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Stock>
 *
 * @method Stock|null find($id, $lockMode = null, $lockVersion = null)
 * @method Stock|null findOneBy(array $criteria, array $orderBy = null)
 * @method Stock[]    findAll()
 * @method Stock[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class StockRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Stock::class);
    }

    public function save(Stock $entity, bool $flush = false): void
    {
        $this->_em->persist($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function remove(Stock $entity, bool $flush = false): void
    {
        $this->_em->remove($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function findStockForProduct(int $productId, ?int $colorId, ?int $sizeId): ?int
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.quantity')
            ->where('s.product = :productId')
            ->setParameter('productId', $productId);
    
        if ($colorId !== null) {
            $qb->andWhere('s.color = :colorId')
                ->setParameter('colorId', $colorId);
        } else {
            $qb->andWhere('s.color IS NULL');
        }
    
        if ($sizeId !== null) {
            $qb->andWhere('s.size = :sizeId')
                ->setParameter('sizeId', $sizeId);
        } else {
            $qb->andWhere('s.size IS NULL');
        }
    
        $result = $qb->getQuery()->getOneOrNullResult();
    
        if ($result) {
            return $result['quantity'];
        }
    
        return null;
    }
    

}