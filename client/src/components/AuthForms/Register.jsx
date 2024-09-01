import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../Alerts/Alert";
import logo from "../../assets/logo.png";

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [alert, setAlert] = useState({ message: "", type: "error" });
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumber &&
            hasSpecialChar
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setMessage(
                "Le mot de passe et sa confirmation doivent être identiques"
            );
            return false;
        }

        if (!validatePassword(password)) {
            setMessage(
                `Le mot de passe doit avoir une longueur minimum de 8 caractères et contenir les caractères suivants : 
        une majuscule, une minuscule, un chiffre et un caractère spécial`
            );
            return false;
        }

        try {
            const response = await fetch("http://localhost:8000/api/register", { //localhost
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({
                    message:
                        "Inscription réussie. Vous allez être redirigé vers la page de connexion",
                    type: "success",
                });
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setAlert({
                    message:
                        data.message ||
                        "Une erreur s'est produite lors de l'inscription. Veuillez réessayer plus tard",
                    type: "error",
                });
            }
        } catch (error) {
            setAlert({
                message:
                    "Une erreur s'est produite lors de l'inscription. Veuillez réessayer plus tard",
                type: "error",
            });
        }
    };

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <div className="max-w-md w-full mx-auto p-8 rounded-lg mb-16">
                <div className="flex items-center justify-center py-16">
                    <img src={logo} alt="Logo" className="w-64 h-64" />
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-wrap -mx-24">
                        <div className="w-full md:w-1/2 px-2 mb-4">
                            <div className="relative">
                                <svg
                                    className="absolute top-4 ml-3"
                                    width="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z" />
                                </svg>
                                <input
                                    placeholder="Prénom"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    className="bg-[#F0E9D7]/90 pl-12 py-2 md:py-4 focus:outline-none w-full rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 px-2 mb-4">
                            <div className="relative">
                                <svg
                                    className="absolute top-4 ml-3"
                                    width="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z" />
                                </svg>
                                <input
                                    placeholder="Nom"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="bg-[#F0E9D7]/90 pl-12 py-2 md:py-4 focus:outline-none w-full rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full px-2 mb-4">
                            <div className="relative">
                                <svg
                                    className="absolute top-5 ml-3"
                                    width="24"
                                    viewBox="0 0 8 6"
                                >
                                    <path d="m0 0h8v6h-8zm.75 .75v4.5h6.5v-4.5zM0 0l4 3 4-3v1l-4 3-4-3z" />{" "}
                                </svg>
                                <input
                                    placeholder="E-mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-[#F0E9D7]/90 pl-12 py-2 md:py-4 focus:outline-none w-full rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 px-2 mb-4">
                            <div className="relative">
                                <svg
                                    className="absolute top-4 ml-3"
                                    width="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
                                </svg>
                                <input
                                    placeholder="Mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="bg-[#F0E9D7]/90 pl-12 py-2 md:py-4 focus:outline-none w-full rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 px-2 mb-4">
                            <div className="relative">
                                <svg
                                    className="absolute ml-3 top-4"
                                    width="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
                                </svg>
                                <input
                                    placeholder="Confirmer le mot de passe"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="bg-[#F0E9D7]/90 pl-12 py-2 md:py-4 focus:outline-none w-full rounded"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {message && <p className="text-red-600">{message}</p>}
                    <button
                        type="submit"
                        className="w-full bg-white text-[#EEB829] py-4 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        S'inscrire
                    </button>
                </form>
                <Alert message={alert.message} type={alert.type} />
                <p className="mt-4 text-white text-center">
                    Vous avez déjà un compte ?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        Connexion
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
