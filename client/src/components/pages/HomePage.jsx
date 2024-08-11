import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ProductList.css";
import CategoryCard from "../cards/CategoryCard";
import HomeCarousel from "../carousel/HomeCarousel";
import vinyles from "../../assets/vinyles.jpg";
import instruments from "../../assets/instruments.jpg";
import goodies from "../../assets/goodies.jpeg";

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [message] = useState("");
    const [error, setError] = useState("");

    const imagesToDisplay = [
        {
            src: vinyles,
            title: "Collection de Vinyles",
            description: "Découvrez notre vaste collection de vinyles vintages et modernes"
        },
        {
            src: instruments,
            title: "Instruments de Musique",
            description: "Trouvez une variété d’instruments de musique pour tous les profils."
        },
        {
            src: goodies,
            title: "Goodies",
            description: "Parcourez notre gamme de produits et d’objets de collection EpiMusic."
        },
    ];

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


    return (
        <div>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <HomeCarousel images={imagesToDisplay}/>
            <div className="flex flex-wrap justify-center">
                {error && <p className="text-red-500">{error}</p>}
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        imageSrc={`http://localhost:8000${category.imagePath}`}
                        categoryName={category.name}
                        categoryId={category.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
