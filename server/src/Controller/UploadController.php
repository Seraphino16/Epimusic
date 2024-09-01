<?php
// src/Controller/UploadController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;

class UploadController extends AbstractController
{
    #[Route('/upload', name: 'upload_file', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        }

        
        if ($file->getSize() > 25 * 1024 * 1024) {
            return new JsonResponse(['error' => 'File size exceeds 25MB'], Response::HTTP_BAD_REQUEST);
        }

        $uploadsDirectory = $this->getParameter('uploads_directory');

        try {
            $fileName = uniqid().'.'.$file->guessExtension();
            $file->move($uploadsDirectory, $fileName);
        } catch (FileException $e) {
            return new JsonResponse(['error' => 'Failed to upload file'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $filePath = '/uploads/' . $fileName;

        return new JsonResponse(['success' => 'File uploaded successfully', 'filePath' => $filePath]);
    }
}