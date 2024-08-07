import React, { useState } from "react";
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

    return (
        <div className="relative w-full h-full carousel-container rounded-lg bg-transparent flex items-center justify-center mt-8">
            <button
                onClick={prevImage}
                className="absolute left-0 z-30"
                style={{
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    height: "100%",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            {images.map((src, index) => (
                <img
                    key={index}
                    src={src}
                    style={{
                        maxWidth: "90%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        transition: "opacity 0.7s ease-in-out",
                        position: "absolute",
                        opacity: index === activeImageIndex ? 1 : 0,
                    }}
                    className="carousel-image"
                    alt={`Carousel image ${index + 1}`}
                />
            ))}
            <button
                onClick={nextImage}
                className="absolute right-0 z-30"
                style={{
                    top: "50%",
                    height: "100%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
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
