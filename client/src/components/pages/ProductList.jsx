import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../styles/ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");

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

    return (
        <div>
            {error && <p className="error">{error}</p>}
            <h1 className="text-center text-4xl font-bold my-4">
                Liste des produits de la catégorie sélectionnée
            </h1>
            <div className="product-list">
                {products.map((product) => (
                    <Link 
                    to={`/product/${product.id}`} 
                    key={product.id} 
                    className="product-item transition-transform duration-300 ease-in-out hover:scale-105"
                >
                        {product.models.map((model, index) => (
                            <div key={index} className="model-item">
                                <div className="image-container">
                                    {model.images.map((image, idx) => (
                                        <div key={idx} className="image-item">
                                            <img
                                                src={image.path}
                                                alt={`Produit ${product.name}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h2 className="product-name">
                                        {product.name}
                                    </h2>
                                </div>
                                <div className="flex flex-column">
                                    <div className="product-details">
                                        <p>{product.description}</p>
                                        <p className="product-category">
                                            Catégorie : {product.category}
                                        </p>
                                        <div className="flex flex-row space-x-12">
                                            {model.color && (
                                                <p className="product-color">
                                                    Couleur : {model.color}
                                                </p>
                                            )}
                                            {model.size && (
                                                <p className="product-size">
                                                    Taille : {model.size}
                                                </p>
                                            )}
                                        </div>
                                        {product.stocks &&
                                            product.stocks.length > 0 && (
                                                <div className="product-stock">
                                                    {product.stocks[0]
                                                        .quantity > 0 &&
                                                    product.stocks[0]
                                                        .quantity <= 5 ? (
                                                        <>
                                                            <p>
                                                                Stock :{" "}
                                                                {
                                                                    product
                                                                        .stocks[0]
                                                                        .quantity
                                                                }
                                                            </p>
                                                            <p className="stock-status restocking">
                                                                Réapprovisionnement
                                                            </p>
                                                        </>
                                                    ) : product.stocks[0]
                                                          .quantity > 5 ? (
                                                        <>
                                                            <p>
                                                                Stock :{" "}
                                                                {
                                                                    product
                                                                        .stocks[0]
                                                                        .quantity
                                                                }
                                                            </p>
                                                            <p className="stock-status in-stock">
                                                                En stock
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="stock-status out-of-stock">
                                                            Rupture de stock
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div>
                                    <h2>${model.price}</h2>
                                </div>
                            </div>
                        ))}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
