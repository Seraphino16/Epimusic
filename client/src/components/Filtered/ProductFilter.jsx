import React, { useState } from "react";

const ProductFilter = ({ brands, colors, sizes, maxPrice, maxWeight, onFiltersChange }) => {
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [priceRange, setPriceRange] = useState([0, maxPrice]);
    const [weightRange, setWeightRange] = useState([0, maxWeight]);

    const handleBrandChange = (brand) => {
        const updatedBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];

        setSelectedBrands(updatedBrands);
        onFiltersChange({ brands: updatedBrands, colors: selectedColors, sizes: selectedSizes, priceRange, weightRange });
    };

    const handleColorChange = (color) => {
        const updatedColors = selectedColors.includes(color)
            ? selectedColors.filter(c => c !== color)
            : [...selectedColors, color];

        setSelectedColors(updatedColors);
        onFiltersChange({ brands: selectedBrands, colors: updatedColors, sizes: selectedSizes, priceRange, weightRange });
    };

    const handleSizeChange = (size) => {
        const updatedSizes = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size];

        setSelectedSizes(updatedSizes);
        onFiltersChange({ brands: selectedBrands, colors: selectedColors, sizes: updatedSizes, priceRange, weightRange });
    };

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
        onFiltersChange({ brands: selectedBrands, colors: selectedColors, sizes: selectedSizes, priceRange: range, weightRange });
    };

    const handleWeightRangeChange = (range) => {
        setWeightRange(range);
        onFiltersChange({ brands: selectedBrands, colors: selectedColors, sizes: selectedSizes, priceRange, weightRange: range });
    };

    return (
        <div>
            <h3>Filtrer les produits</h3>

            <div>
                <h4>Marques</h4>
                {brands.map((brand, index) => (
                    <div key={index}>
                        <input
                            type="checkbox"
                            value={brand}
                            onChange={() => handleBrandChange(brand)}
                        />
                        <label>{brand}</label>
                    </div>
                ))}
            </div>

            <div>
                <h4>Couleurs</h4>
                {colors.map((color, index) => (
                    <div key={index}>
                        <input
                            type="checkbox"
                            value={color}
                            onChange={() => handleColorChange(color)}
                        />
                        <label>{color}</label>
                    </div>
                ))}
            </div>

            <div>
                <h4>Tailles</h4>
                {sizes.map((size, index) => (
                    <div key={index}>
                        <input
                            type="checkbox"
                            value={size}
                            onChange={() => handleSizeChange(size)}
                        />
                        <label>{size}</label>
                    </div>
                ))}
            </div>

            <div>
                <h4>Fourchette de prix</h4>
                <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([0, e.target.value])}
                />
                <span>{priceRange[0]} - {priceRange[1]} €</span>
            </div>

            <div>
                <h4>Fourchette de poids</h4>
                <input
                    type="range"
                    min="0"
                    max={maxWeight}
                    value={weightRange[1]}
                    onChange={(e) => handleWeightRangeChange([0, e.target.value])}
                />
                <span>{weightRange[0]} - {weightRange[1]} kg</span>
            </div>
        </div>
    );
};

export default ProductFilter;
