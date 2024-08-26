import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminTabs = () => {
    const location = useLocation();
    const tabs = [
        { name: "Mes Informations", path: "/admin/user-card" },
        { name: "Clients", path: "/admin/users" },
        { name: "Produits", path: "/admin/products" },
        { name: "Livraison", path: "/admin/orders" },
        { name: "Catégories", path: "/admin/categories" },
        { name: "Prestataires", path: "/admin/providers" }
    ];

    return (
        <div className="flex space-x-4 mb-4">
            {tabs.map((tab) => (
                <Link
                    key={tab.name}
                    to={tab.path}
                    className={`p-2 ${location.pathname === tab.path ? "bg-gray-200" : "bg-gray-100"} rounded`}
                >
                    {tab.name}
                </Link>
            ))}
        </div>
    );
};

export default AdminTabs;