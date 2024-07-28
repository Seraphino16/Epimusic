import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductEdit from './ProductEdit';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/create-product" element={<ProductForm />} />
                <Route path="/edit-product/:id" element={<ProductEdit />} />
            </Routes>
        </Router>
    );
};

export default App;