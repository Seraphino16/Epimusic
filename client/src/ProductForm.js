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
    const [photoPaths, setPhotoPaths] = useState(['']); // State for photo paths
    const [mainImageIndex, setMainImageIndex] = useState(0); // State for main image index
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

        const newProduct = {
            name: name,
            description: description,
            category: category,
            color: color,
            size: size,
            price: parseFloat(price),
            photoPaths: photoPaths.filter(path => path), // Filter out empty paths
            mainImageIndex: mainImageIndex // Send the main image index
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
                setPhotoPaths(['']);
                setMainImageIndex(0);
            })
            .catch(error => {
                setError('There was an error creating the product!');
                setMessage('');
                console.error('There was an error creating the product!', error);
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
                <button type="submit">Create Product</button>
            </div>
        </form>
    );
};

export default ProductForm;