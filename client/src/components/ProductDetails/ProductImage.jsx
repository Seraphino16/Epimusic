import React from 'react';

const ProductImage = ({ images }) => {
   
    const { main = [], secondary = [] } = images;

    return (
        <div className="relative">
         
            {main.length > 0 && (
                <div className="mb-4">
                    <img
                        src={`http://localhost:8000${main[0]}`}
                        alt="Main"
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '500px' }}
                    />
                </div>
            )}

            {secondary.length > 0 && (
                <div className="flex gap-4 overflow-x-auto mt-4">
                    {secondary.map((image, index) => (
                        <img
                            key={index}
                            src={`http://localhost:8000${image}`}
                            alt={`Secondary ${index}`}
                            className="w-24 h-24 object-cover cursor-pointer"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImage;