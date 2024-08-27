import React, { useEffect, useState } from "react";
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from "../../Payment/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_51PqupeCKzysEQIbT5aIFcS1ML0ajqFDNutYJqEHAsnO4qJTY9HQNr6T79788Cy6Wa4poZQGBDJLjyo39Ejwq9P1K00f0KYpJsH");

const PaymentPage = () => {

    return (
        <div className="w-9/12 m-auto">
            {/* <Alert message={alert.message} type={alert.type} /> */}
            <h1 className="text-center text-4xl font-bold my-4">
                Panier
            </h1>
            <div className="flex flex-wrap justify-evenly">
                <div className="w-3/4 max-w-xl bg-white p-8 mt-4 rounded-lg">
                     <Elements stripe={stripePromise} >
                        <PaymentForm />
                    </Elements>
                </div>
               
            </div>
        </div>
    );
}

export default PaymentPage;