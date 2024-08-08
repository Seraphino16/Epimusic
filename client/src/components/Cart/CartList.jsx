import React from "react";
import CartItem from "./CartItem";

const CartList = ({ items, onQuantityChange, onDeleteItem }) => {

    return (
        <div>
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        <CartItem 
                            item={item} 
                            onQuantityChange={onQuantityChange}
                            onDeleteItem={onDeleteItem}    
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CartList;