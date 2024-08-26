import React, { useState, useEffect } from "react";
import Alert from '../Alerts/Alert';

const ProvidersAdminList = () => {
    const [providers, setProviders] = useState([]);
    const [alert, setAlert] = useState({ type: '', message: '' });

    const fetchProviders = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/providers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                setAlert({ type: 'error', message: error.message || 'Erreur lors de la récupération des prestataires' });
                return;
            }

            const data = await response.json();
            setProviders(data);
            setAlert({ type: 'error', message: '' });
        } catch (error) {
            setAlert({ type: 'error', message: 'Erreur lors de la récupération des prestataires' });
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce prestataire ?')) {
            try {
                const response = await fetch(`http://localhost:8000/api/provider/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    setAlert({ type: 'error', message: error.message || 'Erreur lors de la suppression du prestataire' });
                    return;
                }

                setProviders((prev) => prev.filter((provider) => provider.id !== id));
            } catch (error) {
                setAlert({ type: 'error', message: 'Erreur lors de la suppression du prestataire' });
            }
        }
    };

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold my-4">Liste des Prestataires</h2>
            {alert.message && <Alert message={alert.message} type={alert.type} />}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">ID</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Nom</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">EAN</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Longueur (cm)</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Largeur (cm)</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Hauteur (cm)</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Prix (€)</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Poids Max (kg)</th>
                            <th className="px-4 py-2 border border-gray-200 bg-gray-100">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(provider => (
                            <tr key={provider.id}>
                                <td className="px-4 py-2 border border-gray-200">{provider.id}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.name}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.EAN}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.length}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.width}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.height}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.price}</td>
                                <td className="px-4 py-2 border border-gray-200">{provider.MaxWeight}</td>
                                <td className="px-4 py-2 border border-gray-200">
                                    <button
                                        onClick={() => handleDelete(provider.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProvidersAdminList;
