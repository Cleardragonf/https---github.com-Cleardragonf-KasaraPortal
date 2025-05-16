import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  // Define the shape of your context value
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <AuthContext.Provider value={{ /* ...existing code... */ }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};