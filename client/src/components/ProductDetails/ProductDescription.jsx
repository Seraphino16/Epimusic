import React from 'react';

const ProductDescription = ({ description, stock, color, size }) => {
    return (
        <div>
            <p>{description}</p>
            <p>Stock: {stock > 0 ? `${stock}` : 'Bientôt disponible'}</p>
            <p>Couleur: {color}</p>
            <p>Poids: {size}</p>
        </div>
    );
};

export default ProductDescription;
