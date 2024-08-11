import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const ProductList = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [categoryId]);

    const fetchProducts = async () => {
        axios
            .get(`http://localhost:8000/api/products/category/${categoryId}`)
            .then((response) => {
                const uniqueProducts = Array.from(new Set(response.data.map(product => product.id)))
                    .map(id => {
                        return response.data.find(product => product.id === id);
                    });
                setProducts(uniqueProducts);
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

    const handleAddToCart = (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('cart_token');
        const data = {
            model_id: product.model_id,
            quantity: 1,
        };

        if (user) {
            data.user_id = user.id;
        } else if (token) {
            data.token = token;
        }

        axios.post(`http://localhost:8000/api/cart/add/${product.id}`, data)
            .then(response => {
                setAlert("Produit ajouté au panier !");
                if (response.data.token) {
                    localStorage.setItem('cart_token', response.data.token);
                }
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout du produit au panier : ", error);
                setAlert("Erreur lors de l'ajout du produit au panier.");
            });
    };

    return (
        <div className="container mx-auto p-4">
            {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}
            {alert && <p className="text-green-500 font-bold text-center mb-4">{alert}</p>}
            <h1 className="text-center text-4xl font-bold my-4">
                Liste des produits de la catégorie sélectionnée
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col h-full transition-transform duration-300 ease-in-out hover:scale-105">
                            <Link
                                to={`/product/${product.id}`}
                                className="flex flex-col h-full"
                            >
                                <div className="flex-1 flex justify-center items-center mb-4">
                                    {product.image_url ? (
                                        <img
                                            src={`http://localhost:8000${product.image_url}`}
                                            alt={`Produit ${product.name}`}
                                            className="object-contain max-w-full max-h-48"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-48 bg-gray-200 text-gray-600">
                                            <p>Aucune image disponible</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <h2 className="text-lg font-bold mb-2 line-clamp-1">
                                        {product.name}
                                    </h2>
                                    <p className="line-clamp-3 mb-2">{product.description}</p>
                                    {product.stock !== undefined && (
                                        <div className="text-sm mb-2">
                                            {product.stock > 0 && product.stock <= 5 ? (
                                                <>
                                                    <p>Stock : {product.stock}</p>
                                                    <p className="text-orange-500 font-bold">Réapprovisionnement</p>
                                                </>
                                            ) : product.stock > 5 ? (
                                                <>
                                                    <p>Stock : {product.stock}</p>
                                                    <p className="text-green-500 font-bold">En stock</p>
                                                </>
                                            ) : (
                                                <p className="text-red-500 font-bold">Rupture de stock</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-xl font-bold">
                                        ${product.price}
                                    </div>
                                </div>
                            </Link>
                            <button
                                className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 w-full flex items-center justify-center"
                                onClick={() => handleAddToCart(product)}
                            >
                                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                Ajouter au panier
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center">Aucun produit trouvé</p>
                )}
            </div>
        </div>
    );
};

export default ProductList;
