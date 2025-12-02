// src/services/api.js
import axios from 'axios';

// En production, pointez vers votre backend
// En développement, pointez vers localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchProducts = () => axios.get(`${API_BASE_URL}/products`);

export const createOrder = (orderData) => {
    console.log(`appel fonction createOrder avec orderData ${JSON.stringify(orderData)}`)
    const token = localStorage.getItem('token'); // Token de connexion
    console.log(`token is ${token}`)
    return axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
