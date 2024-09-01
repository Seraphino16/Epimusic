import React, { useEffect, useState } from "react";
import axios from "axios";

const PayementMethodForm = () => {
    return (
        <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-12 mb-8">
            <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                <p className="text-3xl font-bold leading-7 text-center text-black">
                    Méthodes de paiements
                </p>
                <div className="flex items-center mb-4 mt-6">
                    <FaRegCreditCard className="text-4xl mr-4" />
                    <input
                        type="radio"
                        name="paymentMethod"
                        className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                    />
                    <p className="text-lg font-medium text-gray-900 ml-2 block">
                        Carte de crédit
                    </p>
                </div>
            </div>
        </div>
    );
};
