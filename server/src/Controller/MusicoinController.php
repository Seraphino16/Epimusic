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
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/', name: 'get_musicoin_info', methods: ["GET"])]
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

    #[Route('/user/{id}', name: 'get_musicoin_from_user', methods: ["GET"])]
    public function getMusicoinFromUserId(int $id): JsonResponse
    {
        $musicoin = $this->entityManager->getRepository(Musicoin::class)->findOneBy(["user" => $id]);

        if (!$musicoin) {
            return new JsonResponse(["error" => "Les musicoins n'ont pas pu être trouvés"], 400);
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

    #[Route('update-date/user/{id}', name: 'update_musicoin_date', methods: ["PATCH"])]
    public function updateMusicoinDate(int $id): JsonResponse
    {
        $musicoin = $this->entityManager->getRepository(Musicoin::class)->findOneBy(["user" => $id]);

        if (!$musicoin) {
            return new JsonResponse(["error" => "Les musicoins n'ont pas pu être trouvés"], 400);
        }

        $date = new \DateTime();
        $musicoin->setLastGameDate($date);

        $this->entityManager->flush();

        return new JsonResponse(["success" => true]);
    }

    #[Route('/add', name: 'add_musicoins', methods: ["POST"])]
    public function addMusicoins(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data["userId"] ?? null;
        $amount = $data["amount"] ?? null;

        $musicoin = $this->entityManager
            ->getRepository(Musicoin::class)
            ->findOneBy(['user' => $userId]);
        
        if (!$musicoin) {
            return new JsonResponse(["error" => "Les musicoins n'ont pas pu être trouvés"]);
        }

        $musicoin->setQuantity($musicoin->getQuantity() + $amount);
        $musicoin->setLastGameDate(new \DateTime());

        $this->entityManager->flush();

        return $this->getMusicoinFromUserId($userId);
    }
}
