import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductForm.css';  // Import the CSS file

const ProductForm = () => {
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');
    const [price, setPrice] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [isMainImage, setIsMainImage] = useState(false);
    const [message, setMessage] = useState('');  // State for the message
    const [error, setError] = useState('');  // State for the error

    useEffect(() => {
        axios.get('http://localhost:8000/api/categories')
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the categories!', error);
            });

        axios.get('http://localhost:8000/api/colors')
            .then(response => {
                setColors(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the colors!', error);
            });

        axios.get('http://localhost:8000/api/sizes')
            .then(response => {
                setSizes(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the sizes!', error);
            });
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        const newProduct = {
            name: name,
            description: description,
            category: category,
            color: color,
            size: size,
            price: parseFloat(price),
            imagePath: imagePath,
            isMainImage: isMainImage
        };

        axios.post('http://localhost:8000/api/products', newProduct)
            .then(response => {
                setMessage('Product created successfully!');
                setError('');
                setName('');
                setDescription('');
                setCategory('');
                setColor('');
                setSize('');
                setPrice('');
                setImagePath('');
                setIsMainImage(false);
            })
            .catch(error => {
                setError('There was an error creating the product!');
                setMessage('');
                console.error('There was an error creating the product!', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
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
            <div className="form-group">
                <label htmlFor="color">Color:</label>
                <select
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                >
                    <option value="" style={{ color: 'gray' }}>Select a color</option>
                    {colors.map((col) => (
                        <option key={col.id} value={col.id}>
                            {col.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="size">Size:</label>
                <select
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    required
                >
                    <option value="" style={{ color: 'gray' }}>Select a size</option>
                    {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                    type="number"
                    id="price"
                    placeholder="Enter product price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="imagePath">Image Path:</label>
                <input
                    type="text"
                    id="imagePath"
                    placeholder="Enter image path"
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="isMainImage">Is Main Image:</label>
                <input
                    type="checkbox"
                    id="isMainImage"
                    checked={isMainImage}
                    onChange={(e) => setIsMainImage(e.target.checked)}
                />
            </div>
            <button type="submit">Create Product</button>
        </form>
    );
};

export default ProductForm;