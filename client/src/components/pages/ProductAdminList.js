import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/ProductList.css'; // Import CSS file

const ProductAdminList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get('http://localhost:8000/api/admin/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
                setError('There was an error fetching the products!');
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
            setSelectedProducts(selectedProducts.filter(productId => productId !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const editSelectedProducts = () => {
        if (selectedProducts.length > 0) {
            navigate(`/admin/edit-product/${selectedProducts[0]}?selectedProducts=${selectedProducts.join(',')}&currentEditIndex=0`);
        } else {
            alert('Please select at least one product to edit.');
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
            <button className="delete-button" onClick={deleteSelectedProducts}>Delete Selected</button>
            <button className="edit-button" onClick={editSelectedProducts}>Edit Selected</button>
            <div className="product-list">
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                        />
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
                        <button className="edit-button" onClick={() => editProduct(product.id)}>Edit</button>
                        <button className="delete-button" onClick={() => deleteProduct(product.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductAdminList;