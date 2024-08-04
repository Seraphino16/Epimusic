import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/ProductList.css";

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
        axios.get('http://localhost:8000/api/admin/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error(
                    "Une erreur s'est produite lors de la récupération des produits !",
                    error
                );
                setError("Une erreur s'est produite lors de la récupération des produits !");
            });
    };

    const deleteProduct = (id) => {
        return axios.delete(`http://localhost:8000/api/admin/products/${id}`)
            .then(response => {
                setProducts(products.filter(product => product.id !== id));
                setMessage('Produit supprimé avec succès !');
                setError('');
            })
            .catch(error => {
                console.error('Une erreur s\'est produite lors de la suppression du produit !', error);
                setError('Une erreur s\'est produite lors de la suppression du produit !');
                setMessage('');
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
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les produits sélectionnés ?')) {
            Promise.all(selectedProducts.map(id => deleteProduct(id)))
                .then(() => {
                    setSelectedProducts([]);
                    fetchProducts();
                })
                .catch(() => {
                    setError('Une erreur s\'est produite lors de la suppression d\'un ou plusieurs produits !');
                    setMessage('');
                });
        }
    };

    return (
        <div>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <h1>Liste des Produits</h1>
            <Link to="/admin/create-product">
                <button className="create-button">Créer un nouveau produit</button>
            </Link>
            <button
                className="group-delete-button"
                onClick={deleteSelectedProducts}
            >
                Supprimer les sélectionnés
            </button>
            <button
                className="group-edit-button"
                onClick={editSelectedProducts}
            >
                Modifier les sélectionnés
            </button>
            <div className="product-list">
                {products.map((product) => (
                    <div key={product.id} className="bg-white product-item">
                        {product.models.map((model, index) => (
                            <div key={index} className="model-item">
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(
                                            product.id
                                        )}
                                        onChange={() =>
                                            handleSelectProduct(product.id)
                                        }
                                        className="select-checkbox"
                                    />
                                </div>
                                <div className="image-container">
                                    {model.images
                                        .filter(image => image.is_main)
                                        .map((image, idx) => (
                                            <div key={idx} className="image-item">
                                                <img
                                                    src={`http://localhost:8000${image.path}`}
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
                                        <p className="line-clamp-3">{product.description}</p>
                                        <p className="product-category">
                                            Catégorie : {product.category}
                                        </p>
                                        {product.category === 'Instrument' && (
                                            <div>
                                                <p className="product-brand">
                                                    Marque : {product.brands.join(', ')}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="product-tags">
                                                Tags : {product.tags.join(', ')}
                                            </p>
                                        </div>
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
                                        <p className="product-weight">
                                            Poids : {product.weight} Kg
                                        </p>
                                        {product.stocks && product.stocks.length > 0 && (
                                            <div className="product-stock">
                                                {product.stocks[0].quantity > 0 && product.stocks[0].quantity <= 5 ? (
                                                    <>
                                                        <p>Stock : {product.stocks[0].quantity}</p>
                                                        <p className="stock-status restocking">Réapprovisionnement</p>
                                                    </>
                                                ) : product.stocks[0].quantity > 5 ? (
                                                    <>
                                                        <p>Stock : {product.stocks[0].quantity}</p>
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
                                    <h2>${model.price}</h2>
                                </div>
                                <div className="button-group">
                                    <button
                                        className="edit-button"
                                        onClick={() => editProduct(product.id)}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            deleteProduct(product.id)
                                        }
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