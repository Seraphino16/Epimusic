import React, { useState } from "react";

const ProductFilter = ({
    brands,
    colors,
    sizes,
    maxPrice,
    maxWeight,
    onFiltersChange,
}) => {
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
            ? selectedBrands.filter((b) => b !== brand)
            : [...selectedBrands, brand];

        setSelectedBrands(updatedBrands);
        onFiltersChange({
            brands: updatedBrands,
            colors: selectedColors,
            sizes: selectedSizes,
            priceRange,
            weightRange,
        });
    };

    const handleColorChange = (color) => {
        const updatedColors = selectedColors.includes(color)
            ? selectedColors.filter((c) => c !== color)
            : [...selectedColors, color];

        setSelectedColors(updatedColors);
        onFiltersChange({
            brands: selectedBrands,
            colors: updatedColors,
            sizes: selectedSizes,
            priceRange,
            weightRange,
        });
    };

    const handleSizeChange = (size) => {
        const updatedSizes = selectedSizes.includes(size)
            ? selectedSizes.filter((s) => s !== size)
            : [...selectedSizes, size];

        setSelectedSizes(updatedSizes);
        onFiltersChange({
            brands: selectedBrands,
            colors: selectedColors,
            sizes: updatedSizes,
            priceRange,
            weightRange,
        });
    };

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
        onFiltersChange({
            brands: selectedBrands,
            colors: selectedColors,
            sizes: selectedSizes,
            priceRange: range,
            weightRange,
        });
    };

    const handleWeightRangeChange = (range) => {
        setWeightRange(range);
        onFiltersChange({
            brands: selectedBrands,
            colors: selectedColors,
            sizes: selectedSizes,
            priceRange,
            weightRange: range,
        });
    };

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800 border bg-gray-100 shadow rounded-lg px-2 py-4">
                Filtrer les produits
            </h3>

            <div className="mb-2 border bg-gray-100 shadow rounded-lg px-2 py-4">
                <h4
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                >
                    Marques
                    <span>
                        {isBrandsOpen ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </span>
                </h4>
                {isBrandsOpen && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {brands.map((brand, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={brand}
                                    onChange={() => handleBrandChange(brand)}
                                    className="mr-2 text-red-600 focus:ring-red-500"
                                />
                                <p className="text-gray-600">{brand}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {colors.length > 0 && (
                <div className="mb-2 border bg-gray-100 shadow rounded-lg px-2 py-4">
                    <>
                        <h4
                            className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                            onClick={() => setIsColorsOpen(!isColorsOpen)}
                        >
                            Couleurs
                            <span>
                                {isColorsOpen ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </span>
                        </h4>
                        {isColorsOpen && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            value={color}
                                            onChange={() =>
                                                handleColorChange(color)
                                            }
                                            className="mr-2 text-red-600 focus:ring-red-500"
                                        />
                                        <p className="text-gray-600">{color}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                </div>
            )}

            {sizes.length > 0 && (
                <div className="mb-2 border bg-gray-100 shadow rounded-lg px-2 py-4">
                    <h4
                        className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                        onClick={() => setIsSizesOpen(!isSizesOpen)}
                    >
                        Tailles
                        <span>
                            {isSizesOpen ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                    </h4>
                    {isSizesOpen && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {sizes.map((size, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={size}
                                        onChange={() => handleSizeChange(size)}
                                        className="mr-2 text-red-600 focus:ring-red-500"
                                    />
                                    <p className="text-gray-600">{size}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mb-2 border bg-gray-100 shadow rounded-lg px-2 py-4">
                <h4
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                >
                    Fourchette de prix
                    <span>
                        {isPriceOpen ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </span>
                </h4>
                {isPriceOpen && (
                    <div className="flex items-center flex-column mt-2">
                        <div>
                            <input
                                type="range"
                                min="0"
                                max={maxPrice}
                                value={priceRange[1]}
                                onChange={(e) =>
                                    handlePriceRangeChange([0, e.target.value])
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <span className="ml-4 text-gray-600">
                                {priceRange[0]} - {priceRange[1]} €
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-2 border bg-gray-100 shadow rounded-lg px-2 py-4">
                <h4
                    className="text-lg font-medium text-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsWeightOpen(!isWeightOpen)}
                >
                    Fourchette de poids
                    <span>
                        {isWeightOpen ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </span>
                </h4>
                {isWeightOpen && (
                    <div className="flex items-center mt-2">
                        <input
                            type="range"
                            min="0"
                            max={maxWeight}
                            value={weightRange[1]}
                            onChange={(e) =>
                                handleWeightRangeChange([0, e.target.value])
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-4 text-gray-600">
                            {weightRange[0]} - {weightRange[1]} kg
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductFilter;
