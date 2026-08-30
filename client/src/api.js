// client/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
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
