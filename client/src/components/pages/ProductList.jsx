import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import ProductColors from "../ProductDetails/ProductColors";
import ProductSizes from "../ProductDetails/ProductSizes";

const ProductList = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [categoryId]);

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

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/products/category/${categoryId}`);
            const uniqueProducts = Array.from(new Set(response.data.map(product => product.id)))
                .map(id => response.data.find(product => product.id === id));
            setProducts(uniqueProducts);
        } catch (error) {
            setError("Une erreur s'est produite lors de la récupération des produits !");
        }
    };

    const handleColorSelect = (productId, color) => {
        setSelectedColors(prevColors => {
            const updatedColors = { ...prevColors, [productId]: color };
            const product = products.find(p => p.id === productId);
            const availableSizes = product.models
                .filter(model => model.color === color)
                .map(model => model.size);

            const updatedSize = availableSizes.includes(selectedSizes[productId]) 
                ? selectedSizes[productId] 
                : availableSizes[0];

            setSelectedSizes(prevSizes => ({
                ...prevSizes,
                [productId]: updatedSize
            }));

            return updatedColors;
        });
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prevSizes => ({
            ...prevSizes,
            [productId]: size
        }));
    };

    const handleAddToCart = (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('cart_token');
        const model = product.models.find(model => {
            if (!model.color && !model.size) {
                return true;
            }
            return model.color === selectedColors[product.id] && model.size === selectedSizes[product.id];
        });

        if (!model) return;

        const data = {
            model_id: model.model_id,
            quantity: 1,
        };

        if (user) {
            data.user_id = user.id;
        } else if (token) {
            data.token = token;
        }

        axios.post(`http://localhost:8000/api/cart/add/${product.id}`, data)
            .then(response => {
                setAlert("Produit ajouté au panier !");
                if (response.data.token) {
                    localStorage.setItem('cart_token', response.data.token);
                }
            })
            .catch(() => {
                setAlert("Erreur lors de l'ajout du produit au panier.");
            });
    };

    return (
        <div className="container mx-auto p-4">
            {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}
            {alert && <p className="text-green-500 font-bold text-center mb-4">{alert}</p>}
            <h1 className="text-center text-4xl font-bold my-4">
                Liste des produits de la catégorie sélectionnée
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.length > 0 ? (
                    products.map((product) => {
                        const selectedColor = selectedColors[product.id];
                        const selectedSize = selectedSizes[product.id];
                        const filteredModel = product.models.find(
                            model => model.color === selectedColor && model.size === selectedSize
                        );

                        const uniqueColors = Array.from(new Set(product.models.map(model => model.color)));
                        const availableSizes = filteredModel ? 
                            Array.from(new Set(product.models.filter(model => model.color === selectedColor).map(model => model.size))) 
                            : [];

                        const promotion = product.promotions.length > 0 ? product.promotions[0] : null;

                        return (
                            <div key={product.id} className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col h-full transition-transform duration-300 ease-in-out hover:scale-105">
                                <Link
                                    to={`/product/${product.id}`}
                                    className="flex flex-col h-full"
                                >
                                    <div className="flex-1 flex justify-center items-center mb-4">
                                        {filteredModel?.images && filteredModel.images.length > 0 ? (
                                            <img
                                                src={`http://localhost:8000${filteredModel.images.find(img => img.is_main)?.path}`}
                                                alt={`Produit ${product.name}`}
                                                className="object-contain max-w-full max-h-48"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-48 bg-gray-200 text-gray-600">
                                                <p>Aucune image disponible</p>
                                            </div>
                                        )}
                                    </div>
                                    </Link>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <h2 className="text-lg font-bold mb-2 line-clamp-1">
                                            {product.name}
                                        </h2>
                                        <p className="line-clamp-3 mb-2">{product.description}</p>
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
                                        {filteredModel?.stock !== undefined && (
                                            <div className="text-sm mb-2">
                                                {filteredModel.stock > 0 && filteredModel.stock <= 5 ? (
                                                    <>
                                                        <p>Stock : {filteredModel.stock}</p>
                                                        <p className="text-orange-500 font-bold">Réapprovisionnement</p>
                                                    </>
                                                ) : filteredModel.stock > 5 ? (
                                                    <>
                                                        <p>Stock : {filteredModel.stock}</p>
                                                        <p className="text-green-500 font-bold">En stock</p>
                                                    </>
                                                ) : (
                                                    <p className="text-red-500 font-bold">Rupture de stock</p>
                                                )}
                                            </div>
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
                                            <p className="text-xl font-bold">
                                                ${filteredModel?.price?.toFixed(2) || 'Non disponible'}
                                            </p>
                                        )}
                                    </div>
                               
                                <button
                                    className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 w-full flex items-center justify-center"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                    Ajouter au panier
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center">Aucun produit trouvé</p>
                )}
            </div>
        </div>
    );
};

export default ProductList;
