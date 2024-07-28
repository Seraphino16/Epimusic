import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductForm.css';  // Import the CSS file

const EditProductForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state;

    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [category, setCategory] = useState(product.category_id);
    const [color, setColor] = useState(product.models[0]?.color || '');
    const [size, setSize] = useState(product.models[0]?.size || '');
    const [price, setPrice] = useState(product.models[0]?.price || '');
    const [photoPaths, setPhotoPaths] = useState(product.models[0]?.images.map(img => img.path) || ['']);
    const [mainImageIndex, setMainImageIndex] = useState(product.models[0]?.images.findIndex(img => img.is_main) || 0);
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

    const handlePhotoPathChange = (index, value) => {
        const paths = [...photoPaths];
        paths[index] = value;
        setPhotoPaths(paths);
    };

    const addPhotoPathField = () => {
        setPhotoPaths([...photoPaths, '']);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const updatedProduct = {
            name: name,
            description: description,
            category: category,
            color: color,
            size: size,
            price: parseFloat(price),
            photoPaths: photoPaths.filter(path => path), // Filter out empty paths
            mainImageIndex: mainImageIndex // Send the main image index
        };

        axios.put(`http://localhost:8000/api/products/${product.id}`, updatedProduct)
            .then(response => {
                setMessage('Product updated successfully!');
                setError('');
                navigate('/');
            })
            .catch(error => {
                setError('There was an error updating the product!');
                setMessage('');
                console.error('There was an error updating the product!', error);
            });
    };

    const shouldDisplayColorAndSize = category => {
        const goodiesId = 2;
        const vinylsId = 3;
        return category === goodiesId.toString() || category === vinylsId.toString();
    };

    return (
        <form onSubmit={handleSubmit}>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <div className="form-group">
                <label htmlFor="name">Name :</label>
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
                <label htmlFor="description">Description :</label>
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
                <label htmlFor="category">Category :</label>
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
            {shouldDisplayColorAndSize(category) && (
                <>
                    <div className="form-group">
                        <label htmlFor="color">Color :</label>
                        <select
                            id="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
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
                        <label htmlFor="size">Size :</label>
                        <select
                            id="size"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                        >
                            <option value="" style={{ color: 'gray' }}>Select a size</option>
                            {sizes.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}
            <div className="form-group">
                <label htmlFor="price">Price :</label>
                <input
                    type="number"
                    id="price"
                    placeholder="Enter product price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            {photoPaths.map((path, index) => (
                <div key={index} className="form-group photo-group">
                    <label htmlFor={`photoPath${index}`}>Photo Path {index + 1} :</label>
                    <input
                        type="text"
                        id={`photoPath${index}`}
                        placeholder="Enter image path"
                        value={path}
                        onChange={(e) => handlePhotoPathChange(index, e.target.value)}
                    />
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="mainImage"
                            checked={mainImageIndex === index}
                            onChange={() => setMainImageIndex(index)}
                        />
                        Set as main image
                    </label>
                </div>
            ))}
            <div className="button-group">
                <button type="button" onClick={addPhotoPathField}>Add another photo path</button>
                <button type="submit">Update Product</button>
            </div>
        </form>
    );
};

export default EditProductForm;