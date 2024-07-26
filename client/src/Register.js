
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [register, setRegister] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/register')
            .then(response => {
                setRegister(response.data.register);
            })
            .catch(error => {
                console.error('There was an error fetching the register!', error);
            });
    }, []);

    return (
        <div>
            <p>{register}</p>
        </div>
    );
};

export default Register;