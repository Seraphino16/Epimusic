import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ProductList.css";  

const StockManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get('/api/admin/products')
            .then(response => {
                const filteredProducts = response.data.filter(product =>
                    product.models.some(model => model.stock === 0 || model.stock <= 5)
                );
                setProducts(filteredProducts);
            })
            .catch(error => {
                setError("Erreur lors de la récupération des produits !");
            });
    };

    const handleQuantityChange = (productId, modelId, quantity) => {
        setProducts(products.map(product => {
            if (product.id === productId) {
                product.models = product.models.map(model => {
                    if (model.model_id === modelId) {
                        model.quantity = quantity;
                    }
                    return model;
                });
            }
            return product;
        }));
    };

    const replenishProducts = () => {
        const productsToReplenish = products
            .filter(product => selectedProducts.includes(product.id))
            .map(product => ({
                id: product.id,
                models: product.models.map(model => ({
                    model_id: model.model_id,
                    stock: Math.max(0, model.stock + (model.quantity || 0))  // Mise à jour du stock
                }))
            }));

      

        axios.post('/api/admin/products/replenish', { products: productsToReplenish }) //localhost
            .then(response => {
                setMessage("Stock mis à jour avec succès !");
                fetchProducts(); // Recharger les produits pour voir les mises à jour dans l'interface
            })
            .catch(error => {
                setError("Erreur lors de la mise à jour du stock !");
            });
    };

    const handleSelectProduct = (id) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(productId => productId !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const getStockBarClass = (stock) => {
        if (stock === 0) return "out-of-stock-bar"; // Rouge pour rupture de stock
        if (stock > 0 && stock <= 5) return "restocking-bar"; // Jaune pour bientôt épuisé
        return ""; // Pas de classe pour les stocks > 5 (barre invisible)
    };

    const getStockBarWidth = (stock) => {
        if (stock > 5) return "100%"; // Barre pleine pour les stocks > 5 (non visible ici)
        return `${(stock / 5) * 100}%`; // Calcul de la largeur en fonction du stock pour les stocks <= 5
    };

    return (
        <div className="container mx-auto p-4">
            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <h1 className="text-2xl font-bold mb-4">Liste des Produits</h1>
            <div className="mb-4 flex gap-4">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={replenishProducts}
                >
                    Commander
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded shadow-lg">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                                className="mr-2"
                            />
                            <img
                                src={`${product.models[0]?.images?.find(image => image.is_main)?.path || '/default-image.jpg'}`}
                                alt={`Image principale du produit ${product.name}`}
                                className="w-32 h-32 object-cover mb-2 rounded"
                            />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                        <div>
                            {product.models.map(model => (
                                <div key={model.model_id} className="mb-2">
                                    <div>Couleur : {model.color}</div>
                                    <div>Taille : {model.size}</div>
                                    <div>
                                        Stock actuel : <span className="font-semibold">{model.stock}</span>
                                        <div>
                                            Quantité : 
                                            <input
                                                type="number"
                                                value={model.quantity || 0}
                                                onChange={(e) => handleQuantityChange(product.id, model.model_id, parseInt(e.target.value))}
                                                className="ml-2 p-1 border rounded"
                                                min="0"
                                            />
                                            <div className="w-full h-2 bg-gray-300 mt-1">
                                                <div
                                                    className={`h-full ${getStockBarClass(model.stock)}`}
                                                    style={{ width: getStockBarWidth(model.stock) }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockManagementPage;
