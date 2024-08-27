import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../Alerts/Alert";
import { FaRegCreditCard } from "react-icons/fa";
import CartButton from "../../Buttons/CartButton";
import axios from "axios";

const DeliveryHomePage = () => {
    const [alert, setAlert] = useState({ message: "", type: "error" });
    const [cartPrice, setCartPrice] = useState();
    const [shippingCosts, setShippingCosts] = useState();
    const [cartQuantity, setCartQuantity] = useState();
    const [total, setTotal] = useState();
    const [lastname, setLastname] = useState("");
    const [firstname, setFirstname] = useState("");
    const [email, setEmail] = useState("");
    const [telephone, setTelephone] = useState("");
    const [address, setAddress] = useState("");
    const [complement, setComplement] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [isPrimary, setIsPrimary] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddresses = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user.id;

            try {
                const response = await axios.get(
                    `http://localhost:8000/api/user/${userId}/addresses`
                );
                setAddresses(response.data);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des adresses : ",
                    error
                );
                setError("Erreur lors de la récupération des adresses.");
            }
        };

        fetchAddresses();
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setFirstname(user.firstname);
            setLastname(user.lastname);
            setEmail(user.email);
        }
    }, []);

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

    const handleAddressChange = (e) => {
        const selectedAddress = addresses.find(
            (address) => address.id === parseInt(e.target.value)
        );
        if (selectedAddress) {
            setTelephone(selectedAddress.telephone);
            setAddress(selectedAddress.address);
            setComplement(selectedAddress.complement);
            setPostalCode(selectedAddress.postalCode);
            setCity(selectedAddress.city);
            setCountry(selectedAddress.country);
        }
    };

    return (
        <div className="w-9/12 m-auto">
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

                        {localStorage.getItem("user") && (
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col">
                                    <label
                                        htmlFor="address-select"
                                        className="text-gray-700"
                                    >
                                        Carnet d'adresses
                                    </label>
                                    <select
                                        id="address-select"
                                        onChange={handleAddressChange}
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option value="">
                                            Sélectionnez une adresse
                                        </option>
                                        {addresses.map((address) => (
                                            <option
                                                key={address.id}
                                                value={address.id}
                                            >
                                                {address.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <form>
                            <div className="md:flex items-center mt-4">
                                <div className="w-full flex flex-col md:w-1/2">
                                    <label
                                        htmlFor="lastname"
                                        className="text-gray-700"
                                    >
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Entrez votre nom"
                                        value={lastname}
                                        onChange={(e) =>
                                            setLastname(e.target.value)
                                        }
                                        required
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-2 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                                <div className="w-full flex flex-col md:w-1/2 md:ml-6 md:mt-0 mt-4">
                                    <label
                                        htmlFor="firstname"
                                        className="text-gray-700"
                                    >
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        placeholder="Entrez votre prénom"
                                        value={firstname}
                                        onChange={(e) =>
                                            setFirstname(e.target.value)
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
                                        htmlFor="email"
                                        className="text-gray-700"
                                    >
                                        Adresse e-mail
                                    </label>
                                    <input
                                        type="text"
                                        id="email"
                                        placeholder="Entrez votre adresse e-mail"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
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
                                        Complément d'adresse
                                    </label>
                                    <input
                                        type="text"
                                        id="complement"
                                        placeholder="Entrez le complément d'adresse"
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
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 mt-4">
                                Valider et passer au payement
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryHomePage;
