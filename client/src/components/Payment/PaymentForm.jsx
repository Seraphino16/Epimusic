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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

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

const PaymentForm = ({ orderPrice, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const [paymentSuccess, setPAymentSuccess] = useState(false);
  const [userId, setUserId] = useState();
  const [cartToken, setCartToken] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserId(user.id);
    } else {
      const token = localStorage.getItem("cart_token");
      setCartToken(token);
    }
  }, []);

  useEffect(() => {
    if (!orderPrice) {
      return;
    }

    axios
      .post(
        "http://localhost:8000/api/payment/create-intent", //localhost
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

    if (!cardNumberElement) {
      alert("Tous les champs doivent être remplis");
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardHolderName,
          },
        },
      }
    );

    if (error) {
      setIsProcessing(false);
      alert(error.message);
    } else {
      alert("Paiement réussi");
      setIsProcessing(false);
      setPAymentSuccess(true);
    }
  };

  useEffect(() => {
    if (!paymentSuccess || !orderId) {
      return;
    }

    axios
      .patch(`http://localhost:8000/api/order/validate/${orderId}`) //localhost
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => console.log(error));

    axios
      .delete(`http://localhost:8000/api/cart/`, {    //localhost
        params: {
          userId: userId,
          token: cartToken,
        },
      })
      .then((response) => {
        if (cartToken) {
          localStorage.removeItem('cart_token');
        }
      })
      .then(
        setTimeout(() => {
          navigate('/');
        }, 6000)
      )
      .catch((error) => console.log(error));
  }, [paymentSuccess]);

  return (
    <>
      {paymentSuccess ? (
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-6xl"
          />
          <p className="text-2xl mt-8 mb-4">Paiement réussi</p>
          <p className="text-2xl">Merci d'avoir commandé chez Epimusic !</p>
          <p className="text-xl mt-2">Vous allez être redirigés dans quelques instants</p>
        </div>
      ) : (
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
            {isProcessing ? "Transaction en cours..." : "Payer"}
          </button>
          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
          )}
        </form>
      )}
    </>
  );
};

export default PaymentForm;
