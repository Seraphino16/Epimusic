<?php

namespace App\Controller;

use App\Entity\Promotion;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class PromotionController extends AbstractController
{
    #[Route('/promotion/{id}', name: 'get_promotion', methods: ['GET'])]
    public function getPromotion(int $id, EntityManagerInterface $em): JsonResponse
    {
        // Récupération de la promotion par son ID
        $promotion = $em->getRepository(Promotion::class)->find($id);

        if (!$promotion) {
            return new JsonResponse(['message' => 'Promotion not found'], 404);
        }

        // Mise à jour de l'état actif de la promotion en fonction de la date de fin
        $this->updatePromotionStatus($promotion);
        $em->flush(); // Sauvegarde de la mise à jour du statut

        return new JsonResponse([
            'id' => $promotion->getId(),
            'promo_price' => $promotion->getPromoPrice(),
            'start_date' => $promotion->getStartDate()->format('Y-m-d H:i:s'),
            'end_date' => $promotion->getEndDate()->format('Y-m-d H:i:s'),
            'is_active' => $promotion->isActive(),
            'product' => $promotion->getProduct()->getName(),
            'models' => array_map(function($model) {
                return [
                    'id' => $model->getId(),
                    'price' => $model->getPrice(),
                ];
            }, $promotion->getProduct()->getModels()->toArray())
        ]);
    }

    #[Route('/promotion', name: 'create_promotion', methods: ['POST'])]
    public function createPromotion(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Récupération du produit par son ID
        $product = $em->getRepository(Product::class)->find($data['product_id']);

        if (!$product) {
            return new JsonResponse(['message' => 'Invalid product'], 400);
        }

        // Création d'une nouvelle promotion
        $promotion = new Promotion();
        $promotion->setPromoPrice($data['promo_price']);
        $promotion->setStartDate(new \DateTime($data['start_date']));
        $promotion->setEndDate(new \DateTime($data['end_date']));
        $promotion->setProduct($product);

        // Mise à jour de l'état actif de la promotion
        $this->updatePromotionStatus($promotion);

        $em->persist($promotion);

        // Appliquer le prix promotionnel à tous les modèles du produit
        // foreach ($product->getModels() as $model) {
        //     $model->setPrice($promotion->getPromoPrice());
        // }

        $em->flush();

        return new JsonResponse(['message' => 'Promotion created successfully', 'id' => $promotion->getId()], 201);
    }

    private function updatePromotionStatus(Promotion $promotion): void
    {
        // Mise à jour de l'état actif en fonction de la date de fin
        $now = new \DateTime();
        if ($promotion->getEndDate() < $now) {
            $promotion->setIsActive(false);
        } else {
            $promotion->setIsActive(true);
        }
    }
}
