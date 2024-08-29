import React from 'react';

const ProductColors = ({ colors, selectedColor, onColorSelect }) => {


    const colorMap = {
        "Noir": "#000000",
        "Blanc": "#FFFFFF",
        "Rouge": "#FF0000",
        "Marron": "#8B4513",
        "Gris": "#808080",
        "Orange": "#FFA500",
        "Bleu": "#0000FF",
        "Vert": "#008000",
        "Jaune": "#FFFF00",
        "Rose": "#FFC0CB",
        "Violet": "#800080"
    };

    const getColorHex = (colorName) => {
        return colorMap[colorName];
    };

    return (
        <div className="flex gap-2 mb-4 h-8">
            {colors.map((color, index) => (
                color && (
                    <span
                        key={index}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-black' : 'border-transparent'}`}
                        style={{ backgroundColor: getColorHex(color) }}
                        onClick={() => onColorSelect(color)}
                        title={color}
                    />
                )
            ))}
        </div>
    );
};

export default ProductColors;
