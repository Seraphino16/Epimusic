
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [login, setLogin] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/login')
            .then(response => {
                setLogin(response.data.login);
            })
            .catch(error => {
                console.error('There was an error fetching the login!', error);
            });
    }, []);

    return (
        <div>
            <p>{login}</p>
        </div>
    );
};

export default Login;