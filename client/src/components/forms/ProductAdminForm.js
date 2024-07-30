import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/ProductForm.css";

const ProductAdminForm = () => {
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");
    const [photoPaths, setPhotoPaths] = useState([""]); // State for photo paths
    const [mainImageIndex, setMainImageIndex] = useState(0); // State for main image index
    const [message, setMessage] = useState(""); // State for the message
    const [error, setError] = useState(""); // State for the error
    const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/admin/categories")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error(
                    "There was an error fetching the categories!",
                    error
                );
            });

        axios
            .get("http://localhost:8000/api/admin/colors")
            .then((response) => {
                setColors(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the colors!", error);
            });

        axios
            .get("http://localhost:8000/api/admin/sizes")
            .then((response) => {
                setSizes(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the sizes!", error);
            });
    }, []);

    const handlePhotoPathChange = (index, value) => {
        const paths = [...photoPaths];
        paths[index] = value;
        setPhotoPaths(paths);
    };

    const addPhotoPathField = () => {
        setPhotoPaths([...photoPaths, ""]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const newProduct = {
            name: name,
            description: description,
            category: category,
            color: category !== "2" ? color : null, // Only set color if category is not "Vinyle"
            size: size,
            price: parseFloat(price),
            photoPaths: photoPaths.filter((path) => path), // Filter out empty paths
            mainImageIndex: mainImageIndex, // Send the main image index
        };

        axios
            .post("http://localhost:8000/api/admin/products", newProduct)
            .then((response) => {
                setMessage("Product created successfully!");
                setError("");
                setTimeout(() => {
                    navigate("/admin/");
                }, 2000); // Wait for 2 seconds before redirecting
            })
            .catch((error) => {
                setError("There was an error creating the product!");
                setMessage("");
                setIsSubmitting(false); // Re-enable the button in case of an error
                console.error(
                    "There was an error creating the product!",
                    error
                );
            });
    };

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);

        if (selectedCategory === "2") {
            // Fetch only sizes related to category "Vinyle"
            axios
                .get(`http://localhost:8000/api/admin/sizes/category/${selectedCategory}`)
                .then((response) => {
                    setSizes(response.data);
                    setColor(""); // Reset color as it should not be displayed
                })
                .catch((error) => {
                    console.error("There was an error fetching the sizes!", error);
                });
        } else {
            // Fetch all sizes if not "Vinyle"
            axios
                .get("http://localhost:8000/api/admin/sizes")
                .then((response) => {
                    setSizes(response.data);
                })
                .catch((error) => {
                    console.error("There was an error fetching the sizes!", error);
                });
        }
    };

    return (
        <div className="w-full">
            <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                    <p className="text-3xl font-bold leading-7 text-center text-black">
                        Create a product
                    </p>
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="md:flex items-center mt-12">
                            <div className="w-full md:w-1/2 flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter product name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col md:ml-6 md:mt-0 mt-4">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="category"
                                >
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={handleCategoryChange}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                >
                                    <option value="" className="text-gray-500">
                                        Select a category
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="description"
                                >
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    placeholder="Enter product description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        {category !== "2" && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full flex flex-col">
                                    <label
                                        className="font-semibold leading-none text-black"
                                        htmlFor="color"
                                    >
                                        Color
                                    </label>
                                    <select
                                        id="color"
                                        value={color}
                                        onChange={(e) =>
                                            setColor(e.target.value)
                                        }
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option
                                            value=""
                                            className="text-gray-500"
                                        >
                                            Select a color
                                        </option>
                                        {colors.map((col) => (
                                            <option
                                                key={col.id}
                                                value={col.id}
                                            >
                                                {col.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        {sizes.length > 0 && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full md:w-1/2 flex flex-col">
                                    <label
                                        className="font-semibold leading-none text-black"
                                        htmlFor="size"
                                    >
                                        Size
                                    </label>
                                    <select
                                        id="size"
                                        value={size}
                                        onChange={(e) =>
                                            setSize(e.target.value)
                                        }
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    >
                                        <option
                                            value=""
                                            className="text-gray-500"
                                        >
                                            Select a size
                                        </option>
                                        {sizes.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.value} {s.unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="price"
                                >
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    placeholder="Enter product price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                />
                            </div>
                        </div>
                        {photoPaths.map((path, index) => (
                            <div
                                key={index}
                                className="md:flex items-center mt-8"
                            >
                                <div className="w-full flex flex-col">
                                    <label
                                        className="font-semibold leading-none text-black"
                                        htmlFor={`photoPath${index}`}
                                    >
                                        Photo Path {index + 1}
                                    </label>
                                    <input
                                        type="text"
                                        id={`photoPath${index}`}
                                        placeholder="Enter image path"
                                        value={path}
                                        onChange={(e) =>
                                            handlePhotoPathChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="leading-none text-gray-900 p-3 focus:outline-none focus:border-blue-700 mt-4 bg-gray-100 border rounded border-gray-200"
                                    />
                                    <label className="font-semibold leading-none text-black mt-4">
                                        <input
                                            type="radio"
                                            name="mainImage"
                                            checked={mainImageIndex === index}
                                            onChange={() =>
                                                setMainImageIndex(index)
                                            }
                                            className="mr-2"
                                        />
                                        Set as main image
                                    </label>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="button"
                                onClick={addPhotoPathField}
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Add another photo path
                            </button>
                        </div>
                        <div className="flex items-center justify-center w-full mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting} // Disable the button when submitting
                                className={`font-semibold leading-none text-white py-4 px-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none ${
                                    isSubmitting ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-600'
                                }`}
                            >
                                Create Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductAdminForm;