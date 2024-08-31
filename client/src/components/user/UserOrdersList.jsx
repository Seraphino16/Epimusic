import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserOrdersList = () => {
    const [orders, setOrders] = useState([]);
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
                            <h3 className="text-xl font-bold mb-2">Commande #{order.id}</h3>
                            <p><strong>Date :</strong> {order.createdAt}</p>
                            <p><strong>Statut :</strong> {order.status}</p>
                        </div>
                    ))
                ) : (
                    <p>Aucune commande trouvée.</p>
                )}
            </div>
        </div>
    );
};

export default UserOrdersList;