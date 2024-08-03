<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Model;
use App\Entity\Review;
use App\Entity\User;
use App\Repository\ProductRepository;
use App\Repository\ModelRepository;
use App\Repository\UserRepository;
use App\Repository\ReviewRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class ReviewController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private ValidatorInterface $validator;
    private ProductRepository $productRepository;
    private ModelRepository $modelRepository;
    private UserRepository $userRepository;
    private ReviewRepository $reviewRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        ProductRepository $productRepository,
        ModelRepository $modelRepository,
        UserRepository $userRepository,
        ReviewRepository $reviewRepository 
    ) {
        $this->entityManager = $entityManager;
        $this->validator = $validator;
        $this->productRepository = $productRepository;
        $this->modelRepository = $modelRepository;
        $this->userRepository = $userRepository;
        $this->reviewRepository = $reviewRepository;
    }

    #[Route('/product/add/review', name: 'add_product_review', methods: ['POST'])]
    public function addProductReview(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $productId = $data['product_id'] ?? null;
        $modelId = $data['model_id'] ?? null;
        $rating = $data['rating'] ?? null;
        $comment = $data['comment'] ?? null;
        $userId = $data['user_id'] ?? null;

        if (!$productId || !$comment) {
            return new JsonResponse(['error' => 'Requete invalide'], Response::HTTP_BAD_REQUEST);
        }

        $product = $this->productRepository->find($productId);
        if (!$product) {
            return new JsonResponse(['error' => 'Product non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $model = null;
        if ($modelId) {
            $model = $this->modelRepository->find($modelId);
            if (!$model) {
                return new JsonResponse(['error' => 'Model non trouvé'], Response::HTTP_NOT_FOUND);
            }
        }

        $user = null;
        if ($userId) {
            $user = $this->userRepository->find($userId);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }
        }

        $review = new Review();
        $review->setProduct($product)
               ->setModel($model)
               ->setUser($user)
               ->setRating($rating)
               ->setComment($comment)
               ->setCreatedAt(new \DateTime())
               ->setUpdateAt(new \DateTime());


        $errors = $this->validator->validate($review);
        if (count($errors) > 0) {
            return new JsonResponse(['error' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($review);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Votre avis à été ajouté',
            'review' => [
                'id' => $review->getId(),
                'product_id' => $review->getProduct()->getId(),
                'model_id' => $review->getModel()?->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'created_at' => $review->getCreatedAt()->format('d-m-Y H:i:s'),
                'update_at' => $review->getUpdateAt()->format('d-m-Y H:i:s'),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/review/delete/{id}', name: 'delete_review', methods: ['DELETE'])]
    public function deleteReview(Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id'] ?? null;

        if (!$userId) {
            return new JsonResponse(['error' => 'Utilisateur non spécifié'], Response::HTTP_BAD_REQUEST);
        }

        $review = $this->reviewRepository->find($id);

        if (!$review) {
            return new JsonResponse(['error' => 'Avis non trouvé'], Response::HTTP_NOT_FOUND);
        }

        if (!$review->getUser()) {
            return new JsonResponse(['error' => 'Impossible de supprimer un avis anonyme'], Response::HTTP_FORBIDDEN);
        }

        $user = $this->userRepository->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        if ($user->getId() !== $review->getUser()->getId()) {
            return new JsonResponse(['error' => 'Vous n\'avez pas l\'autorisation de supprimer cet avis'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($review);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Avis supprimé avec succès'], Response::HTTP_OK);
    }

}
