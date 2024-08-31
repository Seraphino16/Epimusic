import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ButtonDelete = ({ id, onDeleteItem }) => {

    const handleDelete = () => {
        axios.delete(`http://localhost:8000/api/cart/item/delete/${id}`) //localhost
            .then((response) => {
                console.log(response.data.message);
                onDeleteItem(response.data.message, id)
            })
            .catch((error) => {
                console.log(error.message);
                onDeleteItem(error.message)
            })
    }


    return (
        <button 
            onClick={handleDelete}
            className="w-9 h-9 bg-slate-100 rounded-full ml-4 flex justify-center items-center transition-transform duration-500 ease-in-out transform hover:rotate-45"
        >
            <FontAwesomeIcon
                icon={faTrashCan}
                className="text-red-500 w-lg h-lg"
            />
        </button>
    )
}

export default ButtonDelete;