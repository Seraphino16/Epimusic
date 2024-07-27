
import React from 'react';
import './App.css';
import Register from './Register';
import Login from './Login';
import Admin from './Admin';


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to React and Symfony Integration</h1>
                <Register />
                <Login />
                <Admin />
            </header>
        </div>
    );
}

export default App;

