<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController; 
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
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
                'message' =>   `Le mot de passe doit avoir une longueur minimum de 8 caractères et contenir les caractères suivants : 
                                une majuscule, une minuscule, un chiffre et un caractère spécial`], 
                                Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setEmail($email);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword(
            $passwordHasher->hashPassword(
                $user,
                $password
            )
        );

        $errors = $validator->validate($user);
        if (count($errors) > 0) {

            return new JsonResponse(['message' => 'Une erreur est surevenue lors de l\'inscription'], 
                                    Response::HTTP_BAD_REQUEST);
        }

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Inscription réussie'], Response::HTTP_CREATED);
    }
}
