import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "../../styles/ProductList.css";

const ProductList = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");

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

        axios.post(`/api/cart/add/${product.id}`, data)
            .then(response => {
                console.log("Produit ajouté au panier : ", response.data);
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
        <div>
            {error && <p className="error">{error}</p>}
            <h1 className="text-center text-4xl font-bold my-4">
                Liste des produits de la catégorie sélectionnée
            </h1>
            <div className="product-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <Link 
                            to={`/product/${product.id}`} 
                            key={product.id} 
                            className="product-item transition-transform duration-300 ease-in-out hover:scale-105 bg-white"
                        >
                            <div className="model-item">
                                <div className="image-container">
                                
                                    {product.image_url ? (
                                        <div className="image-item">
                                            <img
                                                src={`http://localhost:8000${product.image_url}`}
                                                alt={`Produit ${product.name}`}
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="no-image">
                                            <p>Aucune image disponible</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="product-name">
                                        {product.name}
                                    </h2>
                                </div>
                                <div className="flex flex-column">
                                    <div className="product-details">
                                        <p className="line-clamp-3">{product.description}</p>
                                        <p className="product-category">
                                            Catégorie : {product.category}
                                        </p>
                                        <div className="flex flex-row space-x-12">
                                            {product.color && (
                                                <p className="product-color">
                                                    Couleur : {product.color}
                                                </p>
                                            )}
                                            {product.size_value && product.size_unit && (
                                                <p className="product-size">
                                                    Taille : {product.size_value} {product.size_unit}
                                                </p>
                                            )}
                                        </div>
                                        {product.stock !== undefined && (
                                            <div className="product-stock">
                                                {product.stock > 0 && product.stock <= 5 ? (
                                                    <>
                                                        <p>Stock : {product.stock}</p>
                                                        <p className="stock-status restocking">Réapprovisionnement</p>
                                                    </>
                                                ) : product.stock > 5 ? (
                                                    <>
                                                        <p>Stock : {product.stock}</p>
                                                        <p className="stock-status in-stock">En stock</p>
                                                    </>
                                                ) : (
                                                    <p className="stock-status out-of-stock">Rupture de stock</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h2>${product.price}</h2>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>Aucun produit trouvé</p>
                )}
            </div>
        </div>
    );
};

export default ProductList;