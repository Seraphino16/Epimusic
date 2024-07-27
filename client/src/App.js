import React from 'react';
import './App.css';
import ProductForm from './ProductForm';

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <h1>Create a New Product</h1>
          <ProductForm />
        </header>
      </div>
  );
}

export default App;