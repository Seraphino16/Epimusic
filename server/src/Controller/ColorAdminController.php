<?php

namespace App\Controller;

use App\Entity\Color;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ColorAdminController extends AbstractController
{
    #[Route('/api/admin/colors', name: 'api_colors', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $colors = $entityManager->getRepository(Color::class)->findAll();
        $data = [];

        foreach ($colors as $color) {
            $data[] = [
                'id' => $color->getId(),
                'name' => $color->getName(),
            ];
        }

        return new JsonResponse($data);
    }
}