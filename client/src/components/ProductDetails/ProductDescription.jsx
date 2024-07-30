import React from 'react';

const ProductDescription = ({ category, description, stock, color, size }) => {

    const getSizeLabel = () => {
        switch (category) {
            case 'Instruments':
                return 'Poids';
            case 'vinyls':
                return 'Tours';
            case 'Goodies':
                return 'Taille';
            default:
                return 'Taille';
        }
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-h-100 overflow-y-auto">
        <div className="text-lg font-semibold mb-2">Description</div>
            <p className="text-gray-700 mb-4">{description}</p>
        <div className="flex items-center mb-2">
            <span className="font-semibold mr-2">Stock:</span>
            <span className={stock > 0 ? "text-green-600" : "text-red-600"}>
                {stock > 0 ? `${stock} en stock` : 'Bientôt disponible'}
            </span>
        </div>
        <div className="flex items-center mb-2">
            <span className="font-semibold mr-2">Couleur:</span>
            <span className="text-gray-700">{color}</span>
        </div>
        <div className="flex items-center mb-2">
            <span className="font-semibold mr-2">{getSizeLabel()}:</span>
            <span className="text-gray-700">{size}</span>
        </div>
    </div>
    );
};

export default ProductDescription;
