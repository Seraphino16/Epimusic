import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.roles || !user.roles.includes(requiredRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
