import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../Alerts/Alert';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState({ message: '', type: 'error' });
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Le mot de passe et sa confirmation doivent être identiques');
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
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
      });

      const data = await response.json();
   
      if (response.ok) {
        setAlert({ message: 'Inscription réussie. Vous allez être redirigé vers la page de connexion', type: 'success' });
        setTimeout(() => {
            navigate('/login');
          }, 3000);
      } else {
        setAlert({ message: data.message || 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer plus tard', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer plus tard', type: 'error' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Inscription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom :</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom :</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe :</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        {message && <p className="text-red-600">{message}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          S'inscrire
        </button>
      </form>
      <Alert message={alert.message} type={alert.type} />
      <p className="mt-4">
        Vous avez déjà un compte ? <Link to="/login" className="text-indigo-600 hover:text-indigo-800">Connexion</Link>
      </p>
    </div>
  );
}

export default Register;
