import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../Alerts/Alert';

const ProductPromotion = ({ productId, onClose }) => {
    const [promoPrice, setPromoPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
       
        if (!promoPrice || !startDate || !endDate) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        axios.post('http://localhost:8000/promotion', { //localhost
            product_id: productId,
            promo_price: promoPrice,
            start_date: startDate,
            end_date: endDate
        })
        .then((response) => {
            setSuccess('Promotion appliquée avec succès !');
            setError('');

            setTimeout(() => {
                onClose();
                window.location.reload(); 
            }, 2000);
        })
        .catch((error) => {
            setError('Erreur lors de l\'application de la promotion.');
            setSuccess('');
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Ajouter une Promotion</h2>
                {success && <Alert message={success} type="success" />}
                {error && <Alert message={error} type="error" />}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Prix promotionnel:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={promoPrice}
                            onChange={(e) => setPromoPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Prix promotionnel"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Date de début:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Date de fin:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Appliquer la Promotion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductPromotion;
