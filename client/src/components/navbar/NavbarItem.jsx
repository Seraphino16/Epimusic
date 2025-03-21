import React from 'react';
import { Link } from 'react-router-dom';

function NavbarItem({ text, href, onClick, icon }) {
    return (
        <Link
            to={href}
            onClick={onClick}
            className="flex items-center justify-center px-4 py-2 text-lg font-semibold rounded-lg text-black transition-colors duration-200 ease-in-out hover:underline dark:bg-transparent dark:text-black"
        >
            {icon && <span className="mr-2">{icon}</span>}
            {text}
        </Link>
    );
}

export default NavbarItem;