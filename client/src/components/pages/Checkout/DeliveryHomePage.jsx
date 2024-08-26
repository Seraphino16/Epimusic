import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../Alerts/Alert";
import { FaRegCreditCard, FaShippingFast } from "react-icons/fa";
import CartButton from "../../Buttons/CartButton";

const DeliveryHomePage = () => {
    const [alert, setAlert] = useState({ message: "", type: "error" });
    const [cartPrice, setCartPrice] = useState();
    const [shippingCosts, setShippingCosts] = useState();
    const [cartQuantity, setCartQuantity] = useState();
    const [total, setTotal] = useState();
    const [name, setName] = useState("");
    const [telephone, setTelephone] = useState("");
    const [address, setAddress] = useState("");
    const [complement, setComplement] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const cartPrice = localStorage.getItem("cart_price");
        setCartPrice(parseFloat(cartPrice));
        const shippingCosts = localStorage.getItem("cart_shipping_costs");
        setShippingCosts(parseFloat(shippingCosts));
        const cartQuantity = localStorage.getItem("cart_quantity");
        setCartQuantity(parseInt(cartQuantity));
    }, []);

    useEffect(() => {
        if (!cartPrice || !shippingCosts) {
            return;
        }
        const total = (cartPrice + shippingCosts).toFixed(2);
        setTotal(total);
    }, [cartPrice, shippingCosts]);

    return (
        <div className="w-9/12 m-auto">
            <div></div>
            <Alert message={alert.message} type={alert.type} />
            <h1 className="text-center text-4xl font-bold my-4">
                Livraison à domicile
            </h1>
            <div className="w-full">
                <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                    <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                        <p className="text-3xl font-bold leading-7 text-center text-black">
                            Adresse de livraison
                        </p>
                        {message && <p className="success">{message}</p>}
                        {error && <p className="error">{error}</p>}
                        <form>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col">
                                    <label
                                        htmlFor="name"
                                        className="text-gray-700"
                                    >
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Entrez le nom"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col">
                                    <label
                                        htmlFor="telephone"
                                        className="text-gray-700"
                                    >
                                        Numéro de téléphone
                                    </label>
                                    <input
                                        type="text"
                                        id="telephone"
                                        placeholder="Entrez votre numéro de téléphone"
                                        value={telephone}
                                        onChange={(e) =>
                                            setTelephone(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col">
                                    <label
                                        htmlFor="address"
                                        className="text-gray-700"
                                    >
                                        Adresse
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        placeholder="Entrez l'adresse"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col">
                                    <label
                                        htmlFor="complement"
                                        className="text-gray-700"
                                    >
                                        Complément (facultatif)
                                    </label>
                                    <input
                                        type="text"
                                        id="complement"
                                        placeholder="Entrez le complément (facultatif)"
                                        value={complement}
                                        onChange={(e) =>
                                            setComplement(e.target.value)
                                        }
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col md:w-1/2">
                                    <label
                                        htmlFor="postalCode"
                                        className="text-gray-700"
                                    >
                                        Code postal
                                    </label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        placeholder="Entrez le code postal"
                                        value={postalCode}
                                        onChange={(e) =>
                                            setPostalCode(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                                <div className="w-full flex flex-col md:w-1/2 md:ml-6 md:mt-0 mt-4">
                                    <label
                                        htmlFor="city"
                                        className="text-gray-700"
                                    >
                                        Ville
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        placeholder="Entrez la ville"
                                        value={city}
                                        onChange={(e) =>
                                            setCity(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col">
                                    <label
                                        htmlFor="country"
                                        className="text-gray-700"
                                    >
                                        Pays
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        placeholder="Entrez le pays"
                                        value={country}
                                        onChange={(e) =>
                                            setCountry(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                                <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                                    <p className="text-3xl font-bold leading-7 text-center text-black">
                                        Méthode de paiement
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
                            <div className="flex justify-center">
                                <CartButton
                                    type="submit"
                                    isSubmitting={isSubmitting}
                                >
                                    Confirmer la commande
                                </CartButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryHomePage;
