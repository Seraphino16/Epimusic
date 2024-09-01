import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { Link, useNavigate } from "react-router-dom";
import ProductColors from '../ProductDetails/ProductColors';
import ProductSizes from '../ProductDetails/ProductSizes';
import ProductPromotion from '../forms/ProductPromotion';

const ProductAdminList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        products.forEach(product => {
            if (product.models && product.models.length > 0) {
                const firstColor = product.models[0].color;
                const firstSize = product.models[0].size;

                setSelectedColors(prevColors => ({
                    ...prevColors,
                    [product.id]: prevColors[product.id] || firstColor
                }));

                setSelectedSizes(prevSizes => ({
                    ...prevSizes,
                    [product.id]: prevSizes[product.id] || firstSize
                }));
            }
        });
    }, [products]);

    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/admin/products")
            .then((response) => {
                setProducts(response.data);
            
            })
            .catch(error => {
                setError("Erreur lors de la récupération des produits !");
            });
    };

    const deleteProduct = (id) => {
        return axios
            .delete(`http://localhost:8000/api/admin/products/${id}`)
            .then((response) => {
                setProducts(products.filter((product) => product.id !== id));
                setMessage("Produit supprimé avec succès !");
                setError("");
            })
            .catch(error => {
                setError("Erreur lors de la suppression du produit !");
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
            navigate(`/admin/edit-product/${selectedProducts[0]}?selectedProducts=${selectedProducts.join(",")}&currentEditIndex=0`);
        } else {
            alert("Veuillez sélectionner au moins un produit à modifier.");
        }
    };

    const deleteSelectedProducts = () => {
        if (
            window.confirm(
                "Êtes-vous sûr de vouloir supprimer les produits sélectionnés ?"
            )
        ) {
            Promise.all(selectedProducts.map((id) => deleteProduct(id)))
                .then(() => {
                    setSelectedProducts([]);
                    fetchProducts();
                })
                .catch(() => {
                    setError("Erreur lors de la suppression d'un ou plusieurs produits !");
                    setMessage('');
                });
        }
    };

    const handleColorSelect = (productId, color) => {
        setSelectedColors({ ...selectedColors, [productId]: color });

        const product = products.find(p => p.id === productId);
        if (product && product.models) {
            const availableSizes = product.models
                .filter(model => model.color === color)
                .map(model => model.size);

            setSelectedSizes(prevSizes => ({
                ...prevSizes,
                [productId]: availableSizes.includes(prevSizes[productId]) ? prevSizes[productId] : availableSizes[0]
            }));
        }
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes({ ...selectedSizes, [productId]: size });
    };

    const getUniqueColors = (models) => {
        const colors = models.map(model => model.color);
        return [...new Set(colors)];
    };

    const openPromotionModal = (productId) => {
        setCurrentProductId(productId);
        setShowPromotionModal(true);
    };

    const closePromotionModal = () => {
        setShowPromotionModal(false);
        setCurrentProductId(null);
    };


    return (
        <div className="container mx-auto p-4">
            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <h1 className="text-2xl font-bold mb-4">Liste des Produits</h1>
            <div className="mb-4 flex gap-4">
                <Link to="/admin/create-product">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Créer un nouveau produit
                    </button>
                </Link>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={deleteSelectedProducts}
                >
                    Supprimer les sélectionnés
                </button>
                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    onClick={editSelectedProducts}
                >
                    Modifier les sélectionnés
                </button>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => openPromotionModal(selectedProducts[0])}
                >
                    Ajouter une Promotion
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                    const selectedColor = selectedColors[product.id];
                    const selectedSize = selectedSizes[product.id];
                    const filteredModel = product.models.find(
                        (model) => model.color === selectedColor && model.size === selectedSize
                    );

                    const uniqueColors = getUniqueColors(product.models);
                    const availableSizes = filteredModel
                        ? product.models
                              .filter((model) => model.color === selectedColor)
                              .map((model) => model.size)
                        : [];

                    const promotion = product.promotions.length > 0 ? product.promotions[0] : null;

                    return (
                        <div key={product.id} className="bg-white p-4 rounded shadow-lg">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleSelectProduct(product.id)}
                                    className="mr-2"
                                />
                                <img
                                    src={`http://localhost:8000${filteredModel?.images?.find(image => image.is_main)?.path || '/default-image.jpg'}`}
                                    alt={`Image principale du produit ${product.name}`}
                                    className="w-32 h-32 object-cover mb-2 rounded"
                                />
                            </div>
                            <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                            <p className="text-gray-600 mb-2 line-clamp-3">{product.description}</p>
                            <p className="text-sm text-gray-500 mb-2">Catégorie : {product.category}</p>
                            {product.category === 'Instrument' && (
                                <p className="text-sm text-gray-500 mb-2">Marque : {product.brands.join(', ')}</p>
                            )}
                            <p className="text-sm text-gray-500 mb-2">Tags : {product.tags.join(', ')}</p>
                            <ProductColors
                                colors={uniqueColors}
                                selectedColor={selectedColor}
                                onColorSelect={(color) => handleColorSelect(product.id, color)}
                            />
                            <ProductSizes
                                sizes={availableSizes}
                                selectedSize={selectedSize}
                                onSizeSelect={(size) => handleSizeSelect(product.id, size)}
                            />
                            <p className="text-sm text-gray-500 mb-2">Poids : {product.weight} Kg</p>
                            {filteredModel ? (
                                <div className="mb-2">
                                    {filteredModel.stock > 0 && filteredModel.stock <= 5 ? (
                                        <>
                                            <p>Stock : {filteredModel.stock}</p>
                                            <p className="text-yellow-500">Réapprovisionnement</p>
                                        </>
                                    ) : filteredModel.stock > 5 ? (
                                        <>
                                            <p>Stock : {filteredModel.stock}</p>
                                            <p className="text-green-500">En stock</p>
                                        </>
                                    ) : (
                                        <p className="text-red-500">Rupture de stock</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-red-500 mb-2">Stock non disponible</p>
                            )}
                            {promotion ? (
                                <div className="flex flex-col mb-2">
                                    <span className="text-gray-500 line-through text-lg">
                                        ${filteredModel?.price?.toFixed(2) || 'Non disponible'}
                                    </span>
                                    <span className="text-red-600 text-xl font-bold">
                                        ${promotion.promo_price}
                                    </span>
                                    <p className="text-sm text-red-600 font-bold">
                                        Promotion du {promotion.start_date} au {promotion.end_date}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-lg font-semibold mb-2">
                                    Prix : ${filteredModel?.price?.toFixed(2) || 'Non disponible'}
                                </p>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Link to={`/admin/product/${product.category}/${product.id}/add-model`}>
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ajouter un modèle</button>
                                </Link>
                                <button
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                    onClick={() => editProduct(product.id)}
                                >
                                    Modifier
                                </button>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    onClick={() => deleteProduct(product.id)}
                                >
                                    Supprimer
                                </button>
                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    onClick={() => openPromotionModal(product.id)}
                                >
                                    Ajouter une Promotion
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showPromotionModal && <ProductPromotion onClose={closePromotionModal} productId={currentProductId} />}
        </div>
    );
};

export default ProductAdminList;