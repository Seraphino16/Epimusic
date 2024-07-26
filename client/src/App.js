
import React from 'react';
import './App.css';
import Register from './Register';
import Login from './Login';


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to React and Symfony Integration</h1>
                <Register />
                <Login />
            </header>
        </div>
    );
}

export default App;

