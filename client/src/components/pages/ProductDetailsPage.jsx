import React, { useState, useEffect } from 'react';
import ProductTitle from '../ProductDetails/ProductTitle';
import ProductDescription from '../ProductDetails/ProductDescription';
import ProductImage from '../ProductDetails/ProductImage';
import Alert from '../Alerts/Alert';
import { useParams } from 'react-router-dom';

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
                setProduct(data[0]);
            
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

    return (
        <div className="p-6">
        <Alert message={alert.message} type={alert.type} />
        {product && (
            <div className="max-w-6xl mx-auto">
                <div>
                    <ProductTitle name={product.name} category={product.category} />
                </div>
                <div className="flex gap-6">
                    <div className="flex-shrink-0">
                        <ProductImage image={product.image_url} />
                    </div>
                    <div className="flex-1">
                        <ProductDescription 
                            category={product.category}
                            description={product.description}
                            stock={product.stock}
                            color={product.color}
                            size={`${product.size_value} ${product.size_unit}`}
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}

export default ProductDetailsPage;