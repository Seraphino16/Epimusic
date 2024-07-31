import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [imagePath, setImagePath] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (file.size > 25 * 1024 * 1024) {
            setMessage('File size exceeds 25MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('File uploaded successfully!');
            setImagePath(response.data.filePath);
        } catch (error) {
            setMessage('Error uploading file');
        }
    };

    return (
        <div>
            <h1>Formulaire d'upload</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} required />
                <button type="submit">Upload</button>
            </form>
            {message && <p>{message}</p>}
            {imagePath && (
                <div>
                    <h2>Image Uploadée :</h2>
                    <img src={`http://localhost:8000${imagePath}`} alt="Uploaded" />
                </div>
            )}
        </div>
    );
};

export default UploadForm;