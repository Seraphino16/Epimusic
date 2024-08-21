import React from "react";
import { FaMapMarkerAlt, FaTrash, FaEdit, FaStar } from "react-icons/fa";

const AddressCard = ({ address, onDelete, onEdit, onSetPrimary }) => {
    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center">
            <div className="mb-4">
                <FaMapMarkerAlt size={40} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-bold mb-4">Adresse</h2>
            <p className="text-center"><strong>Nom :</strong> {address.name}</p>
            <p className="text-center"><strong>Téléphone :</strong> {address.telephone}</p>
            <p className="text-center"><strong>Adresse :</strong> {address.address}</p>
            {address.complement && (
                <p className="text-center"><strong>Complément :</strong> {address.complement}</p>
            )}
            <p className="text-center"><strong>Code Postal :</strong> {address.postalCode}</p>
            <p className="text-center"><strong>Ville :</strong> {address.city}</p>
            <p className="text-center"><strong>Pays :</strong> {address.country}</p>
            <div className="flex mt-4 space-x-2">
                <button
                    onClick={() => onEdit(address.id)}
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-500 flex items-center justify-center"
                >
                    <FaEdit size={20} />
                </button>
                <button
                    onClick={() => onDelete(address.id)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-500 flex items-center justify-center"
                >
                    <FaTrash size={20} />
                </button>
                <button
                    onClick={() => onSetPrimary(address.id)}
                    className={`p-2 rounded-full flex items-center justify-center ${
                        address.isPrimary ? "bg-yellow-500 text-white" : "bg-gray-400 text-white hover:bg-gray-300"
                    }`}
                    disabled={address.isPrimary}
                >
                    <FaStar size={20} />
                </button>
            </div>
        </div>
    );
};

export default AddressCard;