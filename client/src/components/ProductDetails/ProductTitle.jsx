import React from 'react';

const ProductTitle = ({ name, category }) => {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-2">{name}</h1>
            <h3 className="text-sm text-gray-600 mb-6">Catégorie : {category}</h3>
        </div>
    );
};

export default ProductTitle;