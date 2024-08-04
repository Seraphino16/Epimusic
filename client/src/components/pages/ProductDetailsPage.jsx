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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/products/${id}`);
                const data = await response.json();
              

                if (response.ok) {
                    setProduct(data);
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
                        <button
                            className="add-to-cart-button-details"
                            onClick={handleAddToCart}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailsPage;