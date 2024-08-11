import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CategoriesAdminList = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/admin/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories : ", error);
                setError("Erreur lors de la récupération des catégories.");
            }
        };

        fetchCategories();
    }, []);

    const handleCreateCategory = () => {
        navigate("create");
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await axios.delete(`http://localhost:8000/api/admin/categories/${categoryId}`);
            setCategories(categories.filter(category => category.id !== categoryId));
        } catch (error) {
            console.error("Erreur lors de la suppression de la catégorie : ", error);
            setError("Erreur lors de la suppression de la catégorie.");
        }
    };

    const handleEditCategory = (categoryId) => {
        navigate(`/admin/categories/edit/${categoryId}`);
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Mes Catégories</h2>
            {error && <p className="error text-red-500">{error}</p>}
            <button
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleCreateCategory}
            >
                Créer une catégorie
            </button>
            <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                    <div key={category.id}
                         className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center w-64">
                        <div className="mb-4 w-full h-48 image-container">
                            <img
                                src={`http://localhost:8000${category.imagePath}`}
                                alt={`Category ${category.name}`}
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-center">{category.name}</h3>
                        <div className="flex space-x-2">
                            <button
                                className="bg-green-500 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleEditCategory(category.id)}
                            >
                                Modifier
                            </button>
                            <button
                                className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleDeleteCategory(category.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesAdminList;