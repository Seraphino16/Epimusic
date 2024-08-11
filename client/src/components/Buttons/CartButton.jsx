import React from "react";

const CartButton = ({ text, handleClick }) => {
  return (
    <button
      className="bg-rose-600 w-full text-2xl rounded-xl mt-8 text-black"
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default CartButton;
