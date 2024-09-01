import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/ProductForm.css";

const ProductAdminEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");
    const [photoPaths, setPhotoPaths] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [stock, setStock] = useState("");
    const [brand, setBrand] = useState("");
    const [tags, setTags] = useState([]);
    const [weight, setWeight] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [deletedPhotos, setDeletedPhotos] = useState([]);

    const [models, setModels] = useState([]);
    const [currentModelIndex, setCurrentModelIndex] = useState(0);
    const [stocks, setStocks] = useState([]);
   


    const searchParams = new URLSearchParams(location.search);
    const selectedProductIds = searchParams.get('selectedProducts')?.split(',') || [];
    const currentEditIndex = parseInt(searchParams.get('currentEditIndex')) || 0;

    useEffect(() => {
        axios.get(`http://localhost:8000/api/admin/products/${id}`)
            .then((response) => {
                const productData = response.data;
              
                setProduct(productData);
                setName(productData.name);
                setDescription(productData.description);
                setCategory(productData.category.id);
                setBrand(productData.brand || "");
                setTags(productData.tags || []);
                setModels(productData.models || []);
                setWeight(productData.weight || "");

                if (productData.models.length > 0) {
                    const firstModel = productData.models[0];
                    setPrice(firstModel.price || "");
                    setPhotoPaths(firstModel.images.map((img) => img.path) || []);
                    setMainImageIndex(firstModel.images.findIndex((img) => img.is_main) || 0);
                    setColor(firstModel.color_id);
                    setSize(firstModel.size_id);
                    setStock(firstModel.stock || 0);
                    setMainImageIndex(firstModel.images.findIndex((img) => img.is_main) || 0);

                }
                
                // if (productData.stocks.length > 0) {
                //     setStocks(productData.stocks.quantity);

                   
                // }

                if (productData.category.id === 2 || productData.category.id === 3) {
                    axios.get(`http://localhost:8000/api/admin/sizes/category/${productData.category.id}`)
                        .then((response) => {
                            setSizes(response.data);
                        })
                        .catch((error) => {
                            console.error("Erreur lors de la récupération des tailles!", error);
                        });
                }
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération du produit!", error);
                setError("Erreur lors de la récupération des données du produit!");
            });

        axios.get("http://localhost:8000/api/admin/categories")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des catégories!", error);
                setError("Erreur lors de la récupération des catégories!");
            });

        axios.get("http://localhost:8000/api/admin/colors")
            .then((response) => {
                setColors(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des couleurs!", error);
                setError("Erreur lors de la récupération des couleurs!");
            });

    }, [id]);

    

    const handleCategoryChange = (value) => {
        setCategory(value);

        if (value === 2 || value === 3) {
            axios.get(`http://localhost:8000/api/admin/sizes/category/${value}`)
                .then((response) => {
                    setSizes(response.data);
                    setSize("");
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des tailles!", error);
                });
        } else {
            setSizes([]);
            setSize("");
        }
    };

    const shouldDisplayColor = (category) => {
        return category === 1 || category === 3;
    };

    const shouldDisplaySize = (category) => {
        return category === 2 || category === 3;
    };

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== "") {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handlePhotoChange = (e) => {
        const newPhotoFiles = Array.from(e.target.files);
        setPhotoFiles(newPhotoFiles);

        if (photoPaths.length === 0 && newPhotoFiles.length > 0) {
            setMainImageIndex(0);
        }
    };

    const handleRemovePhoto = (index) => {
        setDeletedPhotos([...deletedPhotos, photoPaths[index]]);
        setPhotoPaths(photoPaths.filter((_, i) => i !== index));
        if (mainImageIndex === index) setMainImageIndex(0);
    };
    

    const saveCurrentModelData = () => {

        const updatedModels = [...models];
    
        updatedModels[currentModelIndex] = {
            ...updatedModels[currentModelIndex],
            color_id: color,
            size_id: size,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            images: photoPaths.map((path, index) => ({
                path,
                is_main: index === mainImageIndex
            }))
        };
    
        setModels(updatedModels);
    };
    
    const handlePreviousModel = () => {
    
    
        if (currentModelIndex > 0) {
            setCurrentModelIndex(currentModelIndex - 1);
            updateModelData(currentModelIndex - 1);
        }
    };
    
    const handleNextModel = () => {
      
    
        if (currentModelIndex < models.length - 1) {
            setCurrentModelIndex(currentModelIndex + 1);
            updateModelData(currentModelIndex + 1); 
        }
    };
    
    const updateModelData = (index) => {
        const model = models[index];
        if (model) {
            setPrice(model.price || "");
            setPhotoPaths(model.images.map((img) => img.path) || []);
            setMainImageIndex(model.images.findIndex((img) => img.is_main) || 0);
            setColor(model.color_id || "");
            setSize(model.size_id || "");
            setStock(model.stock || 0);
        }
    };
    

    const handleSubmit = async (event) => {
    event.preventDefault();
    
 

    if (price <= 0 || stock < 0 || weight < 0) {
        setError("Le prix doit être supérieur à zéro, le stock et le poids ne peuvent pas être négatifs !");
        return;
    }

    try {
        const uploadedPhotos = [...photoPaths];
        let maxIndex = uploadedPhotos.reduce((max, path) => {
            const parts = path.split('_');
            const index = parseInt(parts[parts.length - 1].split('.')[0], 10);
            return Math.max(max, index);
        }, 0);

        for (let i = 0; i < photoFiles.length; i++) {
            const formData = new FormData();
            formData.append("file", photoFiles[i]);
            const response = await axios.post("http://localhost:8000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const newFileName = `${id}_${++maxIndex}.${response.data.filePath.split('.').pop()}`;
            uploadedPhotos.push(`/uploads/${newFileName}`);
            await axios.post("http://localhost:8000/rename-upload", { oldPath: response.data.filePath, newPath: newFileName });
        }

        const updatedModels = models.map((model, index) => ({
            price: parseFloat(model.price),
            color: model.color_id,
            size: model.size_id,
            stock: model.stock,
            photoPaths: model.images.map((img) => img.path),
            mainImageIndex: model.images.findIndex((img) => img.is_main) || 0
        }));

        const updatedProduct = {
            name: name,
            description: description,
            category: category,
            models: updatedModels,
            weight: parseFloat(weight),
            photoPaths: [...new Set(uploadedPhotos)],
            mainImageIndex: photoPaths.length === 0 ? 0 : mainImageIndex,
            brand: category === 1 ? brand : null,
            tags: tags,
            deletedPhotos: deletedPhotos
        };

        await axios.put(`http://localhost:8000/api/admin/products/${id}`, updatedProduct);

        setMessage("Produit mis à jour avec succès!");
        setError("");
        if (currentEditIndex < selectedProductIds.length - 1) {
            setTimeout(() => {
                navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex + 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex + 1}`);
            }, 2000);
        } else {
            setTimeout(() => {
                navigate("/admin/products");
            }, 2000);
        }
    } catch (error) {
        setError("Erreur lors de la mise à jour du produit!");
        setMessage("");
        console.error("Erreur lors de la mise à jour du produit!", error);
    }
};


    if (!product) return <div>Chargement...</div>;

    return (
    <div className="w-full">
        <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
            <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                <p className="text-3xl font-bold leading-7 text-center text-black">
                    Mettre à jour le produit
                </p>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="md:flex items-center mt-12">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="name"
                            >
                                Nom
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Entrez le nom du produit"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                            />
                        </div>
                    </div>
                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="description"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                placeholder="Entrez la description du produit"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                rows="5"
                            />
                        </div>
                    </div>
                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="category"
                            >
                                Catégorie
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                required
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                            >
                                <option value="" className="text-gray-500">
                                    Sélectionnez une catégorie
                                </option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {category === "1" && (
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label className="font-semibold leading-none text-black" htmlFor="brand">
                                    Marque
                                </label>
                                <input
                                    type="text"
                                    id="brand"
                                    placeholder="Entrez le nom de la marque"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                    )}
                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label className="font-semibold leading-none text-black" htmlFor="tags">
                                Tags
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="tags"
                                    placeholder="Entrez un tag"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200 flex-grow"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="bg-blue-700 text-white px-4 py-2 rounded ml-2"
                                >
                                    Ajouter
                                </button>
                            </div>
                            <div className="flex flex-wrap mt-2">
                                {tags.map((tag, index) => (
                                    <div key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full mr-2 mt-2">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(index)}
                                            className="ml-2 text-red-600"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="weight"
                            >
                                Poids
                            </label>
                            <input
                                type="number"
                                id="weight"
                                placeholder="Entrez le poids du produit en Kg"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                            />
                        </div>
                    </div>
                    
                    {models.length > 1 && (
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="button"
                                onClick={() => {
                                    saveCurrentModelData();
                                    handlePreviousModel(); 
                                }}
                                disabled={currentModelIndex === 0}
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Modèle Précédent
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    saveCurrentModelData();
                                    handleNextModel(); 
                                }}
                                disabled={currentModelIndex === models.length - 1}
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Modèle Suivant
                            </button>
                        </div>
                    )}

                    {shouldDisplayColor(category) && (
                        <div className="md:flex items-center mt-8">
                            <div className="w-full md:w-1/2 flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="color"
                                >
                                    Couleur
                                </label>
                                <select
                                    id="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                >
                                    <option value="" className="text-gray-500">
                                        Sélectionnez une couleur
                                    </option>
                                    {colors.map((clr) => (
                                        <option key={clr.id} value={clr.id}>
                                            {clr.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {shouldDisplaySize(category) && (
                        <div className="md:flex items-center mt-8">
                            <div className="w-full md:w-1/2 flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="size"
                                >
                                    Taille
                                </label>
                                <select
                                    id="size"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                >
                                    <option value="" className="text-gray-500">
                                        Sélectionnez une taille
                                    </option>
                                    {sizes.map((sz) => (
                                        <option key={sz.id} value={sz.id}>
                                            {sz.value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="price"
                            >
                                Prix
                            </label>
                            <input
                                type="number"
                                id="price"
                                placeholder="Entrez le prix du produit"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0.01"
                                step="0.01"
                                required
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                            />
                        </div>
                    </div>

                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="stock"
                            >
                                Stock
                            </label>
                            <input
                                type="number"
                                id="stock"
                                placeholder="Entrez le stock du produit"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                min="0"
                                required
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                            />
                        </div>
                    </div>

                    <div className="md:flex items-center mt-8">
                        <div className="w-full flex flex-col">
                            <label
                                className="font-semibold leading-none text-black"
                                htmlFor="photos"
                            >
                                Photos
                            </label>
                            <input
                                type="file"
                                id="photos"
                                multiple
                                onChange={handlePhotoChange}
                                className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                            />
                            <div className="flex flex-col mt-4">
                                {photoPaths.map((path, index) => (
                                    <div key={index} className="flex items-center mt-2">
                                        <p className="mr-4">{path}</p>
                                        <button
                                            type="button"
                                            className={`mr-4 px-3 py-1 rounded ${mainImageIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                            onClick={() => setMainImageIndex(index)}
                                        >
                                            {mainImageIndex === index ? 'Image principale' : 'Définir comme principale'}
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
                    </div>

                    <div className="flex items-center justify-center w-full mt-8">
                        <button
                            type="submit"
                            className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            onClick={() => {
                                saveCurrentModelData();
                            }}
                        >
                            Mettre à jour le produit
                        </button>
                    </div>
                    {selectedProductIds.length > 1 && (
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex - 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex - 1}`)}
                                disabled={currentEditIndex === 0}
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Précédent
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex + 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex + 1}`)}
                                disabled={currentEditIndex === selectedProductIds.length - 1}
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    </div>
);

    
};

export default ProductAdminEdit;