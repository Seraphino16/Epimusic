import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductAdminList from './components/pages/ProductAdminList';
import ProductAdminForm from './components/forms/ProductAdminForm';
import ProductAdminEdit from './components/forms/ProductAdminEdit';
import Navbar from './components/navbar/Navbar';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<ProductAdminList />} />
                <Route path="/admin/create-product" element={<ProductAdminForm />} />
                <Route path="/admin/edit-product/:id" element={<ProductAdminEdit />} />
            </Routes>
        </Router>
    );
};

export default App;