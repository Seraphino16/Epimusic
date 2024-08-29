import React, { useState } from "react";
import axios from "axios";

const ReplenishForm = ({ product, onClose }) => {
    const [stocks, setStocks] = useState(
        product.models.map((model) => ({
            color: model.color,
            size: model.size,
            stock: model.stock,
        }))
    );

    const handleStockChange = (index, newStock) => {
        const updatedStocks = [...stocks];
        updatedStocks[index].stock = newStock;
        setStocks(updatedStocks);
    };

    const handleSubmit = () => {
        const updatedProduct = {
            id: product.id,
            models: stocks.map((stock, index) => ({
                color: product.models[index].color_id,
                size: product.models[index].size_id,
                stock: parseInt(stock.stock, 10),
            })),
        };

        axios.post("http://localhost:8000/api/admin/products/replenish", { products: [updatedProduct] })
            .then((response) => {
                alert("Stocks mis à jour avec succès !");
                onClose();
            })
            .catch((error) => {
                console.error("Erreur lors du réapprovisionnement", error);
                alert("Erreur lors du réapprovisionnement");
            });
    };

    return (
        <div className="p-4 bg-gray-100 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Réapprovisionner {product.name}</h2>
            {stocks.map((stock, index) => (
                <div key={index} className="mb-4">
                    <p>Couleur: {stock.color}</p>
                    <p>Taille: {stock.size}</p>
                    <label className="block text-sm font-medium text-gray-700">Stock:</label>
                    <input
                        type="number"
                        value={stock.stock}
                        onChange={(e) => handleStockChange(index, e.target.value)}
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    />
                </div>
            ))}
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSubmit}
            >
                Mettre à jour les stocks
            </button>
            <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-4"
                onClick={onClose}
            >
                Annuler
            </button>
        </div>
    );
};

export default ReplenishForm;
