import React, { useState, useEffect, useRef } from 'react';

const ProductImage = ({ images }) => {

    const mainImages = images.filter(img => img.is_main);
    const secondaryImages = images.filter(img => !img.is_main);

    const [selectedImage, setSelectedImage] = useState(mainImages.length > 0 ? mainImages[0].path : (secondaryImages.length > 0 ? secondaryImages[0].path : ''));
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ top: 0, left: 0 });

    const zoomRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        if (mainImages.length > 0) {
            setSelectedImage(mainImages[0].path);
        } else if (secondaryImages.length > 0) {
            setSelectedImage(secondaryImages[0].path);
        }
    }, [images]);

    const handleMouseMove = (e) => {
        if (isZoomed && imgRef.current) {
            const { top, left, width, height } = imgRef.current.getBoundingClientRect();
            const x = e.pageX - left - window.scrollX;
            const y = e.pageY - top - window.scrollY;
            const xPercent = x / width * 100;
            const yPercent = y / height * 100;
            zoomRef.current.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
            setZoomPosition({ top: y, left: x });
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
                        src={`http://localhost:8000${selectedImage}`} //localhost
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
                                backgroundImage: `url(http://localhost:8000${selectedImage})`, //localhost
                                backgroundSize: `${imgRef.current ? imgRef.current.width * 2 : 0}px ${imgRef.current ? imgRef.current.height * 2 : 0}px`,
                                top: `${zoomPosition.top}px`,
                                left: `${zoomPosition.left}px`,
                            }}
                        />
                    )}
                </div>
            )}

            {images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto mt-4">
                    {[...mainImages, ...secondaryImages].map((image, index) => (
                        <img
                            key={index}
                            src={`http://localhost:8000${image.path}`} //localhost
                            alt={`Image ${index}`}
                            className={`w-24 h-24 object-cover cursor-pointer ${image.is_main ? 'border-2 border-blue-500' : ''}`}
                            onClick={() => setSelectedImage(image.path)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImage;
