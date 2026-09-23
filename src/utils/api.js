import axios from 'axios';

const API = axios.create({
  baseURL: 'https://shopsphere-backend-wi39.onrender.com/api',
});

// Automatically attach JWT token to requests if available in localStorage
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;