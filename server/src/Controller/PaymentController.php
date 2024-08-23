<?php

namespace App\Controller;

use Stripe\PaymentIntent;
use Stripe\Stripe;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/payment')]
class PaymentController extends AbstractController
{
    #[Route('/create-intent', name: 'create-payment-intent', methods:['POST'])]
    public function createPaymentIntent(Request $request)
    {
        Stripe::setApiKey("sk_test_51PqupeCKzysEQIbTeDU0FloDUU4YxhVxfwuSqp3IbmhnyJNlO4bgWyMYUXYSkxp317SjsWAGhMfopQsylbu5Le6M00A2pV7vDc");

        $data = json_decode($request->getContent(), true);
        $amount = $data["amount"];

        try {
            $paymentIntent = PaymentIntent::create([
                "amount" => $amount,
                "currency" => "eur"
            ]);

            return new JsonResponse([
                "clientSecret" => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(["error" => $e->getMessage()], 400);
        }
    }
}
