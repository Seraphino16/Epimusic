<?php

namespace App\Repository;

use App\Entity\TransportProvider;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TransportProvider>
 */
class TransportProviderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TransportProvider::class);
    }

    public function findAllProviders(): array
    {
        return $this->findAll();
    }
    
}
