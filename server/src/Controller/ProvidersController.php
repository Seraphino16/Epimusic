<?php

namespace App\Controller;

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

    #[Route('/provider/{id}', name: 'api_update_provider', methods: ['PUT'])]
    public function updateProvider(Request $request, int $id): Response {

        $data = json_decode($request->getContent(), true);

        $provider = $this->providerRepository->find($id);

        if (!$provider) {
            return new JsonResponse(['error' => 'Transporteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $provider->setName($data['name']);
        $provider->setEAN($data['EAN']);
        $provider->setLength($data['length']);
        $provider->setWidth($data['width']);
        $provider->setHeight($data['height']);
        $provider->setPrice($data['price']);
        $provider->setMaxWeight($data['MaxWeight']);

        $this->entityManager->persist($provider);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Transporteur mis à jour avec succès'], JsonResponse::HTTP_OK);
    }

    #[Route('/provider/{id}', name: 'api_delete_provider', methods: ['DELETE'])]
    public function deleteProvider(int $id): Response {

        $provider = $this->providerRepository->find($id);

        if (!$provider) {
            return new JsonResponse(['error' => 'Transporteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($provider);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Transporteur supprimé avec succès'], JsonResponse::HTTP_OK);
    }
}
