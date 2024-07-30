import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../Alerts/Alert';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState({ message: '', type: 'error' });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: 'Connexion réussie. Vous allez être redirigé vers la page d\'accueil', type: 'success' });
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // This will refresh the page
        }, 3000);
      } else {
        setAlert({ message: data.message || 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer plus tard', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer plus tard', type: 'error' });
    }
  };

  return (
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6">Connexion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {message && <p className="text-red-600">{message}</p>}
          <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Se connecter
          </button>
        </form>
        <Alert message={alert.message} type={alert.type} />
        <p className="mt-4">
          Vous n'avez pas de compte ? <Link to="/register" className="text-indigo-600 hover:text-indigo-800">Inscription</Link>
        </p>
      </div>
  );
}

export default Login;