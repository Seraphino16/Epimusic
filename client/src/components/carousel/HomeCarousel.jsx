import React, { useState, useEffect } from "react";
import "../../styles/HomeCarousel.css";

const HomeCarousel = ({ images }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const nextImage = () => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setActiveImageIndex(
            (prevIndex) => (prevIndex - 1 + images.length) % images.length
        );
    };

    useEffect(() => {
        const interval = setInterval(nextImage, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative carousel-container w-full h-screen flex items-center justify-center mt-8">
            <button
                onClick={prevImage}
                className="absolute z-30 left-0 top-0 bottom-0 flex items-center"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    width: "5%",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 mx-auto"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            {images.map((image, index) => (
                <div
                    key={index}
                    style={{
                        display: index === activeImageIndex ? 'block' : 'none',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transition: 'opacity 0.7s ease-in-out',
                        opacity: index === activeImageIndex ? 1 : 0,
                    }}
                    className="carousel-image-wrapper"
                >
                    <img 
                        src={image.src} 
                        alt={image.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                        className="carousel-image"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center px-20">
                            <h2 className="text-4xl font-bold text-white">{image.title}</h2>
                            <p className="max-w-xl mt-3 text-gray-300">
                                {image.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            <button
                onClick={nextImage}
                className="absolute z-30 right-0 top-0 bottom-0 flex items-center"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    width: "5%",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 mx-auto"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    );
};

export default HomeCarousel;
