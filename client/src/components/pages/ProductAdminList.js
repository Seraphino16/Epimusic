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
                    "There was an error fetching the products!",
                    error
                );
                setError("There was an error fetching the products!");
            });
    };

    const deleteProduct = (id) => {
        return axios.delete(`http://localhost:8000/api/admin/products/${id}`)
            .then(response => {
                setProducts(products.filter(product => product.id !== id));
                setMessage('Product deleted successfully!');
                setError('');
            })
            .catch(error => {
                console.error('There was an error deleting the product!', error);
                setError('There was an error deleting the product!');
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
            alert("Please select at least one product to edit.");
        }
    };

    const deleteSelectedProducts = () => {
        if (window.confirm('Are you sure you want to delete the selected products?')) {
            Promise.all(selectedProducts.map(id => deleteProduct(id)))
                .then(() => {
                    setSelectedProducts([]);
                    fetchProducts(); // Rafraîchir la liste des produits
                })
                .catch(() => {
                    setError('There was an error deleting one or more products!');
                    setMessage('');
                });
        }
    };

    return (
        <div>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <h1>Product List</h1>
            <Link to="/admin/create-product">
                <button className="create-button">Create a new product</button>
            </Link>
            <button
                className="group-delete-button"
                onClick={deleteSelectedProducts}
            >
                Delete Selected
            </button>
            <button
                className="group-edit-button"
                onClick={editSelectedProducts}
            >
                Edit Selected
            </button>
            <div className="product-list">
                {products.map((product) => (
                    <div key={product.id} className="product-item">
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
                                    {model.images.map((image, idx) => (
                                        <div key={idx} className="image-item">
                                            <img
                                                src={image.path}
                                                alt={`Product ${product.name}`}
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
                                            Category: {product.category}
                                        </p>
                                        <div className="flex flex-row space-x-12">
                                            {model.color && (
                                                <p className="product-color">
                                                    Color: {model.color}
                                                </p>
                                            )}
                                            {model.size && (
                                                <p className="product-size">
                                                    Size: {model.size}
                                                </p>
                                            )}
                                        </div>
                                        {product.stocks && product.stocks.length > 0 && (
                                            <div className="product-stock">
                                                {product.stocks[0].quantity > 0 && product.stocks[0].quantity <= 5 ? (
                                                    <>
                                                        <p>Stock: {product.stocks[0].quantity}</p>
                                                        <p className="stock-status restocking">Restocking</p>
                                                    </>
                                                ) : product.stocks[0].quantity > 5 ? (
                                                    <>
                                                        <p>Stock: {product.stocks[0].quantity}</p>
                                                        <p className="stock-status in-stock">In Stock</p>
                                                    </>
                                                ) : (
                                                    <p className="stock-status out-of-stock">Out of Stock</p>
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
                                        Edit
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            deleteProduct(product.id)
                                        }
                                    >
                                        Delete
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