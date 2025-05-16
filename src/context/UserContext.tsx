import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
    username: string;
    setUsername: (username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [username, setUsername] = useState<string>(() => {
        // Retrieve the username from local storage on initialization
        return localStorage.getItem('username') || '';
    });

    const updateUsername = (newUsername: string) => {
        setUsername(newUsername);
        if (newUsername) {
            localStorage.setItem('username', newUsername); // Persist username
        } else {
            localStorage.removeItem('username'); // Clear username
        }
    };

    return (
        <UserContext.Provider value={{ username, setUsername: updateUsername }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
