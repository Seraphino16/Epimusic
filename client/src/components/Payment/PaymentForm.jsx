import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import React, { useEffect, useState } from "react";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const PaymentForm = ({ orderPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const [paymentSuccess, setPAymentSuccess] = useState(false);

  useEffect(() => {
    axios
      .post(
        "/api/payment/create-intent", //localhost
        {
          amount: Math.round(orderPrice * 100),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setClientSecret(response.data.clientSecret);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [orderPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const cardNumberElement = elements.getElement(CardNumberElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardHolderName,
          }
        },
      }
    );

    if (error) {
      setIsProcessing(false);
      alert(error.message);
    } else {
      alert("Paiement réussi");
      console.log(paymentIntent);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label className="block text-gray-700 mb-2 text-2xl">
          Titulaire de la carte
        </label>
        <div className="p-3 border border-gray-300 rounded-lg shadow-sm">
          <input
            type="text"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Nom du titulaire"
            className="w-full focus:outline-none focus:ring-0 focus:border-transparent border-none p-0 m-0"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 mb-2 text-2xl">
          Numéro de carte
        </label>
        <div className="p-3 border border-gray-300 rounded-lg shadow-sm">
          <CardNumberElement
            options={CARD_ELEMENT_OPTIONS}
            className="w-full focus:outline-none"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <label className="block text-gray-700 mb-2 text-2xl">
            Date d'expiration
          </label>
          <div className="p-3 border border-gray-300 rounded-lg shadow-sm">
            <CardExpiryElement
              options={CARD_ELEMENT_OPTIONS}
              className="w-full focus:outline-none"
            />
          </div>
        </div>
        <div className="w-1/6 ">
          <label className="block text-gray-700 mb-2 text-2xl">CVC</label>
          <div className="p-3 w-full border border-gray-300 rounded-lg shadow-sm">
            <CardCvcElement
              options={CARD_ELEMENT_OPTIONS}
              className="w-full focus:outline-none"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="bg-rose-600 w-full text-2xl rounded-xl mt-8 text-black"
      >
        {isProcessing ? "Processing..." : "Payer"}
      </button>
    </form>
  );
};

export default PaymentForm;
