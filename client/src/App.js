import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/create-product" element={<ProductForm />} />
            </Routes>
        </Router>
    );
};

export default App;