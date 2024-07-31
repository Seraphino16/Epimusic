import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/ProductForm.css";

const ProductAdminEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");
    const [photoPaths, setPhotoPaths] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]); // New state for new photo files
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [stock, setStock] = useState("");

    const searchParams = new URLSearchParams(location.search);
    const selectedProductIds = searchParams.get('selectedProducts')?.split(',') || [];
    const currentEditIndex = parseInt(searchParams.get('currentEditIndex')) || 0;

    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/admin/products/${id}`)
            .then((response) => {
                const productData = response.data;
                setProduct(productData);
                setName(productData.name);
                setDescription(productData.description);
                setCategory(productData.category_id);
                if (productData.models.length > 0) {
                    const model = productData.models[0];
                    setColor(model.color_id || "");
                    setSize(model.size_id || "");
                    setPrice(model.price);
                    setPhotoPaths(model.images.map((img) => img.path));
                    setMainImageIndex(
                        model.images.findIndex((img) => img.is_main)
                    );
                }
                if (productData.stocks.length > 0) {
                    setStock(productData.stocks[0].quantity);
                }
                if (productData.category_id === 2 || productData.category_id === 3) {
                    axios
                        .get(`http://localhost:8000/api/admin/sizes/category/${productData.category_id}`)
                        .then((response) => {
                            setSizes(response.data);
                        })
                        .catch((error) => {
                            console.error("Erreur lors de la récupération des tailles!", error);
                        });
                }
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération du produit!", error);
                setError("Erreur lors de la récupération des données du produit!");
            });

        axios
            .get("http://localhost:8000/api/admin/categories")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des catégories!", error);
                setError("Erreur lors de la récupération des catégories!");
            });

        axios
            .get("http://localhost:8000/api/admin/colors")
            .then((response) => {
                setColors(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des couleurs!", error);
                setError("Erreur lors de la récupération des couleurs!");
            });

    }, [id]);

    const handleCategoryChange = (value) => {
        setCategory(value);

        if (value === "2" || value === "3") {
            axios
                .get(`http://localhost:8000/api/admin/sizes/category/${value}`)
                .then((response) => {
                    setSizes(response.data);
                    setSize("");
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des tailles!", error);
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

    const handlePhotoPathChange = (index, value) => {
        const paths = [...photoPaths];
        paths[index] = value;
        setPhotoPaths(paths);
    };

    const handlePhotoChange = (e) => {
        setPhotoFiles(e.target.files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const uploadedPhotos = [...photoPaths];
            for (let i = 0; i < photoFiles.length; i++) {
                const formData = new FormData();
                formData.append("file", photoFiles[i]);
                const response = await axios.post("http://localhost:8000/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                uploadedPhotos.push(response.data.filePath);
            }

            const updatedProduct = {
                name: name,
                description: description,
                category: category,
                color: shouldDisplayColor(category) ? color : null,
                size: shouldDisplaySize(category) ? size : null,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                photoPaths: uploadedPhotos.filter((path) => path),
                mainImageIndex: mainImageIndex,
            };

            await axios.put(`http://localhost:8000/api/admin/products/${id}`, updatedProduct);

            setMessage("Produit mis à jour avec succès!");
            setError("");
            if (currentEditIndex < selectedProductIds.length - 1) {
                setTimeout(() => {
                    navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex + 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex + 1}`);
                }, 2000);
            } else {
                setTimeout(() => {
                    navigate("/admin/");
                }, 2000);
            }
        } catch (error) {
            setError("Erreur lors de la mise à jour du produit!");
            setMessage("");
            console.error("Erreur lors de la mise à jour du produit!", error);
        }
    };

    if (!product) return <div>Chargement...</div>;

    return (
        <div className="w-full">
            <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                    <p className="text-3xl font-bold leading-7 text-center text-black">
                        Mettre à jour le produit
                    </p>
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="md:flex items-center mt-12">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="name"
                                >
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
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="description"
                                >
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    placeholder="Entrez la description du produit"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="category"
                                >
                                    Catégorie
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) =>
                                        handleCategoryChange(e.target.value)
                                    }
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
                        {shouldDisplayColor(category) && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full md:w-1/2 flex flex-col">
                                    <label
                                        className="font-semibold leading-none text-black"
                                        htmlFor="color"
                                    >
                                        Couleur
                                    </label>
                                    <select
                                        id="color"
                                        value={color}
                                        onChange={(e) =>
                                            setColor(e.target.value)
                                        }
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option
                                            value=""
                                            className="text-gray-500"
                                        >
                                            Sélectionnez une couleur
                                        </option>
                                        {colors.map((col) => (
                                            <option
                                                key={col.id}
                                                value={col.id}
                                            >
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
                                    <label
                                        className="font-semibold leading-none text-black"
                                        htmlFor="size"
                                    >
                                        Taille
                                    </label>
                                    <select
                                        id="size"
                                        value={size}
                                        onChange={(e) =>
                                            setSize(e.target.value)
                                        }
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option
                                            value=""
                                            className="text-gray-500"
                                        >
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
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="price"
                                >
                                    Prix
                                </label>
                                <input
                                    type="number"
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
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="stock"
                                >
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    placeholder="Entrez le stock du produit"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="photos"
                                >
                                    Photos
                                </label>
                                <input
                                    type="file"
                                    id="photos"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        {photoPaths.map((path, index) => (
                            <div key={index} className="md:flex items-center mt-8">
                                <div className="w-full flex flex-col">
                                    <label
                                        className="font-semibold leading-none text-black"
                                        htmlFor={`photoPath${index}`}
                                    >
                                        Chemin de la photo {index + 1}
                                    </label>
                                    <input
                                        type="text"
                                        id={`photoPath${index}`}
                                        placeholder="Entrez le chemin de l'image"
                                        value={path}
                                        onChange={(e) => handlePhotoPathChange(index, e.target.value)}
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    />
                                    <label className="font-semibold leading-none text-black mt-4">
                                        <input
                                            type="radio"
                                            name="mainImage"
                                            checked={mainImageIndex === index}
                                            onChange={() => setMainImageIndex(index)}
                                            className="mr-2"
                                        />
                                        Définir comme image principale
                                    </label>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="submit"
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Mettre à jour le produit
                            </button>
                        </div>
                        {selectedProductIds.length > 1 && (
                            <div className="flex items-center justify-center w-full mt-8">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex - 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex - 1}`)}
                                    disabled={currentEditIndex === 0}
                                    className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                                >
                                    Précédent
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex + 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex + 1}`)}
                                    disabled={currentEditIndex === selectedProductIds.length - 1}
                                    className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductAdminEdit;