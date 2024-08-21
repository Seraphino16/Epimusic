import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditAddressForm = () => {
    const { id } = useParams();  // ID de l'adresse à modifier
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
        const fetchAddress = async () => {
            try {
                // Récupération de l'utilisateur connecté à partir du localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                const userId = user.id;

                // Récupération de l'adresse pour l'utilisateur connecté
                const response = await axios.get(`http://localhost:8000/api/user/${userId}/addresses/${id}`);
                const addressData = response.data;

                // Mise à jour des états avec les données de l'adresse
                setName(addressData.name);
                setTelephone(addressData.telephone);
                setAddress(addressData.address);
                setComplement(addressData.complement || "");
                setPostalCode(addressData.postalCode);
                setCity(addressData.city);
                setCountry(addressData.country);
                setIsPrimary(addressData.isPrimary);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'adresse", error);
                setError("Erreur lors de la récupération de l'adresse.");
            }
        };
        fetchAddress();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Récupération de l'utilisateur connecté à partir du localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user.id;

        const updatedAddress = {
            name,
            telephone,
            address,
            complement,
            postalCode,
            city,
            country,
            isPrimary,
        };

        try {
            // Mise à jour de l'adresse pour l'utilisateur connecté
            await axios.put(`http://localhost:8000/api/user/${userId}/addresses/${id}`, updatedAddress, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setMessage("Adresse mise à jour avec succès!");
            setError("");
            setTimeout(() => {
                navigate("/profile/address-book");
            }, 2000);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'adresse", error);
            setError("Erreur lors de la mise à jour de l'adresse.");
            setMessage("");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                    <p className="text-3xl font-bold leading-7 text-center text-black">
                        Modifier l'adresse
                    </p>
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="md:flex items-center mt-12">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="name">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Entrez le nom"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="telephone">
                                    Téléphone
                                </label>
                                <input
                                    type="text"
                                    id="telephone"
                                    placeholder="Entrez le numéro de téléphone"
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="address">
                                    Adresse
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="Entrez l'adresse"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="complement">
                                    Complément
                                </label>
                                <input
                                    type="text"
                                    id="complement"
                                    placeholder="Entrez le complément (facultatif)"
                                    value={complement}
                                    onChange={(e) => setComplement(e.target.value)}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col md:w-1/2">
                                <label className="font-semibold leading-none text-black" htmlFor="postalCode">
                                    Code Postal
                                </label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    placeholder="Entrez le code postal"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                            <div className="w-full flex flex-col md:w-1/2 md:ml-6 md:mt-0 mt-4">
                                <label className="font-semibold leading-none text-black" htmlFor="city">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    placeholder="Entrez la ville"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="country">
                                    Pays
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    placeholder="Entrez le pays"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="isPrimary">
                                    Adresse principale
                                </label>
                                <input
                                    type="checkbox"
                                    id="isPrimary"
                                    checked={isPrimary}
                                    onChange={(e) => setIsPrimary(e.target.checked)}
                                    className="mt-4"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`font-semibold leading-none text-white py-4 px-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none ${
                                    isSubmitting ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-600'
                                }`}
                            >
                                Modifier l'adresse
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAddressForm;