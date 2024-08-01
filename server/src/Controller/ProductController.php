<?php

namespace App\Controller;

use App\Repository\ProductRepository;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
 
#[Route('/api')]
class ProductController extends AbstractController
{
    
    #[Route('/products', name: 'app_product', methods: ['GET'])]
    public function index(ProductRepository $productRepository, Request $request, PaginatorInterface $paginator): JsonResponse
    {
        $page = $request->query->get("page", 1);
        $limit = $request->query->get('limit', 25);
        $category = $request->query->get('category');
        $search = $request->query->get('search');

        $search = trim($search);

        if (!preg_match('/^[\p{L}\p{N}\s\'\"“”‘’]*$/u', $search)) {
            return new JsonResponse(['error' => 'Votre recherche contient des caractères invalides'], 400);
        }

        $queryBuilder = $productRepository->findAllProductsPaginated($search, $category);

        $pagination = $paginator->paginate(
            $queryBuilder,
            $page,
            $limit
        );

        return new JsonResponse([
            'total' => $pagination->getTotalItemCount(),
            'page' => (int) $page,
            'limit' => (int) $limit,
            'products' => $pagination->getItems()
        ]);
    }

    #[Route('/products/{id}', name: 'product_show', methods: ['GET'])]
    public function show(ProductRepository $productRepository,$id) : JsonResponse
    {
        $product = $productRepository->findProductWithCategory($id);

        if (!$product) {
            return $this->json(['error' => 'The product does not exist'], 404);
        }

        return new JsonResponse($product);
    }

    #[Route('/products/category/{categoryId}', name: 'products_by_category', methods: ['GET'])]
    public function productsByCategory(ProductRepository $productRepository, $categoryId): JsonResponse
    {
        $products = $productRepository->findProductsByCategory($categoryId);

        return new JsonResponse($products);
    }
}