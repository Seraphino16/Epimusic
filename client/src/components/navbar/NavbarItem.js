import React from "react";
import { Link } from "react-router-dom";

function NavbarItem({ text, href }) {
    return (
        <Link
            to={href}
            className="flex items-center justify-center px-4 py-2 text-lg font-semibold rounded-lg text-black hover:bg-gray-200 dark:bg-transparent dark:hover:bg-gray-600 dark:text-black transition-colors duration-200 ease-in-out"
        >
            {text}
        </Link>
    );
}

export default NavbarItem;
