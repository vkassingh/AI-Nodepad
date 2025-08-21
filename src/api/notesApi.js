import axios from 'axios';

const notesApi = axios.create({
  baseURL: 'https://ai-notes-management-api-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add an interceptor here to automatically attach the token to every request.
notesApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default notesApi;