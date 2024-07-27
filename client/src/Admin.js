
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
    const [admin, setAdmin] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/admin')
            .then(response => {
                setAdmin(response.data.admin);
            })
            .catch(error => {
                console.error('There was an error fetching the admin!', error);
            });
    }, []);

    return (
        <div>
            <p>{admin}</p>
        </div>
    );
};

export default Admin;