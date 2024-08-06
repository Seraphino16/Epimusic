import React, { useState, useRef } from 'react';

const ProductImage = ({ images }) => {
    const { main = [], secondary = [] } = images;
    const allImages = [...main, ...secondary];
    const [selectedImage, setSelectedImage] = useState(main.length > 0 ? main[0] : (secondary.length > 0 ? secondary[0] : ''));
    const zoomRef = useRef(null);
    const imgRef = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ top: 0, left: 0 });

    const handleMouseMove = (e) => {
        if (isZoomed) {
            const { top, left, width, height } = imgRef.current.getBoundingClientRect();
            const x = e.pageX - left - window.scrollX;
            const y = e.pageY - top - window.scrollY;
            const xPercent = x / width * 100;
            const yPercent = y / height * 100;
            zoomRef.current.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
            setZoomPosition({ top: e.pageY, left: e.pageX });
        }
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    return (
        <div className="relative image-container">
            {selectedImage && (
                <div
                    className="mb-4 flex justify-center overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={imgRef}
                >
                    <img
                        src={`http://localhost:8000${selectedImage}`}
                        alt="Main"
                        className="w-auto h-auto object-contain"
                        style={{ maxHeight: '500px', maxWidth: '100%' }}
                    />
                    {isZoomed && (
                        <div
                            className="zoomed-image"
                            ref={zoomRef}
                            style={{
                                display: 'block',
                                width: '200px',
                                height: '200px',
                                backgroundImage: `url(http://localhost:8000${selectedImage})`,
                                backgroundSize: `${imgRef.current ? imgRef.current.width * 2 : 0}px ${imgRef.current ? imgRef.current.height * 2 : 0}px`,
                                top: `${zoomPosition.top}px`,
                                left: `${zoomPosition.left}px`,
                            }}
                        />
                    )}
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