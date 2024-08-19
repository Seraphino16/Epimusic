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
        <div className="carousel-container relative w-full h-screen mt-8">
            <div className="carousel-inner relative w-full h-full overflow-hidden">
                <div
                    className="carousel-images"
                    style={{
                        transform: `translateX(-${activeImageIndex * 100}%)`,
                        transition: 'transform 0.7s ease-in-out'
                    }}
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="carousel-image-wrapper"
                        >
                            <img 
                                src={image.src} 
                                alt={image.title}
                                className="carousel-image"
                            />
                            <div className="absolute inset-0 flex items-center text-center justify-center">
                                <div className="text-center px-4 md:px-8 lg:px-16">
                                    <a className="carousel-title text-4xl underline" href={image.link}>{image.title}</a>
                                    <p className="carousel-description text-xl">{image.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={prevImage}
                className="carousel-control prev"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            <button
                onClick={nextImage}
                className="carousel-control next"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="icon"
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
