import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavbarItem from "./NavbarItem";
import SearchBar from "./SearchBar";
import logo from "../../assets/logo.png";
import { FaUserTie, FaUser, FaShoppingCart, FaGamepad } from "react-icons/fa";
import { IoLogInOutline } from "react-icons/io5";
import { useCart } from "../../context/CartContext"; 

const Navbar = () => {
    const location = useLocation();
    const isAuthRoute =
        location.pathname === "/register" || location.pathname === "/login";
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { itemCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setIsLoggedIn(true);
            if (Array.isArray(user.roles)) {
                if (user.roles.includes("ROLE_ADMIN")) {
                    setUserRole("ROLE_ADMIN");
                } else if (user.roles.includes("ROLE_USER")) {
                    setUserRole("ROLE_USER");
                }
            }
        }
    }, []);

    return (
        <nav
            className={`top-0 z-50 w-full flex items-center justify-between flex-wrap ${
                isAuthRoute ? "bg-transparent" : "bg-transparent"
            } py-2 px-4 lg:px-16 xl:px-48`}
        >
            <div className="flex items-center flex-shrink-0 text-black mr-6">
                <Link to="/">
                    <img src={logo} alt="Logo" className="w-16 h-16 mr-2" />
                </Link>
            </div>
            {userRole === "ROLE_USER" && (
                <div className="pt-2 ml-4 pl-4">
                    <NavbarItem icon={<FaGamepad size={24} />} text="Jouer au jeu de rythme" href="/rhythm-game" />
                </div>
            )}
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
                    <div className="pt-2">
                        <NavbarItem text="Produits" href="/products" />
                    </div>
                    {userRole === "ROLE_ADMIN" && (
                        <NavbarItem icon={<FaUserTie size={24}/>} href="/admin/user-card" />
                    )}
                    {userRole === "ROLE_USER" && (
                        <NavbarItem icon={<FaUser size={24} />} href="/profile/user-card" />
                    )}
                    <div className="relative">
                        <NavbarItem icon={<FaShoppingCart size={24} />} href="/cart" />
                        {itemCount > 0 && (
                            <span className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    {!isLoggedIn && (
                        <NavbarItem icon={<IoLogInOutline size={24} />} href="/login" />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;