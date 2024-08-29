<?php

namespace App\Controller;

use App\Repository\MusicTrackRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MusicController extends AbstractController
{
    #[Route('/api/random-track', name: 'random_track')]
    public function getRandomTrack(MusicTrackRepository $musicTrackRepository): JsonResponse
    {
        $tracks = $musicTrackRepository->findAll();
        if (empty($tracks)) {
            return new JsonResponse(['error' => 'No tracks available'], 404);
        }

        $randomTrack = $tracks[array_rand($tracks)];
        return new JsonResponse(['filePath' => $randomTrack->getFilePath()]);
    }
}
