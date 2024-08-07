import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ProductList.css";
import CategoryCard from "../cards/CategoryCard";
import HomeCarousel from "../carousel/HomeCarousel";
import vinyles from "../../assets/vinyles.jpg";
import instruments from "../../assets/instruments.jpg";
import goodies from "../../assets/goodies.jpeg";
import bgHome from "../../assets/bg-home.png";

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [message] = useState("");
    const [error, setError] = useState("");
    const imagesToDisplay = [vinyles, instruments, bgHome, goodies];

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
            <HomeCarousel images={imagesToDisplay} />
            <div className="flex flex-wrap justify-center">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        imageSrc={getCategoryImage(category.name)}
                        categoryName={category.name}
                        categoryId={category.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
