import React, { useState, useEffect } from 'react';
import ProductTitle from '../ProductDetails/ProductTitle';
import ProductDescription from '../ProductDetails/ProductDescription';
import ProductImage from '../ProductDetails/ProductImage';
import Alert from '../Alerts/Alert';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [alert, setAlert] = useState({ message: '', type: 'error' });
    const [quantity, setQuantity] = useState(1);
    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/products/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setProduct(data);
                    setReviews(data.reviews || []);
                } else {
                    setAlert({ message: data.message || 'Une erreur s\'est produite lors de la récupération des articles', type: 'error' });
                }
            } catch (error) {
                console.log(error);
                setAlert({ message: 'Internal server error', type: 'error' });
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('cart_token');
        const data = {
            model_id: product.models[0].model_id,
            quantity: quantity,
        };

        if (user) {
            data.user_id = user.id;
        } else if (token) {
            data.token = token;
        }

        axios.post(`http://localhost:8000/api/cart/add/${product.id}`, data)
            .then(response => {
                console.log("Produit ajouté au panier : ", response.data);
                setAlert({ message: "Produit ajouté au panier !", type: 'success' });
                if (response.data.token) {
                    localStorage.setItem('cart_token', response.data.token);
                }
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout du produit au panier : ", error);
                setAlert({ message: "Erreur lors de l'ajout du produit au panier.", type: 'error' });
            });
    };

    const handleAddReview = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const data = {
            product_id: product.id,
            comment: review,
            user_id: user ? user.id : null,
        };

        axios.post('http://localhost:8000/api/product/add/review', data)
            .then(response => {
                console.log("Avis ajouté : ", response.data);
                setAlert({ message: "Avis ajouté avec succès !", type: 'success' });
                setReviews([...reviews, response.data.review]);
                setReview('');
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout de l'avis : ", error);
                setAlert({ message: "Erreur lors de l'ajout de l'avis.", type: 'error' });
            });
    };

    return (
        <div className="p-6">
            <Alert message={alert.message} type={alert.type} />
            {product && (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <ProductTitle name={product.name} category={product.category} />
                        <ProductImage images={product.images} />
                    </div>
                    <div className="space-y-4 mt-16 pt-12">
                        <ProductDescription
                            category={product.category}
                            description={product.description}
                            stock={product.models[0].stock_quantity}
                            color={product.models[0]?.color || 'Non spécifié'}
                            size={`${product.models[0]?.size_value || ''} ${product.models[0]?.size_unit || ''}`}
                            price={product.models[0].price}
                        />
                        <div className="flex flex-col space-y-4">
                            <label htmlFor="quantity">Quantité :</label>
                            <select
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="quantity-select"
                            >
                                {[...Array(product.models[0].stock_quantity).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                        {x + 1}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="add-to-cart-button-details"
                                onClick={handleAddToCart}
                            >
                                <FontAwesomeIcon icon={faShoppingCart} />
                            </button>
                        </div>
                        <div className="space-y-4 mt-16 pt-12">
                            <h3 className="text-xl font-bold">Avis</h3>
                            <div>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Écrire un avis"
                                />
                                <button
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                    onClick={handleAddReview}
                                >
                                    Écrire un avis
                                </button>
                            </div>
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 border border-gray-300 rounded">
                                        <p className="font-bold">{review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonyme'}</p>
                                        <p className="text-gray-500 text-sm">{new Date(review.created_at).toLocaleDateString()}</p>
                                        <p>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailsPage;