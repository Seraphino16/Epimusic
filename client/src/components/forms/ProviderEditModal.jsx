import React, { useState, useEffect } from 'react';
import Alert from '../Alerts/Alert';

const ProviderEditModal = ({ isOpen, onClose, providerId}) => {
    const [formData, setFormData] = useState({
        name: '',
        EAN: '',
        length: '',
        width: '',
        height: '',
        price: '',
        MaxWeight: ''
    });
    const [alert, setAlert] = useState({ type: '', message: '' });

    useEffect(() => {
        if (isOpen && providerId) {
            fetchProviderData(providerId);
        }
    }, [isOpen, providerId]);

    const fetchProviderData = async (id) => {
        try {
            const response = await fetch(`/api/provider/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                setAlert({ type: 'error', message: error.message || 'Erreur lors de la récupération des données du prestataire' });
                return;
            }

            const data = await response.json();
            setFormData({
                name: data.name,
                EAN: data.EAN,
                length: data.length,
                width: data.width,
                height: data.height,
                price: data.price,
                MaxWeight: data.MaxWeight
            });
        } catch (error) {
            setAlert({ type: 'error', message: 'Erreur lors de la récupération des données du prestataire' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/provider/${providerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                setAlert({ type: 'error', message: error.message || 'Erreur lors de la mise à jour du prestataire' });
                return;
            }

            const updatedProvider = await response.json();
            setAlert({ type: 'success', message: 'Prestataire mis à jour avec succès' });

            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 2000);

        } catch (error) {
            setAlert({ type: 'error', message: 'Erreur lors de la mise à jour du prestataire' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white p-6 rounded-lg z-10 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Modifier le Prestataire</h2>
                {alert.message && <Alert message={alert.message} type={alert.type} />}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="name">Nom</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="EAN">EAN</label>
                        <input
                            id="EAN"
                            name="EAN"
                            type="number"
                            value={formData.EAN}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="length">Longueur (cm)</label>
                        <input
                            id="length"
                            name="length"
                            type="number"
                            value={formData.length}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="width">Largeur (cm)</label>
                        <input
                            id="width"
                            name="width"
                            type="number"
                            value={formData.width}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="height">Hauteur (cm)</label>
                        <input
                            id="height"
                            name="height"
                            type="number"
                            value={formData.height}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="price">Prix (€)</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="MaxWeight">Poids Max (kg)</label>
                        <input
                            id="MaxWeight"
                            name="MaxWeight"
                            type="number"
                            value={formData.MaxWeight}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 text-white rounded">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Mettre à jour</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderEditModal;
