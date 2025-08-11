import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// export const login = (credentials) => API.post("/auth/login", credentials);
// export const register = (userData) => API.post("/auth/register", userData);
 export default api;
