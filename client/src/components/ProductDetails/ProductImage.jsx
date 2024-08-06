import React, {useState} from 'react';

const ProductImage = ({ images }) => {
   
    const { main = [], secondary = [] } = images;
    const allImages = [...main, ...secondary];
    const [selectedImage, setSelectedImage] = useState(main.length > 0 ? main[0] : '');

    return (
        <div className="relative">
            {selectedImage && (
                <div className="mb-4">
                    <img
                        src={`http://localhost:8000${selectedImage}`}
                        alt="Main"
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '500px' }}
                    />
                </div>
            )}

            {allImages.length > 0 && (
                <div className="flex gap-4 overflow-x-auto mt-4">
                    {allImages.map((image, index) => (
                        <img
                            key={index}
                            src={`http://localhost:8000${image}`}
                            alt={`Image ${index}`}
                            className="w-24 h-24 object-cover cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImage;