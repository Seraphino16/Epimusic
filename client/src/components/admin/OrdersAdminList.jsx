import React, { useState, useEffect } from "react";
import Alert from "../Alerts/Alert";

const OrdersAdminList = () => {
    const [orders, setOrders] = useState([]);
    const [alert, setAlert] = useState({ type: "", message: "" });

    const fetchOrders = async () => {
        try {
            const response = await fetch(
                "http://localhost:8000/api/admin/replenish-orders",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                setAlert({
                    type: "error",
                    message:
                        error.message ||
                        "Erreur lors de la récupération des commandes",
                });
                return;
            }

            const data = await response.json();
            setOrders(data);
            setAlert({ type: "error", message: "" });
        } catch (error) {
            setAlert({
                type: "error",
                message: "Erreur lors de la récupération des commandes",
            });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold my-4">Liste des Commandes</h2>
            {alert.message && (
                <Alert message={alert.message} type={alert.type} />
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">
                                Numéro de commande
                            </th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">
                                Nom du produit
                            </th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">
                                Stock Actuel
                            </th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">
                                Date de Commande
                            </th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">
                                Statut de la commande
                            </th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">
                                Quantité Commandée
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_number}>
                                <td className="px-4 py-2 border border-gray-200">
                                    {order.order_number}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {order.product_name}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {order.current_stock}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {new Date(
                                        order.order_date
                                    ).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {order.order_status}
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {order.quantity_ordered}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersAdminList;
