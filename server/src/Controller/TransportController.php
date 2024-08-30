<?php

namespace App\Controller;

use App\Entity\Order;
use App\Repository\AnonymousCartRepository;
use App\Repository\CartRepository;
use App\Repository\TransportProviderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\Date;

#[Route("/api")]
class TransportController extends AbstractController
{
    private TransportProviderRepository $providerRepository;
    private CartRepository $cartRepository;
    private AnonymousCartRepository $anonymousCartRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        TransportProviderRepository $transportProviderRepository,
        CartRepository $cartRepository,
        AnonymousCartRepository $anonymousCartRepository,
        EntityManagerInterface $entityManager
    )
    {
        $this->providerRepository = $transportProviderRepository;
        $this->cartRepository = $cartRepository;
        $this->anonymousCartRepository = $anonymousCartRepository;
        $this->entityManager = $entityManager;
    }

    public function generatePermutations(array $dimensions): array
    {
        return [
            $dimensions,
            ["length" => $dimensions["length"], "width" => $dimensions["height"], "height" => $dimensions["width"]],
            ["length" => $dimensions["width"], "width" => $dimensions["length"], "height" => $dimensions["height"]],
            ["length" => $dimensions["width"], "width" => $dimensions["height"], "height" => $dimensions["length"]],
            ["length" => $dimensions["height"], "width" => $dimensions["width"], "height" => $dimensions["length"]],
            ["length" => $dimensions["height"], "width" => $dimensions["length"], "height" => $dimensions["width"]],
        ];
    }

    public function calculatePackageCost($model)
    {   
        $product = $model["model"]->getProduct();
        $size = $model["model"]->getSize();
        
        if ($size) {

        $modelDimensions = $size->getDimension();
        $quantity = $model["quantity"];

        $dimensions = [
            "length" => $modelDimensions->getLength(),
            "width" => $modelDimensions->getWidth(),
            "height" => $modelDimensions->getHeight()
        ];

        $providers = $this->providerRepository->findAllProviders();
        $permutations = $this->generatePermutations($dimensions);

        foreach ($providers as $provider) {
            foreach ($permutations as $permutation) {
                if (
                    $permutation["length"] <= $provider->getLength() &&
                    $permutation["width"] <= $provider->getWidth() &&
                    $permutation["height"] <= $provider->getHeight()
                ) {
                    $total = $provider->getPrice() * $quantity;
                    $formattedTotal = number_format((float)$total, 2, '.', '');
                    return $formattedTotal;
                }
            }
        }

        } else {
            $weights = $product->getWeights();

            if ($weights->count() > 0) {
                $weight = $weights->first();
                $quantity = $model['quantity'];
                $totalWeight = $weight->getValue();

                $providers = $this->providerRepository->findAllProviders();

                foreach ($providers as $provider) {

                    $costPerKg = $provider->getPrice();
                    $total = $totalWeight * $quantity * $costPerKg;
                    $formattedTotal = number_format((float)$total, 2, '.', '');
                    return $formattedTotal;
                }
            }
        }

        return false;
    }

    public function getProducts(Request $request)
    {
        $token = $request->query->get('token');
        $userId = $request->query->get('userId');

        if (!$token && !$userId) {
            return new JsonResponse(['error' => "Aucune donnéee n'a été trouvée"], Response::HTTP_BAD_REQUEST);
        }

        if ($token) {
            $cart = $this->anonymousCartRepository->findOneBy(['token' => $token]);        
        }

        if ($userId) {
            $cart = $this->cartRepository->findOneBy(['user' => $userId]);
        }

        return $cart;
    }

    #[Route("/shipping/cost", name:"get_shipping_costs", methods:["GET"])]
    public function calculateShippingCost(Request $request): JsonResponse
    {
        $cart = $this->getProducts($request);

        $items = $cart->getItems();

        $models = [];
        foreach ($items as $item) {
            $models[] = [
                "model" => $item->getModel(),
                "quantity" => $item->getQuantity()
            ];
        }

        $totalCosts = 0;

        foreach ($models as $model) {
            $cost = $this->calculatePackageCost($model);
            if ($cost) {
                $totalCosts += $cost;
            } else {
                return new JsonResponse(["message" => "Les frais de port n'ont pas pu être calculés car un ou pluisuers produits n'ont pas de taille définie"], 400);
            }
        }

        $this->registerShippingCosts($request, $totalCosts);

        return new JsonResponse(["shippingCosts" => $totalCosts]);
    }

    private function registerShippingCosts(Request $request, $shippingCosts)
    {
        $orderId = $request->query->get('orderId');

        $order = $this->entityManager->getRepository(Order::class)
                    ->find($orderId);

        $order->setShippingCost($shippingCosts);

        $order->setTotalWithShippingCost($order->getTotalWithPromo() + $shippingCosts);

        $now = new \DateTime();
        $order->setUpdatedAt($now);
        
        $this->entityManager->persist($order);
        $this->entityManager->flush();
    }
}
