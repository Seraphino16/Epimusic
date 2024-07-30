import React from 'react';

const ProductImage = ({ images }) => {

    const mainImages = images.main || [];
    const secondaryImages = images.secondary || [];

    return (
        <div className="relative">
            {mainImages.length > 0 && (
                <div className="mb-4">
                    <img 
                        src={mainImages[0]} 
                        alt="Main" 
                        className="w-full h-auto object-cover" 
                        style={{ maxHeight: '500px' }}
                    />
                </div>
            )}
          
            {secondaryImages.length > 0 && (
                <div className="flex gap-4 overflow-x-auto mt-4">
                    {secondaryImages.map((image, index) => (
                        <img 
                            key={index} 
                            src={image} 
                            alt={`Secondary ${index}`} 
                            className="w-24 h-24 object-cover"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImage;
