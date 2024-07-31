import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarItem from "./NavbarItem";
import SearchBar from "./SearchBar";
import logo from "../../assets/logo.png";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setIsLoggedIn(true);
            if (Array.isArray(user.roles)) {
                if (user.roles.includes('ROLE_ADMIN')) {
                    setUserRole('ROLE_ADMIN');
                } else if (user.roles.includes('ROLE_USER')) {
                    setUserRole('ROLE_USER');
                }
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
        navigate('/login');
        window.location.reload(); // This will refresh the page
    };

    return (
        <nav className="relative z-50 w-full flex items-center justify-between flex-wrap bg-[#2bebf1] py-2 shadow px-4 lg:px-16 xl:px-48">
            <div className="flex items-center flex-shrink-0 text-black mr-6">
                <img src={logo} alt="Logo" className="w-16 h-16 mr-2" />
            </div>
            <div className="block lg:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center px-3 py-2 border rounded text-black border-black hover:text-black hover:border-black"
                >
                    <svg
                        className="fill-current h-5 w-5"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                    </svg>
                </button>
            </div>
            <div
                className={`w-full flex-grow lg:flex lg:items-center lg:w-auto lg:justify-between ${
                    isOpen ? "block" : "hidden"
                } transition-all duration-300 ease-in-out`}
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-center lg:space-x-8 lg:text-left lg:flex-grow lg:mt-0 space-y-4 lg:space-y-0">
                    <SearchBar />
<<<<<<< HEAD
                    <NavbarItem text="Products" href="/products" />
                    <NavbarItem text="Clients" href="/clients" />
=======
                    <NavbarItem text="Accueil" href="/" />
                    <NavbarItem text="Produits" href="/products" />
>>>>>>> dev
                    {userRole === 'ROLE_ADMIN' && <NavbarItem text="Admin" href="/admin/" />}
                    {userRole === 'ROLE_USER' && <NavbarItem text="Profil" href="/profile/" />}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="block mt-4 lg:inline-block lg:mt-0 text-black hover:text-gray-800 mr-4"
                        >
                            Déconnexion
                        </button>
                    ) : (
                        <NavbarItem text="Se Connecter" href="/login" />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;