import React from "react";

const CartSummary = ({ total, quantity, promoReduction }) => {

    const totalTTC = (total - promoReduction).toFixed(2);
    const taxes = (totalTTC * (20 / 100)).toFixed(2);
    const totalHT = (totalTTC - taxes).toFixed(2);    

    return (
        <div>
            <h3 className="text-2xl mb-4">Récapitulatif :</h3>
            <div className="w-full bg-white p-4 rounded-lg">
                <p className="text-lg">{quantity} produits</p>
                <hr className="mb-4"/>
                <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                    <p>Total (HT)</p>
                    <p>{totalHT} €</p>
                </div>
                <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                    {promoReduction > 0 && (
                        <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                            <p className="text-red-600">Réduction promo</p>
                            <p className="text-red-600">- {promoReduction.toFixed(2)} €</p>
                    </div>
                    )}
                </div>
                <div className="w-full flex justify-between text-lg md:text-xl text-slate-500">
                    <p>TVA (20%)</p>
                    <p>{taxes} €</p>
                </div>
                <div className="w-full mt-2 flex justify-between text-xl md:text-3xl">
                    <p>Total (TTC)</p>
                    <p>{totalTTC} €</p>
                </div>
            </div>
        </div>
    )
}

export default CartSummary;
