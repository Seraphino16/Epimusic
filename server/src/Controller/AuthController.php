<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    private $entityManager;
    private $passwordHasher;
    private $requestStack;
    private $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        RequestStack $requestStack,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->requestStack = $requestStack;
        $this->logger = $logger;
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $firstName = $data['firstName'] ?? null;
        $lastName = $data['lastName'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $confirmPassword = $data['confirmPassword'] ?? null;

        if (!$firstName || !$lastName || !$email || !$password || !$confirmPassword) {
            return new JsonResponse(['message' => 'Tous les champs doivent être remplis'], 
                                    Response::HTTP_BAD_REQUEST);
        }

        if ($password !== $confirmPassword) {
            return new JsonResponse(['message' => 'Le mot de passe et sa confirmation doivent être identiques'], 
                                    Response::HTTP_BAD_REQUEST);
        }

        if (!preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password) ||
            !preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password) ||
            strlen($password) < 8) {
            return new JsonResponse([
                'message' => 'Le mot de passe doit avoir une longueur minimum de 8 caractères et contenir les caractères suivants : une majuscule, une minuscule, un chiffre et un caractère spécial'
            ], 
            Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword(
            $this->passwordHasher->hashPassword(
                $user,
                $password
            )
        );

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return new JsonResponse(['message' => 'Une erreur est survenue lors de l\'inscription'], 
                                    Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Inscription réussie'], Response::HTTP_CREATED);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            if (!$email || !$password) {
                return new JsonResponse(['message' => 'Veuillez remplir tous les champs'], Response::HTTP_BAD_REQUEST);
            }

            $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

            if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
                return new JsonResponse(['message' => 'Email ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
            }

            $session = $this->requestStack->getSession();
            $session->set('user', [
                'id' => $user->getId(),
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ]);

            return new JsonResponse([
                'message' => 'Connexion réussie',
                'user' => [
                    'id' => $user->getId(),
                    'firstname' => $user->getFirstName(),
                    'lastname' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles(),
                ]
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Internal Server Error'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(SessionInterface $session): JsonResponse {
        $session->invalidate();
        return new JsonResponse(['message' => 'Déconnexion réussie'], Response::HTTP_OK);
    }
}
