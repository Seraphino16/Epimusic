import React from 'react';

const ProductTitle = ({ name, category }) => {
    return (
        <div>
            <h1>{name}</h1>
            <h3>Catégorie : {category}</h3>
        </div>
    );
};

export default ProductTitle;