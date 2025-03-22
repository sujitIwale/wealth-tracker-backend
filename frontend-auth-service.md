## Frontend Authentication Service

Here's how to implement authentication in your React frontend:

1. First, install the necessary dependencies:
```bash
npm install axios jwt-decode
```

2. Create an authentication service (src/services/authService.js):

```javascript
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const API_URL = 'http://localhost:3000';

// Create an axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to all requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  // Initiate Google OAuth login
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  // Handle authentication after redirect from Google
  handleAuthCallback: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      return true;
    }
    return false;
  },

  // Get current user details
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/current-user');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decodedToken = jwtDecode(token);
      // Check if token is expired
      return decodedToken.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = `${API_URL}/auth/logout`;
  },

  // Get the token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
```

3. Create an Authentication Context (src/context/AuthContext.jsx):

```jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user', error);
        }
      }
      setLoading(false);
    };

    // Check for token in URL (after Google redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      authService.handleAuthCallback(token);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadUser();
  }, []);

  // Login with Google
  const login = () => {
    authService.loginWithGoogle();
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
```

4. Create Authentication Components:

Login Button Component (src/components/LoginButton.jsx):
```jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginButton = () => {
  const { login } = useAuth();

  return (
    <button 
      onClick={login}
      className="login-button"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;
```

Authentication Guard Component (src/components/PrivateRoute.jsx):
```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
```

5. Wrap your App with the Auth Provider (src/main.jsx or src/index.jsx):

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

6. Implement Protected Routes (src/App.jsx):

```jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import { useAuth } from './context/AuthContext';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/expenses" element={
        <PrivateRoute>
          <Expenses />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
```

7. Create a login page (src/pages/Login.jsx):

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginButton from '../components/LoginButton';

const Login = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container">
      <h1>Welcome to Wealth Tracker</h1>
      <p>Please sign in to continue</p>
      <LoginButton />
    </div>
  );
};

export default Login;
```

8. Update your API calls to include the authentication token:

```jsx
import authService from '../services/authService';

// Example of fetching expenses
const fetchExpenses = async () => {
  try {
    const response = await fetch('http://localhost:3000/expense/all', {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return null;
  }
}; 