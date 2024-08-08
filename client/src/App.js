import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Register from './components/AuthForms/Register';
import Login from './components/AuthForms/Login';
import Navbar from './components/navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetailsPage from './components/pages/ProductDetailsPage';
import ProductCategoriesList from "./components/pages/ProductCategoriesList";
import ProductList from "./components/pages/ProductList";
import bgAuth from "./assets/bg-auth.png";
import './App.css';
import FilteredArticles from './components/Filtered/FilteredArticles';
import AdminPanel from './components/pages/AdminPanel';
import CartPage from './components/pages/Checkout/CartPage';
import ProductAdminForm from './components/forms/ProductAdminForm';
import UserProfile from './components/user/UserProfile';

const App = () => (
    <Router>
        <BackgroundWrapper>
            <Navbar />
            <Content />
        </BackgroundWrapper>
    </Router>
);



const BackgroundWrapper = ({ children }) => {
    const location = useLocation();
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
    const backgroundImage = isAuthRoute ? bgAuth : bgAuth;

    return (
        <div
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
            }}
        >
            {children}
        </div>
    );
};

const Content = () => {
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductCategoriesList />} />
        <Route path="/products/:category/:categoryId" element={<ProductList />} />
        <Route
            path="/admin"
            element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminPanel />
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
        <Route 
          path="/product/:id"
          element={<ProductDetailsPage />}
        />
        <Route 
          path="/filters"
          element={<FilteredArticles />}
        />
        <Route
          path='/cart'
          element={<CartPage />}
        />
      </Routes>
    </div>
  );
};

export default App;