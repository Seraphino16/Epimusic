import React from 'react';

const ProductSizes = ({ sizes, selectedSize, onSizeSelect }) => {
    return (
        <div className="flex h-8 gap-2 mb-4">
            {sizes.map((size, index) => (
                size && (
                    <span
                        key={index}
                        className={`px-2 py-1 cursor-pointer border-2 ${selectedSize === size ? 'border-black' : 'border-transparent'}`}
                        onClick={() => onSizeSelect(size)}
                        title={size}
                    >
                        {size}
                    </span>
                )
            ))}
        </div>
    );
};

export default ProductSizes;
