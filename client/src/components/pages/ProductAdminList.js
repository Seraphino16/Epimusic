import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/ProductList.css";
import ProductCard from "../products/ProductCard";

const ProductAdminList = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/admin/products")
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error(
                    "There was an error fetching the products!",
                    error
                );
                setError("There was an error fetching the products!");
            });
    }, []);

    const deleteProduct = (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            axios
                .delete(`http://localhost:8000/api/admin/products/${id}`)
                .then((response) => {
                    setProducts(
                        products.filter((product) => product.id !== id)
                    );
                    setMessage("Product deleted successfully!");
                    setError("");
                })
                .catch((error) => {
                    console.error(
                        "There was an error deleting the product!",
                        error
                    );
                    setError("There was an error deleting the product!");
                    setMessage("");
                });
        }
    };

    const editProduct = (id) => {
        navigate(`/admin/edit-product/${id}`);
    };

    return (
        <div>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <h1>Product List</h1>
            <Link to="/admin/create-product">
                <button className="create-button">Create a new product</button>
            </Link>
            <div className="product-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        editProduct={editProduct}
                        deleteProduct={deleteProduct}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductAdminList;