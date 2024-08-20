<?php

namespace App\Controller;

use App\Entity\Musicoin;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/musicoin')]
class MusicoinController extends AbstractController
{
    #[Route('/', name:'get_musicoin_info', methods:["GET"])]
    public function getMusicoin(EntityManagerInterface $entityManager): JsonResponse
    {
        $musicoins = $entityManager->getRepository(Musicoin::class)->findAll();

        $data = [];
        $today = new \DateTime();

        foreach ($musicoins as $musicoin) {

            $lastGameDate = $musicoin->getLastGameDate();

            if ($lastGameDate) {
                $isPlayedToday = ($lastGameDate->format("Y-m-d") === $today->format("Y-m-d"));
            } else {
                $isPlayedToday = false;
            }
            

            $data[] = [
                "userId" => $musicoin->getUser()->getId(),
                "quantity" => $musicoin->getQuantity(),
                "isPlayedToday" => $isPlayedToday,
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/user/{id}', name: 'get_musicoin_from_user', methods:["GET"])]
    public function getMusicoinFromUserId(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $musicoin = $entityManager->getRepository(Musicoin::class)->findOneBy(["user" => $id]);

        if (!$musicoin) {
            return new JsonResponse(["message" => "Les musicoins n'ont pas pu être trouvés"]);
        }

        $today = new \DateTime();
        
        $lastGameDate = $musicoin->getLastGameDate();

        if ($lastGameDate) {
            $isPlayedToday = ($lastGameDate->format("Y-m-d") === $today->format("Y-m-d"));
        } else {
            $isPlayedToday = false;
        }

        $data = [
            "userId" => $musicoin->getUser()->getId(),
            "quantity" => $musicoin->getQuantity(),
            "isPlayedToday" => $isPlayedToday,
        ];

        return new JsonResponse($data);
    }
}
