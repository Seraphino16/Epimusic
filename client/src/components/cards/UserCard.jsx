import React from "react";
import { FaUserCircle } from "react-icons/fa";

const UserCard = ({ user }) => {
    const getRoleLabel = () => {
        if (user?.roles.includes('ROLE_ADMIN')) {
            return 'Administrateur';
        } else {
            return 'Utilisateur';
        }
    };

    return (
        <div className="flex flex-col items-center p-6">
            {user && (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center">
                    <div className="mb-4">
                        <FaUserCircle size={100} className="text-gray-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-4">Informations utilisateur</h2>
                    <p className="text-center"><strong>Prénom :</strong> {user.firstname}</p>
                    <p className="text-center"><strong>Nom :</strong> {user.lastname}</p>
                    <p className="text-center"><strong>Email :</strong> {user.email}</p>
                    <p className="text-center"><strong>Rôle :</strong> {getRoleLabel()}</p>
                </div>
            )}
        </div>
    );
};

export default UserCard;