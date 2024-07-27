import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductForm.css';  // Import the CSS file

const ProductForm = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/api/categories')
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the categories!', error);
            });
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        const newProduct = {
            name: name,
            description: description,
            category: category
        };

        axios.post('http://localhost:8000/api/products', newProduct)
            .then(response => {
                console.log('Product created successfully', response.data);
                setName('');
                setDescription('');
                setCategory('');
            })
            .catch(error => {
                console.error('There was an error creating the product!', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Enter product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <input
                    type="text"
                    id="description"
                    placeholder="Enter product description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="" style={{ color: 'gray' }}>Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit">Create Product</button>
        </form>
    );
};

export default ProductForm;