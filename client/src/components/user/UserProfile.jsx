import React, { useEffect, useState } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate, Route, Routes } from "react-router-dom";
import UserTabs from "../user/UserTabs";
import UserCard from "./UserCard";
import UserOrdersList from "./UserOrdersList";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setUser(userData);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Profil Utilisateur</h1>
            <UserTabs />
            <Routes>
                <Route
                    path="user-card"
                    element={
                        <>
                            <UserCard user={user} />
                            <button
                                onClick={handleLogout}
                                className="mt-4 p-2 bg-red-500 text-white rounded flex items-center justify-center"
                            >
                                <IoLogOutOutline size={24} className="mr-2" />
                                Se Déconnecter
                            </button>
                        </>
                    }
                />
                <Route path="orders" element={<UserOrdersList />} />
            </Routes>
        </div>
    );
};

export default UserProfile;