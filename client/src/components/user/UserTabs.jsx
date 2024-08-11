import React from "react";
import { Link, useLocation } from "react-router-dom";

const UserTabs = () => {
    const location = useLocation();
    const tabs = [
        { name: "Mes Informations", path: "/profile/user-card" },
        { name: "Mes Commandes", path: "/profile/orders" },
        { name: "Carnet d'Adresses", path: "/profile/address-book" },
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

export default UserTabs;
