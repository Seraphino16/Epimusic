import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ProductList.css";
import CategoryCard from "../cards/CategoryCard";
import vinyles from "../../assets/vinyles.jpg";
import instruments from "../../assets/instruments.jpg";
import goodies from "../../assets/goodies.jpeg";

const ProductCategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/admin/categories"); //localhost
                setCategories(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories : ", error);
                setError("Erreur lors de la récupération des catégories.");
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="flex flex-wrap justify-center">
            {error && <p className="text-red-500">{error}</p>}
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    imageSrc={`http://localhost:8000${category.imagePath}`} //localhost
                    categoryName={category.name}
                    categoryId={category.id}
                />
            ))}
        </div>
    );
};

export default ProductCategoriesList;