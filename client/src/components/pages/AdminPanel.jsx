import React, { useEffect, useState } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate, Route, Routes } from "react-router-dom";
import AdminTabs from "../admin/AdminTabs";
import ProductAdminList from "./ProductAdminList";
import UsersAdminList from "../admin/UsersAdminList";
import OrdersAdminList from "../admin/OrdersAdminList";
import ProvidersAdminList from "../admin/ProvidersAdminList";
import UserCard from "../Cart/UserCard";
import ProductAdminForm from "../forms/ProductAdminForm";
import ProductAdminEdit from "../forms/ProductAdminEdit";
import CategoriesAdminList from "../admin/CategoriesAdminList";
import CategoryAdminForm from "../forms/CategoryAdminForm";
import CategoryAdminEdit from "../forms/CategoryAdminEdit";

const AdminPanel = () => {
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
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Panel</h1>
            <AdminTabs />
            <Routes>
                <Route path="products" element={<ProductAdminList />} />
                <Route path="users" element={<UsersAdminList />} />
                <Route path="orders" element={<OrdersAdminList />} />
                <Route path="categories" element={<CategoriesAdminList />} />
                <Route path="providers" element={<ProvidersAdminList />} />
                <Route path="categories/create" element={<CategoryAdminForm />} />
                <Route path="categories/edit/:id" element={<CategoryAdminEdit />} />
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
                <Route path="create-product" element={<ProductAdminForm />} />
                <Route path="edit-product/:id" element={<ProductAdminEdit />} />
            </Routes>

        </div>
    );
};

export default AdminPanel;