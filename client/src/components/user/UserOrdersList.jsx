import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UserOrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user.id;

            try {
                const response = await axios.get(`http://localhost:8000/api/order/${userId}/orders`);
                setOrders(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des commandes : ", error);
                setError("Erreur lors de la récupération des commandes.");
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'En préparation':
                return 'text-blue-500';
            case 'En cours de livraison':
                return 'text-yellow-500';
            case 'Livré':
                return 'text-green-500';
            case 'Annulé':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'En préparation':
                return <FaBoxOpen className="text-blue-500" />;
            case 'En cours de livraison':
                return <FaShippingFast className="text-yellow-500" />;
            case 'Livré':
                return <FaCheckCircle className="text-green-500" />;
            case 'Annulé':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return null;
        }
    };

    const handleOrderClick = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/order/${orderId}/details`);
            setSelectedOrderDetails(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de la commande : ", error);
            setError("Erreur lors de la récupération des détails de la commande.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrderDetails(null);
    };

    return (
        <div className="w-full">
            <div className="flex flex-col items-center mb-4">
                <h2 className="text-xl font-bold mb-4">Mes Commandes</h2>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="flex flex-wrap justify-center gap-4">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center">
                            <h3
                                className="text-xl font-bold mb-2 cursor-pointer"
                                onClick={() => handleOrderClick(order.id)}
                            >
                                Commande #{order.id}
                            </h3>
                            <p><strong>Date :</strong> {order.createdAt}</p>
                            <p className="flex items-center">
                                <strong>Statut :</strong>
                                <span className="ml-2 flex items-center">
                                    {getStatusIcon(order.status)}
                                    <span className={`ml-2 ${getStatusColor(order.status)}`}>{order.status}</span>
                                </span>
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Aucune commande trouvée.</p>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedOrderDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-2/3 max-w-3xl">
                        <h3 className="text-lg font-bold mb-4">Détails de la commande #{selectedOrderDetails.id}</h3>
                        <table className="min-w-full bg-white">
                            <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200">Produit</th>
                                <th className="py-2 px-4 border-b border-gray-200">Couleur</th>
                                <th className="py-2 px-4 border-b border-gray-200">Taille</th>
                                <th className="py-2 px-4 border-b border-gray-200">Quantité</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedOrderDetails.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b border-gray-200 text-justify">{item.productName}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-center">{item.color || '-'}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-center">{item.size || '-'}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-center">{item.quantity}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="mt-4">
                            <strong>Prix Total :</strong> {selectedOrderDetails.totalPrice} €
                        </div>
                        <button
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={closeModal}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOrdersList;