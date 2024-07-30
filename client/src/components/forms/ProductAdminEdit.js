import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/ProductForm.css";

const ProductAdminEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
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

    const searchParams = new URLSearchParams(location.search);
    const selectedProductIds = searchParams.get('selectedProducts')?.split(',') || [];
    const currentEditIndex = parseInt(searchParams.get('currentEditIndex')) || 0;

    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/admin/products/${id}`)
            .then((response) => {
                const productData = response.data;
                setProduct(productData);
                setName(productData.name);
                setDescription(productData.description);
                setCategory(productData.category_id);
                if (productData.models.length > 0) {
                    const model = productData.models[0];
                    setColor(model.color_id || "");
                    setSize(model.size_id || "");
                    setPrice(model.price);
                    setPhotoPaths(model.images.map((img) => img.path));
                    setMainImageIndex(
                        model.images.findIndex((img) => img.is_main)
                    );
                }
                // Charger les tailles spécifiques à la catégorie
                if (productData.category_id === 2 || productData.category_id === 3) {
                    axios
                        .get(`http://localhost:8000/api/admin/sizes/category/${productData.category_id}`)
                        .then((response) => {
                            setSizes(response.data);
                        })
                        .catch((error) => {
                            console.error("There was an error fetching the sizes!", error);
                        });
                }
            })
            .catch((error) => {
                console.error(
                    "There was an error fetching the product!",
                    error
                );
                setError("There was an error fetching the product data!");
            });

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
                setError("There was an error fetching the categories!");
            });

        axios
            .get("http://localhost:8000/api/admin/colors")
            .then((response) => {
                setColors(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the colors!", error);
                setError("There was an error fetching the colors!");
            });

    }, [id]);

    const handleCategoryChange = (value) => {
        setCategory(value);

        if (value === "2" || value === "3") {
            axios
                .get(`http://localhost:8000/api/admin/sizes/category/${value}`)
                .then((response) => {
                    setSizes(response.data);
                    setSize(""); // Reset size selection
                })
                .catch((error) => {
                    console.error("There was an error fetching the sizes!", error);
                });
        } else {
            setSizes([]); // Reset sizes if category is not "Vinyle" or "Goodies"
            setSize("");
        }
    };

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

        const updatedProduct = {
            name: name,
            description: description,
            category: category,
            color: category !== "2" ? color : null, // Set color only if category is not "Vinyle"
            size: category === "2" || category === "3" ? size : null, // Set size only if category is "Vinyle" or "Goodies"
            price: parseFloat(price),
            photoPaths: photoPaths.filter((path) => path), // Filter out empty paths
            mainImageIndex: mainImageIndex, // Send the main image index
        };

        axios
            .put(
                `http://localhost:8000/api/admin/products/${id}`,
                updatedProduct
            )
            .then((response) => {
                setMessage("Product updated successfully!");
                setError("");
                if (currentEditIndex < selectedProductIds.length - 1) {
                    setTimeout(() => {
                        navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex + 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex + 1}`);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        navigate("/admin/");
                    }, 2000);
                }
            })
            .catch((error) => {
                setError("There was an error updating the product!");
                setMessage("");
                console.error(
                    "There was an error updating the product!",
                    error
                );
            });
    };

    const shouldDisplayColor = (category) => {
        return category === "1" || category === "3"; // Display color for categories "Instrument" and "Goodies"
    };

    const shouldDisplaySize = (category) => {
        return category === "2" || category === "3"; // Display size for categories "Vinyle" and "Goodies"
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div className="w-full">
            <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 mt-8 mb-8">
                <div className="bg-white w-full shadow rounded p-8 sm:p-12">
                    <p className="text-3xl font-bold leading-7 text-center text-black">
                        Update Product
                    </p>
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="md:flex items-center mt-12">
                            <div className="w-full flex flex-col">
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
                        <div className="md:flex items-center mt-8">
                            <div className="w-full flex flex-col">
                                <label
                                    className="font-semibold leading-none text-black"
                                    htmlFor="category"
                                >
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) =>
                                        handleCategoryChange(e.target.value)
                                    }
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
                        {shouldDisplayColor(category) && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full md:w-1/2 flex flex-col">
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
                        {shouldDisplaySize(category) && (
                            <div className="md:flex items-center mt-8">
                                <div className="w-full flex flex-col">
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
                                className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                            >
                                Update Product
                            </button>
                        </div>
                        {selectedProductIds.length > 1 && (
                            <div className="flex items-center justify-center w-full mt-8">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex - 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex - 1}`)}
                                    disabled={currentEditIndex === 0}
                                    className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/edit-product/${selectedProductIds[currentEditIndex + 1]}?selectedProducts=${selectedProductIds.join(',')}&currentEditIndex=${currentEditIndex + 1}`)}
                                    disabled={currentEditIndex === selectedProductIds.length - 1}
                                    className="font-semibold leading-none text-white py-4 px-10 bg-blue-700 rounded hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductAdminEdit;