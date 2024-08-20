import React, { useState } from "react";

const ProductFilter = ({ brands, colors, sizes, maxPrice, maxWeight, onFiltersChange }) => {
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [priceRange, setPriceRange] = useState([0, maxPrice]);
    const [weightRange, setWeightRange] = useState([0, maxWeight]);

    const [isBrandsOpen, setIsBrandsOpen] = useState(true);
    const [isColorsOpen, setIsColorsOpen] = useState(true);
    const [isSizesOpen, setIsSizesOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isWeightOpen, setIsWeightOpen] = useState(true);

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
        <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Filtrer les produits</h3>

            <div className="mb-4">
                <h4 
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                >
                    Marques
                    <span>{isBrandsOpen ? "−" : "+"}</span>
                </h4>
                {isBrandsOpen && (
                    <div className="grid grid-cols-2 gap-2">
                        {brands.map((brand, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={brand}
                                    onChange={() => handleBrandChange(brand)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-gray-600">{brand}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h4 
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsColorsOpen(!isColorsOpen)}
                >
                    Couleurs
                    <span>{isColorsOpen ? "−" : "+"}</span>
                </h4>
                {isColorsOpen && (
                    <div className="grid grid-cols-2 gap-2">
                        {colors.map((color, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={color}
                                    onChange={() => handleColorChange(color)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-gray-600">{color}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h4 
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsSizesOpen(!isSizesOpen)}
                >
                    Tailles
                    <span>{isSizesOpen ? "−" : "+"}</span>
                </h4>
                {isSizesOpen && (
                    <div className="grid grid-cols-2 gap-2">
                        {sizes.map((size, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={size}
                                    onChange={() => handleSizeChange(size)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-gray-600">{size}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h4 
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                >
                    Fourchette de prix
                    <span>{isPriceOpen ? "−" : "+"}</span>
                </h4>
                {isPriceOpen && (
                    <div className="flex items-center">
                        <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => handlePriceRangeChange([0, e.target.value])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-4 text-gray-600">{priceRange[0]} - {priceRange[1]} €</span>
                    </div>
                )}
            </div>

            <div>
                <h4 
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsWeightOpen(!isWeightOpen)}
                >
                    Fourchette de poids
                    <span>{isWeightOpen ? "−" : "+"}</span>
                </h4>
                {isWeightOpen && (
                    <div className="flex items-center">
                        <input
                            type="range"
                            min="0"
                            max={maxWeight}
                            value={weightRange[1]}
                            onChange={(e) => handleWeightRangeChange([0, e.target.value])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-4 text-gray-600">{weightRange[0]} - {weightRange[1]} kg</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductFilter;
