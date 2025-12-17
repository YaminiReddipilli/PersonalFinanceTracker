import axios from 'axios';
import {API_BASE_URL} from './apiPaths';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Increased to 60 seconds for OCR processing
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Special timeout for receipt processing
    if (config.url && config.url.includes('/receipt/extract')) {
        config.timeout = 120000; // 2 minutes for OCR processing
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if(error.response) {
        // Handle specific error responses
        if(error.response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        } else if(error.response.status === 500) {
            console.error('Server error:', error.response.data);
            alert('An unexpected error occurred. Please try again later.');
        }
    } else if(error.code === "ECONNABORTED"){
        console.error('Request timeout:', error.message);
        alert('Request timed out. Please check your internet connection and try again.');
    }
    return Promise.reject(error);
});

export default axiosInstance;
