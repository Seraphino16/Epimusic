import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductAdminList from './components/pages/ProductAdminList';
import ProductAdminForm from './components/forms/ProductAdminForm';
import ProductAdminEdit from './components/forms/ProductAdminEdit';
import Register from './components/AuthForms/Register';
import Login from './components/AuthForms/Login';
import Navbar from './components/navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <ProductAdminList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-product"
          element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <ProductAdminForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-product/:id"
          element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <ProductAdminEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
export default App;
