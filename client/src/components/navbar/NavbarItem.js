function NavbarItem({ text, href, download }) {
    return (
        <a
            className="flex items-center justify-center px-4 py-2 text-lg font-semibold rounded-lg text-black hover:bg-gray-200 focus:bg-gray-200 dark:bg-transparent dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:text-black transition-colors duration-200 ease-in-out"
            href={href}
            download={download}
        >
            {text}
        </a>
    );
}

export default NavbarItem;