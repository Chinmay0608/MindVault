import { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../api/authApi';
import * as userApi from '../api/userApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    
    const resolveAuth = async () => {
      if (token) {
        try {
          const userData = await userApi.getMe();
          setUser(userData);
        } catch (error) {
          logout();
        }
      }
      
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, delay);
    };

    resolveAuth();
  }, [token]);

  const loginUser = async (userName, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(userName, password);
      // Backend returns { token: "<jwt>" }
      const tokenVal = data.token;
      localStorage.setItem('token', tokenVal);
      localStorage.setItem('userName', userName);
      setToken(tokenVal);
      return true;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithFirebase = async (idToken) => {
    setLoading(true);
    try {
      const data = await authApi.firebaseLogin(idToken);
      const tokenVal = data.token;
      const userName = data.userName;
      localStorage.setItem('token', tokenVal);
      localStorage.setItem('userName', userName);
      setToken(tokenVal);
      return true;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const signupUser = async (userName, email, password, sentimentAnalysis) => {
    await authApi.signup(userName, email, password, sentimentAnalysis);
  };

  const updateProfile = async (userData) => {
    await userApi.updateUser(userData);
    if (userData.userName) {
      localStorage.setItem('userName', userData.userName);
    }
    // Fetch updated profile
    await fetchUser();
  };

  const deleteAccount = async () => {
    await userApi.deleteUser();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login: loginUser,
        loginWithFirebase,
        logout,
        signup: signupUser,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
