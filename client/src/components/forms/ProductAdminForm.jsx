import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/ProductForm.css";

const ProductAdminForm = () => {
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [brand, setBrand] = useState("");
    const [tags, setTags] = useState([]);
    const [weight, setWeight] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [photoFiles, setPhotoFiles] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/api/admin/categories") //localhost
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des catégories !", error);
            });

        axios.get("http://localhost:8000/api/admin/colors") //localhost
            .then((response) => {
                setColors(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des couleurs !", error);
            });
    }, []);

    const handlePhotoChange = (e) => {
        setPhotoFiles(Array.from(e.target.files));
    };

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== "") {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (price <= 0 || stock < 0 || weight < 0) {
            setError("Le prix doit être supérieur à zéro, le stock et le poids ne peuvent pas être négatifs !");
            setIsSubmitting(false);
            return;
        }

        try {
            const uploadedPhotos = [];
            for (let i = 0; i < photoFiles.length; i++) {
                const formData = new FormData();
                formData.append("file", photoFiles[i]);
                const response = await axios.post("http://localhost:8000/upload", formData, { //localhost
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                uploadedPhotos.push(response.data.filePath);
            }

            const newProduct = {
                name: name,
                description: description,
                category: category,
                color: shouldDisplayColor(category) ? color : null,
                size: shouldDisplaySize(category) ? size : null,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                weight: parseFloat(weight),
                photoPaths: uploadedPhotos,
                mainImageIndex: mainImageIndex,
                brand: category === "1" ? brand : null,
                tags: tags
            };

         
            await axios.post("http://localhost:8000/api/admin/products", newProduct); //localhost

            setMessage("Produit créé avec succès !");
            setError("");
            setTimeout(() => {
                navigate("/admin/products");
            }, 2000);
        } catch (error) {
            setError("Erreur lors de la création du produit !");
            setMessage("");
            setIsSubmitting(false);
            console.error("Erreur lors de la création du produit !", error);
        }
    };

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);

        if (selectedCategory === "2" || selectedCategory === "3") {
            axios.get(`http://localhost:8000/api/admin/sizes/category/${selectedCategory}`) //localhost
                .then((response) => {
                    setSizes(response.data);
                    setSize("");
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des tailles !", error);
                });
        } else {
            setSizes([]);
            setSize("");
        }
    };

    const shouldDisplayColor = (category) => {
        return category === "1" || category === "3";
    };

    const shouldDisplaySize = (category) => {
        return category === "2" || category === "3";
    };

    return (
        <div className="w-full">
            <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                    <p className="text-3xl font-bold leading-7 text-center text-black">
                        Créer un produit
                    </p>
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="md:flex items-center mt-12">
                            <div className="w-full md:w-1/2 flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="name">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Entrez le nom du produit"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col md:ml-6 md:mt-0 mt-4">
                                <label className="font-semibold leading-none text-black" htmlFor="category">
                                    Catégorie
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={handleCategoryChange}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                >
                                    <option value="" className="text-gray-500">
                                        Sélectionnez une catégorie
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Entrez la description du produit"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    rows="5"
                                />
                            </div>
                        </div>
                        {category === "1" && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full flex flex-col">
                                    <label className="font-semibold leading-none text-black" htmlFor="brand">
                                        Marque
                                    </label>
                                    <input
                                        type="text"
                                        id="brand"
                                        placeholder="Entrez le nom de la marque"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="tags">
                                    Tags
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="tags"
                                        placeholder="Entrez un tag"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200 flex-grow"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="bg-blue-700 text-white px-4 py-2 rounded ml-2"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                                <div className="flex flex-wrap mt-2">
                                    {tags.map((tag, index) => (
                                        <div key={index}
                                             className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full mr-2 mt-2">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(index)}
                                                className="ml-2 text-red-600"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {shouldDisplayColor(category) && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full flex flex-col">
                                    <label className="font-semibold leading-none text-black" htmlFor="color">
                                        Couleur
                                    </label>
                                    <select
                                        id="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option value="" className="text-gray-500">
                                            Sélectionnez une couleur
                                        </option>
                                        {colors.map((col) => (
                                            <option key={col.id} value={col.id}>
                                                {col.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        {shouldDisplaySize(category) && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full flex flex-col">
                                    <label className="font-semibold leading-none text-black" htmlFor="size">
                                        Taille
                                    </label>
                                    <select
                                        id="size"
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option value="" className="text-gray-500">
                                            Sélectionnez une taille
                                        </option>
                                        {sizes.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.value} {s.unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="weight">
                                    Poids (Kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="weight"
                                    placeholder="Entrez le poids du produit en Kg"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    min="0"
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="price"
                                >
                                    Prix
                                </label>
                                <input
                                    type="text"
                                    id="price"
                                    placeholder="Entrez le prix du produit"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="stock">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    placeholder="Entrez le stock du produit"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    min="0"
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="photos">
                                    Photos
                                </label>
                                <input
                                    type="file"
                                    id="photos"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                                <div className="flex flex-col mt-4">
                                    {photoFiles.map((file, index) => (
                                        <div key={index} className="flex items-center mt-2">
                                            <p className="mr-4">{file.name}</p>
                                            <button
                                                type="button"
                                                className={`mr-4 px-3 py-1 rounded ${mainImageIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                                onClick={() => setMainImageIndex(index)}
                                            >
                                                {mainImageIndex === index ? 'Image principale' : 'Définir comme principale'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`font-semibold leading-none text-white py-4 px-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none ${
                                    isSubmitting ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-600'
                                }`}
                            >
                                Créer un produit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductAdminForm;