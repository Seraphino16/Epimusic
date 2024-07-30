import React, { useState, useEffect } from 'react';
import ProductTitle from '../ProductDetails/ProductTitle';
import ProductDescription from '../ProductDetails/ProductDescription';
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
                console.log(data);
   
            if (response.ok) {
                setProduct(data[0]);
                console.log(product);
            } else {
               
                setAlert({ message: data.message || 'Une erreur s\'est produite lors de la récupération des articles', type: 'error' });
            }
            
            } catch (error) {
                setAlert({ message: 'Internal server error', type: 'error' });
            }
        };

        fetchProduct();
    }, [id]);

    return (
        <div>
              <Alert message={alert.message} type={alert.type} />
            {product && (
                <div>
                    <ProductTitle name={product.name} category={product.category} />
                    <ProductDescription description={product.description} />
                </div>
            )}
        </div>
    );
}

export default ProductDetailsPage;