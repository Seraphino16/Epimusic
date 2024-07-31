import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ProductList.css";
import CategoryCard from "../cards/CategoryCard";
import vinyles from "../../assets/vinyles.jpg";
import instruments from "../../assets/instruments.jpg";
import goodies from "../../assets/goodies.jpeg";

const ProductCategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [message] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/admin/categories")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error(
                    "There was an error fetching the categories!",
                    error
                );
                setError("There was an error fetching the categories!");
            });
    }, []);

    const getCategoryImage = (categoryName) => {
        switch (categoryName) {
            case "Vinyle":
                return vinyles;
            case "Instrument":
                return instruments;
            case "Goodies":
                return goodies;
            default:
                return "https://placehold.co/500x300";
        }
    };

    return (
        <div>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <h1 className="text-center text-4xl font-bold my-4">
                Toutes les catégories de produits
            </h1>
            <div className="flex flex-wrap justify-center m-5">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        imageSrc={getCategoryImage(category.name)}
                        categoryName={category.name}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductCategoriesList;
