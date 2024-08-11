import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ imageSrc, categoryName, categoryId }) => {
    return (
        <Link to={`/products/${categoryName.toLowerCase()}/${categoryId}`}>
            <div className="bg-white card w-full sm:w-[45vw] md:w-[30vw] lg:w-[20vw] xl:w-[15vw] border border-[#ece0d1] rounded-lg text-[#634832] m-2 p-2 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg flex flex-col items-center justify-between">
                <img
                    src={imageSrc}
                    alt={categoryName}
                    className="border-b border-gray-300 mb-2 w-full h-auto object-cover max-h-[200px] md:max-h-[180px] lg:max-h-[160px]"
                />
                <h2 className="my-2 text-lg sm:text-xl md:text-2xl text-center">
                    {categoryName}
                </h2>
            </div>
        </Link>
    );
};

export default CategoryCard;