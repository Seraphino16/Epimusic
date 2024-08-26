<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\TransportProvider;
use App\Repository\TransportProviderRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

#[Route('/api')]
class ProvidersController extends AbstractController
{   
    private TransportProviderRepository $providerRepository;

    public function __construct(TransportProviderRepository $providerRepository) {
        $this->providerRepository = $providerRepository;
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
}
