<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Weight;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\TransportProvider;
use App\Repository\TransportProviderRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api')]
class ProvidersController extends AbstractController
{   
    private TransportProviderRepository $providerRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(TransportProviderRepository $providerRepository, EntityManagerInterface $entityManager,) {
        $this->providerRepository = $providerRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/providers', name: 'api_providers', methods: ['GET'])]
    public function findAllProviders(): Response
    {
        $providers = $this->providerRepository->findAllProviders();

        $data = [];
        foreach ($providers as $provider) {
            $data[] = [
                'id' => $provider->getId(),
                'name' => $provider->getName(),
                'EAN' => $provider->getEAN(),
                'length' => $provider->getLength(),
                'width' => $provider->getWidth(),
                'height' => $provider->getHeight(),
                'price' => $provider->getPrice(),
                'MaxWeight' => $provider->getMaxWeight(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/provider/{id}', name: 'api_show_provider', methods: ['GET'])]
    public function findProvider(int $id) {

        $provider = $this->providerRepository->find($id);

        if (!$provider) {
            return new JsonResponse(['error' => 'Transporteur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $provider->getId(),
            'name' => $provider->getName(),
            'EAN' => $provider->getEAN(),
            'length' => $provider->getLength(),
            'width' => $provider->getWidth(),
            'height' => $provider->getHeight(),
            'price' => $provider->getPrice(),
            'MaxWeight' => $provider->getMaxWeight(),
        ];

        return new JsonResponse($data);

    }

    #[Route('/provider', name: 'api_create_provider', methods: ['POST'])]
    public function createProvider(Request $request): Response {

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'], $data['EAN'], $data['length'], $data['width'], 
                    $data['height'], $data['price'], $data['MaxWeight'])) {
                        
            return new JsonResponse(['error', 'Données invalides'],Response::HTTP_BAD_REQUEST);
        }

        $provider = new TransportProvider();
        $provider->setName($data['name']);
        $provider->setEAN($data['EAN']);
        $provider->setLength($data['length']);
        $provider->setWidth($data['width']);
        $provider->setHeight($data['height']);
        $provider->setPrice($data['price']);
        $provider->setMaxWeight($data['MaxWeight']);

        $this->entityManager->persist($provider);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Transporteur enregistré avec succès'], Response::HTTP_CREATED);

    }

    #[Route('/provider/{id}/products', name: 'api_provider_products', methods:['GET'])]
    public function getProductsForProvider(int $id): Response
    {

        $transportProvider = $this->entityManager->getRepository(TransportProvider::class)->find($id);
    
        if (!$transportProvider) {
            return new JsonResponse(['error' => 'Transporteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $maxWeightForProvider = $transportProvider->getMaxWeight();
    
        $transportProviders = $this->entityManager->getRepository(TransportProvider::class)->findAll();
        $weightRanges = [];
    
        foreach ($transportProviders as $provider) {
            $weightRanges[$provider->getId()] = $provider->getMaxWeight();
        }
    
        asort($weightRanges);
    
        $products = $this->entityManager->getRepository(Product::class)
            ->createQueryBuilder('p')
            ->leftJoin('p.weights', 'w')
            ->addSelect('w')
            ->getQuery()
            ->getResult();
    
        $data = [];
    
        foreach ($products as $product) {
            $weights = $product->getWeights();
            $productWeights = [];

            foreach ($weights as $weight) {
                $productWeights[] = $weight->getValue();
            }
    
            $bestMatchProviderId = null;
            foreach ($weightRanges as $providerId => $maxWeight) {
                foreach ($productWeights as $productWeight) {
                    if ($productWeight <= $maxWeight) {
                        $bestMatchProviderId = $providerId;
                        break 2;
                    }
                }
            }
    
            if ($bestMatchProviderId === $id) {
                $data[] = [
                    'id' => $product->getId(),
                    'name' => $product->getName(),
                    'weights' => array_map(function($weight) {
                        return $weight->getValue();
                    }, $product->getWeights()->toArray()),
                ];
            }
        }
    

        return new JsonResponse($data);
    }
    
    

    
    
    



}
