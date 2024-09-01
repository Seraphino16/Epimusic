import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import ButtonDelete from "./ButtonDelete";
import { useCart } from '../../context/CartContext';

const CartItem = ({ item, onQuantityChange, onDeleteItem }) => {
    // const priceDifference = item.total - item.total_promotion;
    const [selectedOption, setSelectedOption] = useState({
        value: item.quantity,
        label: item.quantity,
    });
    const [total, setTotal] = useState(item.total);
    const [totalPromotion, setTotalPromotion] = useState(item.total_promotion);
    const { updateItemCount } = useCart();
    const [isGift, setIsGift] = useState(item.isGift);

    const options = Array.from({ length: 10 }, (v, k) => ({
        value: k + 1,
        label: (k + 1).toString(),
    }));

    const handleChangeQuantity = (selectedOption) => {
        setSelectedOption(selectedOption);

        axios
            .patch(
                `http://localhost:8000/api/cart/item/${item.id}`, //localhost
                {
                    quantity: selectedOption.value,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => response.data.item)
            .then((item) => {
                setTotal(item.total);
                setTotalPromotion(item.total_promotion);
                onQuantityChange(
                    item.id,
                    selectedOption.value,
                    item.total,
                    item.total_promotion
                );

                updateItemCount();
            })
            .catch((error) => console.log(error));
    };

    

    const cartPrice = parseFloat(localStorage.getItem("cart_price")) || 0;
    const cartPromoTotal =
        parseFloat(localStorage.getItem("cart_promo_total")) || 0;
    const priceDifference = cartPrice - cartPromoTotal;

    const handleGiftChange = (event) => {
        const isChecked = event.target.checked;
        setIsGift(isChecked);

        axios.patch(`http://localhost:8000/api/cart/item/gift/${item.id}`, { //localhost
            isGift: isChecked
        })
        .then(response => console.log(response.data))
    }

    return (
        <div className="max-w-xl bg-white p-4 m-4 rounded-lg flex">
            <div className="w-32 h-32">
                <img
                    src={`http://localhost:8000${item.image_path}`} //localhost
                    alt={`${item.product}`}
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="h-100% w-full p-4 flex flex-col content-between justify-between">
                <Link
                    to={`/product/${item.product_id}`}
                    className="product-link"
                >
                    <h4 className="text-md md:text-lg underline">
                        {item.product}
                    </h4>
                </Link>
                <div className="flex justify-between items-end">
                    <div className="flex items-center h-full">
                        <Select
                            value={selectedOption}
                            defaultValue={item.quantity}
                            onChange={handleChangeQuantity}
                            options={options}
                            isSearchable={false}
                            menuPlacement="auto"
                        />
                        <ButtonDelete
                            id={item.id}
                            onDeleteItem={onDeleteItem}
                        />
                    </div>
                    <div className="text-right">
                        {item.promo_price ? (
                            <>
                                <p className="text-xl line-through text-red-500">
                                    {total} €
                                </p>
                                <p className="text-2xl">{totalPromotion} €</p>
                            </>
                        ) : (
                            <p className="text-2xl">{total} €</p>
                        )}
                    </div>
                </div>
                {item.category !== "Instrument" && priceDifference >= 15 && (
                    <div className="text-right flex items-center mt-3">
                        <input type="checkbox" name="wrapping" onChange={handleGiftChange} checked={isGift} />
                        <p className="text-sm ml-3 font-medium text-gray-900">
                            Expédier ce produit dans un emballage cadeau
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartItem;
