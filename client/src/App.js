import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/pages/HomePage';
import ProductAdminForm from './components/forms/ProductAdminForm';
import Register from './components/AuthForms/Register';
import Login from './components/AuthForms/Login';
import Navbar from './components/navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetailsPage from './components/pages/ProductDetailsPage';
import ProductCategoriesList from "./components/pages/ProductCategoriesList";
import ProductList from "./components/pages/ProductList";
import bgAuth from "./assets/bg-auth.png";
import FilteredArticles from './components/Filtered/FilteredArticles';
import AdminPanel from './components/pages/AdminPanel';
import UserProfile from './components/user/UserProfile';
import CartPage from "./components/pages/Checkout/CartPage";
import Footer from "./components/footer/Footer";
import ProductAdminAddModel from './components/forms/ProductAdminAddModel';
import ProductAdminEdit from './components/forms/ProductAdminEdit';
import RhythmGame from './components/Game/RhythmGame';
import ShippingPage from './components/pages/Checkout/ShippingPage';
import DeliveryHomePage from './components/pages/Checkout/DeliveryHomePage';
import StockManagementPage from './components/pages/StockManagementPage';
import { SearchProvider } from './context/SearchContext'; 
import { CartProvider } from './context/CartContext';
import PaymentPage from './components/pages/Checkout/PaymentPage';

const App = () => (
    <Router>
        <SearchProvider>
        <CartProvider>
        <BackgroundWrapper>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow">
                    <Content />
                </div>
                <Footer />
            </div>
        </BackgroundWrapper>
        </CartProvider>
        </SearchProvider>
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
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<ProductCategoriesList />} />
                <Route path="/products/:category/:categoryId" element={<ProductList />} />
                <Route path="/products/:category/:categoryId/search" element={<ProductList />} />
                <Route path="/products/search" element={<ProductList />} />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/*"
                    element={
                        <ProtectedRoute requiredRole="ROLE_USER">
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/admin/create-product" element={<ProductAdminForm />} />
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
                    path='/admin/product/:category/:id/add-model'
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <ProductAdminAddModel />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/product/:id"
                    element={<ProductDetailsPage />}
                />
                <Route path="/cart" element={<CartPage />} />
                {/* <Route path="/admin/stock-management" element={<StockManagementPage />} /> */}
                <Route
                    path="/filters"
                    element={<FilteredArticles />}
                />
                <Route path='/delivery' element={<ShippingPage />} />
                <Route path='/delivery/home-delivery' element={<DeliveryHomePage />} />
                <Route path='/checkout/payment' element={<PaymentPage />} />
                <Route path="/rhythm-game" element={<RhythmGame />} />
            </Routes>
        </div>
    );
};

export default App;
