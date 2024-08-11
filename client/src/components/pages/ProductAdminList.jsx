import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";

const ProductAdminList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/admin/products")
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error(
                    "Une erreur s'est produite lors de la récupération des produits !",
                    error
                );
                setError(
                    "Une erreur s'est produite lors de la récupération des produits !"
                );
            });
    };

    const deleteProduct = (id) => {
        return axios
            .delete(`http://localhost:8000/api/admin/products/${id}`)
            .then((response) => {
                setProducts(products.filter((product) => product.id !== id));
                setMessage("Produit supprimé avec succès !");
                setError("");
            })
            .catch((error) => {
                console.error(
                    "Une erreur s'est produite lors de la suppression du produit !",
                    error
                );
                setError(
                    "Une erreur s'est produite lors de la suppression du produit !"
                );
                setMessage("");
            });
    };

    const editProduct = (id) => {
        navigate(`/admin/edit-product/${id}`);
    };

    const handleSelectProduct = (id) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(
                selectedProducts.filter((productId) => productId !== id)
            );
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const editSelectedProducts = () => {
        if (selectedProducts.length > 0) {
            navigate(
                `/admin/edit-product/${
                    selectedProducts[0]
                }?selectedProducts=${selectedProducts.join(
                    ","
                )}&currentEditIndex=0`
            );
        } else {
            alert("Veuillez sélectionner au moins un produit à modifier.");
        }
    };

    const deleteSelectedProducts = () => {
        if (
            window.confirm(
                "Êtes-vous sûr de vouloir supprimer les produits sélectionnés ?"
            )
        ) {
            Promise.all(selectedProducts.map((id) => deleteProduct(id)))
                .then(() => {
                    setSelectedProducts([]);
                    fetchProducts();
                })
                .catch(() => {
                    setError(
                        "Une erreur s'est produite lors de la suppression d'un ou plusieurs produits !"
                    );
                    setMessage("");
                });
        }
    };

    return (
        <div className="container mx-auto p-4">
            {message && <p className="text-green-500 font-bold text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-4">Liste des Produits</h1>
                <div className="flex justify-center gap-4 mb-4">
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                        onClick={() => navigate("/admin/create-product")}
                    >
                        Créer un nouveau produit
                    </button>
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                        onClick={editSelectedProducts}
                    >
                        Modifier les sélectionnés
                    </button>
                    <button
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                        onClick={deleteSelectedProducts}
                    >
                        Supprimer les sélectionnés
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col h-full">
                        {product.models.map((model, index) => (
                            <div key={index} className="flex flex-col flex-grow">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleSelectProduct(product.id)}
                                    className="w-5 h-5 mb-2"
                                />
                                <div className="flex justify-center items-center h-96 mb-4 overflow-hidden">
                                    {model.images
                                        .filter((image) => image.is_main)
                                        .map((image, idx) => (
                                            <div key={idx} className="flex justify-center items-center">
                                                <img
                                                    src={`http://localhost:8000${image.path}`}
                                                    alt={`Produit ${product.name}`}
                                                    className="object-contain max-w-full max-h-full"
                                                />
                                            </div>
                                        ))}
                                </div>
                                <h2 className="text-lg font-bold mb-2">{product.name}</h2>
                                <div className="flex flex-col flex-grow">
                                    <p className="line-clamp-3">{product.description}</p>
                                    <p className="text-gray-600">Catégorie : {product.category}</p>
                                    {product.category === "Instrument" && (
                                        <p className="text-gray-600">Marque : {product.brands.join(", ")}</p>
                                    )}
                                    <p className="text-gray-600">Tags : {product.tags.join(", ")}</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {model.color && (
                                            <p className="text-gray-600">Couleur : {model.color}</p>
                                        )}
                                        {model.size && (
                                            <p className="text-gray-600">Taille : {model.size}</p>
                                        )}
                                    </div>
                                    <p className="text-gray-600">Poids : {product.weight} Kg</p>
                                    {product.stocks && product.stocks.length > 0 && (
                                        <div className="text-sm">
                                            {product.stocks[0].quantity > 0 && product.stocks[0].quantity <= 5 ? (
                                                <>
                                                    <p>Stock : {product.stocks[0].quantity}</p>
                                                    <p className="text-orange-500 font-bold">Réapprovisionnement</p>
                                                </>
                                            ) : product.stocks[0].quantity > 5 ? (
                                                <>
                                                    <p>Stock : {product.stocks[0].quantity}</p>
                                                    <p className="text-green-500 font-bold">En stock</p>
                                                </>
                                            ) : (
                                                <p className="text-red-500 font-bold">Rupture de stock</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-lg font-bold mb-2">${model.price}</h2>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700 flex-1"
                                        onClick={() => editProduct(product.id)}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 flex-1"
                                        onClick={() => deleteProduct(product.id)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductAdminList;
