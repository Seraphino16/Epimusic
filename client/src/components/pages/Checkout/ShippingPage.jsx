import React, { useEffect, useState } from "react";
import Alert from "../../Alerts/Alert";
import { FaShippingFast } from "react-icons/fa";
import CartButton from "../../Buttons/CartButton";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ShippingPage = () => {
    const [alert, setAlert] = useState({ message: "", type: "error" });
    const [cartPrice, setCartPrice] = useState();
    const [shipppingCosts, setShippingCosts] = useState();
    const [cartQuantity, setCartQuantity] = useState();
    const [total, setTotal] = useState();
    const [orderId, setOrderId] = useState(localStorage.getItem('orderId'));
    const [order, setOrder] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const cartPrice = localStorage.getItem("cart_price");
        setCartPrice(parseFloat(cartPrice));
        const shipppingCosts = localStorage.getItem("cart_shipping_costs");
        setShippingCosts(parseFloat(shipppingCosts));
        const cartQuantity = localStorage.getItem("cart_quantity");
        setCartQuantity(parseInt(cartQuantity));
    }, []);

    useEffect(() => {
        if (!orderId) {
            return;
        }

        axios.get(`http://localhost:8000/api/order/${orderId}`) //localhost
            .then(response => {
                setOrder(response.data);
            })
            .catch(error => {
                console.log(error);
            }) 
    }, [orderId]);

    useEffect(() => {
        if (!order) {
          return;
        }
    
        if (order.status !== "Pending") {
          navigate("/");
        }
      }, [order]);

    useEffect(() => {
        if (!cartPrice || !shipppingCosts) {
            return;
        }
        const total = (cartPrice + shipppingCosts).toFixed(2);
        setTotal(total);
    }, [cartPrice, shipppingCosts]);

    const handlePaymentRedirection = () => {
        navigate('/delivery/home-delivery');
    }

    return (
        <div className="w-9/12 m-auto">
            <Alert message={alert.message} type={alert.type} />
            <h1 className="text-center text-4xl font-bold my-4">Livraison</h1>

            <div className="flex flex-wrap justify-evenly">
                <div className="w-2/5">
                    <h3 className="text-2xl">Méthodes de livraisons</h3>
                        <div className="w-full max-w-xl bg-white hover:bg-gray-100 p-8 mt-4 rounded-lg">
                            <div className="flex items-center text-xl px-4">
                                <FaShippingFast />
                                <p className="ml-4">Livraison à domicile</p>
                            </div>
                        </div>
                </div>

                <div className="w-1/3">
                    <h3 className="text-2xl mb-4">Récapitulatif :</h3>
                    <div className="w-full bg-white p-4 rounded-lg">
                        {order && (
                        <>
                        <p className="text-lg">{order.itemsQuantity} produits</p>
                        <hr className="mb-4" />
                        <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                            <p>Prix du panier :</p>
                            <p>{order.totalPrice} €</p>
                        </div>
                        <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                            <p>Prix du panier avec promotions :</p>
                            <p>{order.totalWithPromo} €</p>
                        </div>
                        <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                            <p>Frais de livraison :</p>
                            <p>{order.shippingCost} €</p>
                        </div>
                        <div className="w-full mt-2 flex justify-between text-xl md:text-3xl">
                            <p>Total</p>
                            <p>{order.totalWithShippingCost} €</p>
                        </div>
                        </>
                        )}
                    </div>
                    <CartButton 
                        text="Valider ma livraison" 
                        handleClick={handlePaymentRedirection}
                    />
                </div>  
           </div> 
        </div>
    );
};

export default ShippingPage;
