import React, { useState } from "react";
import NavbarItem from "./NavbarItem";
import SearchBar from "./SearchBar";
import logo from "../../assets/logo.png";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

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
                    <NavbarItem text="Products" href="/" />
                    <NavbarItem text="Clients" href="/" />
                    <NavbarItem text="Admin" href="/admin/" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;