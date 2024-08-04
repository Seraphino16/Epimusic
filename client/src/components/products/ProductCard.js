import React, { useState } from "react";

const ProductCard = ({ product, editProduct, deleteProduct }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const truncatedDescription =
        product.description.length > 30
            ? product.description.substring(0, 30) + "..."
            : product.description;

    return (
        <div className="bg-white w-80 h-auto mx-auto shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl m-4">
            <img
                src={
                    product.models[0].images[0]?.path ||
                    "https://placehold.co/500x300"
                }
                alt={`Product ${product.name}`}
                className="w-full h-48 object-cover border-b border-gray-200"
            />
            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {product.name}
                </h2>
                <p className="text-gray-600 mt-2 line-clamp-4">
                    {showFullDescription
                        ? product.description
                        : truncatedDescription}
                    {product.description.length > 30 && (
                        <span
                            className="text-blue-500 cursor-pointer ml-2"
                            onClick={toggleDescription}
                        >
                            {showFullDescription ? "See less" : "See more"}
                        </span>
                    )}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <p className="text-gray-600">
                        Category: {product.category}
                    </p>
                    <p className="text-gray-600">
                        Color: {product.color || "N/A"}
                    </p>
                    <p className="text-gray-600">
                        Price: ${product.models[0].price}
                    </p>
                    <p className="text-gray-600">
                        Size: {product.size || "N/A"}
                    </p>
                </div>
                <div className="mt-2 flex justify-between">
                    <button
                        className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 focus:outline-none"
                        onClick={() => editProduct(product.id)}
                    >
                        Edit
                    </button>
                    <button
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 focus:outline-none"
                        onClick={() => deleteProduct(product.id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
