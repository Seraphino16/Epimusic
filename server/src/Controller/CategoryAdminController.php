<?php
namespace App\Controller;

use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class CategoryAdminController extends AbstractController
{
    #[Route('/api/admin/categories', name: 'api_categories', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $categories = $entityManager->getRepository(Category::class)->findAll();
        $data = [];

        foreach ($categories as $category) {
            $data[] = [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'imagePath' => $category->getImagePath(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/admin/categories', name: 'create_category', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'])) {
            return new JsonResponse(['error' => 'Le nom de la catégorie est requis'], Response::HTTP_BAD_REQUEST);
        }

        $category = new Category();
        $category->setName($data['name']);

        $entityManager->persist($category);
        $entityManager->flush();

        if (isset($data['imagePath'])) {
            $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($data['imagePath']);
            $newFileName = 'category_' . $category->getId() . '.' . pathinfo($originalFilePath, PATHINFO_EXTENSION);
            $newFilePath = $this->getParameter('uploads_directory') . '/' . $newFileName;

            try {
                rename($originalFilePath, $newFilePath);
                $category->setImagePath('/uploads/' . $newFileName);
            } catch (FileException $e) {
                return new JsonResponse(['error' => 'Échec du renommage du fichier'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $entityManager->persist($category);
            $entityManager->flush();
        }

        return new JsonResponse(['id' => $category->getId()], Response::HTTP_CREATED);
    }

    #[Route('/api/admin/categories/{id}', name: 'delete_category', methods: ['DELETE'])]
    public function delete(Category $category, EntityManagerInterface $entityManager): JsonResponse
    {
        if ($category->getImagePath()) {
            $imagePath = $this->getParameter('uploads_directory') . '/' . basename($category->getImagePath());
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        foreach ($category->getProducts() as $product) {
            $entityManager->remove($product);
        }

        foreach ($category->getSizes() as $size) {
            $size->removeCategory($category);
        }

        $entityManager->remove($category);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Category deleted'], Response::HTTP_OK);
    }

    #[Route('/api/admin/categories/{id}', name: 'api_category_get', methods: ['GET'])]
    public function getCategory(Category $category): JsonResponse
    {
        $data = [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'imagePath' => $category->getImagePath(),
        ];

        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/api/admin/categories/{id}', name: 'api_category_update', methods: ['PUT'])]
    public function update(Request $request, Category $category, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'], $data['imagePath'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        $category->setName($data['name']);

        if (isset($data['imagePath'])) {
            $newImagePath = $data['imagePath'];

            if ($category->getImagePath() && $category->getImagePath() !== $newImagePath) {
                $oldImagePath = $this->getParameter('uploads_directory') . '/' . basename($category->getImagePath());
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            if (!str_contains($newImagePath, '/uploads/')) {
                $originalFilePath = $this->getParameter('uploads_directory') . '/' . basename($newImagePath);
                $newFileName = 'category_' . $category->getId() . '.' . pathinfo($originalFilePath, PATHINFO_EXTENSION);
                $newFilePath = $this->getParameter('uploads_directory') . '/' . $newFileName;

                try {
                    rename($originalFilePath, $newFilePath);
                } catch (FileException $e) {
                    return new JsonResponse(['error' => 'Failed to rename file'], Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                $newImagePath = '/uploads/' . $newFileName;
            }

            $category->setImagePath($newImagePath);
        }

        $entityManager->persist($category);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Category updated'], 200);
    }

    #[Route('/rename-upload', name: 'rename_upload', methods: ['POST'])]
    public function renameUpload(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['oldPath'], $data['newPath'])) {
            return new JsonResponse(['error' => 'Invalid data'], 400);
        }

        $uploadsDirectory = $this->getParameter('uploads_directory');
        $oldFilePath = $uploadsDirectory . '/' . basename($data['oldPath']);
        $newFilePath = $uploadsDirectory . '/' . basename($data['newPath']);

        try {
            rename($oldFilePath, $newFilePath);
        } catch (FileException $e) {
            return new JsonResponse(['error' => 'Failed to rename file'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['status' => 'File renamed'], 200);
    }
}