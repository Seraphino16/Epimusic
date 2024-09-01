import React, { useEffect, useState } from 'react';
import Alert from '../Alerts/Alert';

const ProvidersProductsModal = ({ isOpen, onClose, providerId }) => {
    const [products, setProducts] = useState([]);
    const [alert, setAlert] = useState({ type: '', message: '' });

    useEffect(() => {
        if (isOpen && providerId) {
            fetchProducts(providerId);
        }
    }, [isOpen, providerId]);

    const fetchProducts = async (providerId) => {
        try {
            const response = await fetch(`/api/provider/${providerId}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                setAlert({ type: 'error', message: error.message || 'Erreur lors de la récupération des produits' });
                return;
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            setAlert({ type: 'error', message: 'Erreur lors de la récupération des produits' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white p-6 rounded-lg z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Produits éligibles</h2>
                {alert.message && <Alert message={alert.message} type={alert.type} />}
                
                {products.length > 0 ? (
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border border-gray-200 bg-gray-100">Nom du Produit</th>
                                <th className="px-4 py-2 border border-gray-200 bg-gray-100">Poids (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-4 py-2 border border-gray-200">{product.name}</td>
                                    <td className="px-4 py-2 border border-gray-200">{product.weights}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-red-500 font-bold">Aucun produit trouvé</p>
                )}
    
                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-800 text-white rounded"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
    
};

export default ProvidersProductsModal;