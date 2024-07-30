import React from 'react';

const ProductImage = ({ image }) => {
    return (
        <div>
            <img src={image} alt="Product" style={{ width: '100%', height: 'auto' }} />
        </div>
    )
}

export default ProductImage;