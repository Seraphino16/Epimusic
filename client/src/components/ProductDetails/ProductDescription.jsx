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
        <div>
            <p>{description}</p>
            <p>Stock: {stock > 0 ? `${stock}` : 'Bientôt disponible'}</p>
            <p>Couleur: {color}</p>
            <p>{getSizeLabel()} : {size}</p>
        </div>
    );
};

export default ProductDescription;
