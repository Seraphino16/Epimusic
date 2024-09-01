import React, { useState, useEffect } from "react";
import CartList from "../../Cart/CartList";
import axios from "axios";
import CartSummary from "../../Cart/CartSummary";
import Alert from "../../Alerts/Alert";
import CartButton from "../../Buttons/CartButton";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    const [items, setItems] = useState([]);
    const [userId, setUserId] = useState();
    const [cartToken, setCartToken] = useState();
    const [total, setTotal] = useState(0);
    const [quantity, setQuantity] = useState();
    const [promotionReduction, setPromotionReduction] = useState(0);
    const [orderId, setOrderId] = useState();
    const [alert, setAlert] = useState({ message: '', type: 'error' });
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setUserId(user.id);
        } else {
            const token = localStorage.getItem("cart_token");
            setCartToken(token);
        }
    }, []);

    useEffect(() => {
        if (!userId && !cartToken) {
            return;
        }
        axios.get("http://localhost:8000/api/cart", { //localhost
            params: {
                userId: userId,
                token: cartToken
            }
        })
        .then((response) => {
                return response.data;
              
        })
        .then((data) => {
            setItems(data.items);
        })
        .catch((error) => console.log(error));
    }, [userId, cartToken]);

    useEffect(() => {
        if (!items) return;

        let t = 0;
        let q = 0;
        let promoReduction = 0;

        items.forEach(item => {
            const itemTotal = parseFloat(item.total);
            t += itemTotal;
            q += parseInt(item.quantity);

            if (item.promo_price) {
                promoReduction += item.quantity * (item.price - item.promo_price);
            }
        });

        setTotal(t);
        setQuantity(q);
        setPromotionReduction(promoReduction);

        localStorage.setItem('cart_price', t - promoReduction);
        localStorage.setItem('cart_quantity', q);
        localStorage.setItem('cart_promo_total', promoReduction);

    }, [items]);

    const handleQuantityChange = (id, newQuantity, newTotal) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.id === id ? { ...item, quantity: newQuantity, total: newTotal} : item
            )
        )
    }

    const handleDeleteItem = (message, id) => {
        if (id) {
            setItems(prevItems =>
                prevItems.filter(item => item.id !== id)
            );
            setAlert({ message: "Le produit a été retiré de votre panier", type: "success" });
        } else {
            setAlert({ message: "Une erreur est survenue: l'article n'a pas été retiré de votre panier", type: "error" })
        }
    };

    const getShippingCost = () => {
        if (!userId && !cartToken) {
            console.log('Pas de user ou de token');
            return;
        }
        
        axios.post("http://localhost:8000/api/order/", { //localhost
            userId: userId,
            token: cartToken
        })
        .then(response => {
           
            const orderId = response.data.orderId;
            setOrderId(orderId);
            localStorage.setItem("orderId", orderId);

            return axios.get("http://localhost:8000/api/shipping/cost", { //localhost
                params: {
                    userId: userId,
                    token: cartToken,
                    orderId: orderId
                }
            });
        })
        .then((response) => {
            const data = response.data;
            
            localStorage.setItem("cart_shipping_costs", data.shippingCosts);
            navigate('/delivery');
        })
        .catch(error => {
            if (error.response) {
               
                setAlert({ message: error.response.data.message, type: "error" });
            } else {
                console.log(error.message);
            }
        });      
    }

    return (
        <div className="w-9/12 m-auto">
            <Alert message={alert.message} type={alert.type} />
            <h1 className="text-center text-4xl font-bold my-4">
                Panier
            </h1>
            <div className="flex flex-wrap justify-evenly">
                {items ? (
                    items.length !== 0 && total ? (
                    <>
                        <CartList 
                        items={items}
                        onQuantityChange={handleQuantityChange}
                        onDeleteItem={handleDeleteItem}    
                        />
                        <div className="w-full lg:w-1/2 xl:w-1/3 md:p-4 mb-4">
                            <CartSummary total={total} quantity={quantity} promoReduction={promotionReduction} />
                            <CartButton 
                                text="Valider mon panier"
                                handleClick={getShippingCost}
                            />
                        </div>
                    </>
                    ) : (
                        <div className="text-center mt-40 text-2xl">
                            <p>Votre panier est vide</p>
                            <button
                                className="bg-rose-600 text-2xl rounded-xl mt-8 text-black"
                                onClick={() => window.location.href = "/products"}
                            >
                                Retourner vers les produits
                            </button>
                        </div>
                    )
                ) : null}
            </div>
        </div>
    );
}

export default CartPage;