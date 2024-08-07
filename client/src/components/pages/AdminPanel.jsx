import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <button
                onClick={handleLogout}
                className="mt-4 p-2 bg-red-500 text-white rounded flex items-center"
            >
                <IoLogOutOutline size={24} className="mr-2" />
                Se Déconnecter
            </button>
        </div>
    );
};

export default AdminPanel;