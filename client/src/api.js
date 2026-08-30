// client/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : (import.meta.env.VITE_API_URL || '/api'),
});

// Automatic Token Interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;