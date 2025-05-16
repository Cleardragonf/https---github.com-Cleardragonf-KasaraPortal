import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    login: (username: string) => void;
    logout: () => void;
    resetSessionTimeout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [username, setUsername] = useState(() => {
        return localStorage.getItem('username');
    });
    const navigate = useNavigate();

    const login = (username: string) => {
        setIsAuthenticated(true);
        setUsername(username);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        navigate('/'); // Redirect to home after login
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUsername(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        navigate('/login'); // Redirect to login after logout
    };

    const resetSessionTimeout = () => {
        console.log('[AuthContext] Session timeout reset');
    };

    useEffect(() => {
        console.log('[AuthContext] Authentication state:', isAuthenticated, 'Username:', username);
    }, [isAuthenticated, username]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout, resetSessionTimeout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
