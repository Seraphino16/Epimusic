import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ imageSrc, categoryName }) => {
    return (
        <div className="card w-[15vw] h-[15vw] border border-[#ece0d1] rounded-lg text-[#634832] m-2 p-2 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg flex flex-col items-center justify-between">
            <img
                src={imageSrc}
                alt={categoryName}
                className="border-b border-gray-300 mb-2 w-auto h-[7vw]"
            />
            <h2 className="my-2 text-xl text-center">{categoryName}</h2>
            <Link to={`/products/${categoryName.toLowerCase()}`}>
                <button className="bg-[#2bebf1] w-[12vw] text-[#000000] border-none mb-4 py-2 px-4 text-base rounded cursor-pointer hover:bg-[#24c3c9]">
                    Voir les produits
                </button>
            </Link>
        </div>
    );
};

export default CategoryCard;