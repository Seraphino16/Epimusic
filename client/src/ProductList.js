import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProductList.css'; // Import CSS file

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    }, []);

    const deleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            axios.delete(`http://localhost:8000/api/products/${id}`)
                .then(response => {
                    setProducts(products.filter(product => product.id !== id));
                })
                .catch(error => {
                    console.error('There was an error deleting the product!', error);
                });
        }
    };

    return (
        <div>
            <h1>Product List</h1>
            <Link to="/create-product">
                <button className="create-button">Create a new product</button>
            </Link>
            <div className="product-list">
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        <p>Category: {product.category}</p>
                        {product.models.map((model, index) => (
                            <div key={index} className="model-item">
                                <p>Color: {model.color || 'N/A'}</p>
                                <p>Size: {model.size || 'N/A'}</p>
                                <p>Price: ${model.price}</p>
                                <div className="images">
                                    {model.images.map((image, idx) => (
                                        <div key={idx} className="image-item">
                                            <img src={image.path} alt={`Product ${product.name}`} />
                                            <p>{image.is_main ? 'Main Image' : 'Additional Image'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button className="delete-button" onClick={() => deleteProduct(product.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;