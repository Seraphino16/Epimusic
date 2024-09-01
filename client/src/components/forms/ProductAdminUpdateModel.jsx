import React, { useEffect, useState, useCallback } from 'react';
import Alert from '../Alerts/Alert';
import { useNavigate } from "react-router-dom";

const ProductAdminUpdateModel = ({ isOpen, onClose, modelId, productCategoryId, message }) => {
    const [model, setModel] = useState(null);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [formData, setFormData] = useState({
        color: '',
        size: '',
        price: '',
        stock: '',
        images: []
    });
    const [photoFiles, setPhotoFiles] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(null);
    const [deletedPhotos, setDeletedPhotos] = useState([]);
    const [alert, setAlert] = useState({ type: 'error', message: message });
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && modelId) {
            fetchModelData(modelId);
        }
    }, [isOpen, modelId]);

    useEffect(() => {
        setAlert(prevAlert => ({ ...prevAlert, message }));
    }, [message]);

    const fetchModelData = useCallback(async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/model/${id}`); //localhost
            const data = await response.json();
            
            if (data) {
                setModel(data);
                setFormData({
                    color: data.color ? data.color.id : '',
                    size: data.size ? data.size.id : '',
                    price: data.price || '',
                    stock: data.stock || '',
                    images: data.images || []
                });

                fetchColors();
                fetchSizes(productCategoryId);
            }
        } catch (error) {
            console.error("Error fetching model data:", error);
            setAlert({ type: 'error', message: 'Erreur lors de la récupération des données du modèle.' });
        }
    }, [productCategoryId]);

    const fetchColors = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/colors'); //localhost
            const data = await response.json();
            setColors(data);
        } catch (error) {
            console.error("Error fetching colors:", error);
            setAlert({ type: 'error', message: 'Erreur lors de la récupération des couleurs.' });
        }
    }, []);

    const fetchSizes = useCallback(async (categoryId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/sizes/category/${categoryId}`); //localhost
            const data = await response.json();
            setSizes(data);
        } catch (error) {
            console.error("Error fetching sizes:", error);
            setAlert({ type: 'error', message: 'Erreur lors de la récupération des tailles.' });
        }
    }, []);

    const shouldDisplayColor = (category) => {
        return category === 1 || category === 3;
    };

    const shouldDisplaySize = (category) => {
        return category === 2 || category === 3;
    };

    const handleChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handlePhotoChange = async (e) => {
        const files = Array.from(e.target.files);
        setPhotoFiles(files);
    
        try {
            const uploadedImages = await Promise.all(files.map(file => uploadImage(file)));
            setFormData(prevState => ({
                ...prevState,
                images: [...prevState.images, ...uploadedImages.map((path, index) => ({
                    path,
                    is_main: index === mainImageIndex
                }))]
            }));
        } catch (error) {
            console.error('Erreur lors de l\'upload des images:', error);
            setAlert({ type: 'error', message: 'Erreur lors de l\'upload des images.' });
        }
    };

    const uploadImage = useCallback(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/upload", { //localhost
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Erreur lors de l\'upload de l\'image');

            const result = await response.json();
            return result.filePath;
        } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', error);
            setAlert({ type: 'error', message: 'Erreur lors de l\'upload de l\'image.' });
            throw error;
        }
    }, []);

    const handleRemovePhoto = (index) => {
        const removedPhoto = formData.images[index].path;
        setFormData(prevState => ({
            ...prevState,
            images: prevState.images.filter((_, i) => i !== index)
        }));
        setDeletedPhotos(prev => [...prev, removedPhoto]);
    };

    const handleSetMainImage = (index) => {
        setMainImageIndex(index);
        setFormData(prevState => ({
            ...prevState,
            images: prevState.images.map((img, i) => ({
                ...img,
                is_main: i === index
            }))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedProduct = {
                color: formData.color,
                size: formData.size,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                photoPaths: formData.images.map(img => img.path),
                mainImageIndex: formData.images.length === 0 ? 0 : mainImageIndex,
                deletedPhotos: deletedPhotos
            };


            const response = await fetch(`http://localhost:8000/api/admin/model/${modelId}`, { //localhost
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setAlert({ type: 'error', message: errorData.error || 'Erreur lors de la mise à jour du produit.' });
                throw new Error(errorData.error || 'Erreur lors de la mise à jour du produit.');
            }

            setAlert({ type: 'success', message: 'Produit mis à jour avec succès.' });
            onClose();
            navigate(`/admin/products`);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-800 opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg p-6 z-50 w-full max-w-lg">
                <h2 className="text-2xl font-semibold mb-4">Mettre à jour le modèle</h2>
                <Alert type={alert.type} message={alert.message} />
                <form onSubmit={handleSubmit}>
                    {shouldDisplayColor(productCategoryId) && (
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="color">Couleur :</label>
                            <select
                                id="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded p-2"
                            >
                                <option value="">Sélectionnez une couleur</option>
                                {colors.map(color => (
                                    <option key={color.id} value={color.id}>{color.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {shouldDisplaySize(productCategoryId) && (
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="size">Taille :</label>
                            <select
                                id="size"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded p-2"
                            >
                                <option value="">Sélectionnez une taille</option>
                                {sizes.map(size => (
                                    <option key={size.id} value={size.id}>{size.value} {size.unit}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="price">Prix :</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded p-2"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="stock">Stock :</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded p-2"
                            min="0"
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <label className="font-semibold leading-none text-black" htmlFor="photos">Photos</label>
                        <input
                            type="file"
                            id="photos"
                            multiple
                            onChange={handlePhotoChange}
                            className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                        />
                        <div className="flex flex-col mt-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="flex items-center mt-2">
                                    <img src={image.path} alt={`Photo ${index}`} className="w-16 h-16 object-cover mr-4" />
                                    <button
                                        type="button"
                                        className={`mr-4 px-3 py-1 rounded ${image.is_main ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                        onClick={() => handleSetMainImage(index)}
                                    >
                                        {image.is_main ? 'Image principale' : 'Définir comme principale'}
                                    </button>
                                    <button
                                        type="button"
                                        className="ml-2 text-red-600"
                                        onClick={() => handleRemovePhoto(index)}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Enregistrer les modifications</button>
                </form>
            </div>
        </div>
    );
};

export default ProductAdminUpdateModel;
