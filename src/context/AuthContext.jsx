import { createContext, useState, useEffect, useContext } from 'react';
import notesApi from '../api/notesApi';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const registerUser = async (userData) => {
    const response = await notesApi.post('/auth/register', userData);
    // Handle success, maybe automatically log the user in
  };

  const loginUser = async (credentials) => {
    const response = await notesApi.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsLoggedIn(true);
    navigate('/');
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);