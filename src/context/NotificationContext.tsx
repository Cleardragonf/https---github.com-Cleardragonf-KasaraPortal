import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for notifications
interface Notification {
    id: string;
    message: string;
    type: 'error' | 'info' | 'warning';
    serverName: string;  // This is the only valid property here
    role: 'Supervisor' | 'Translator' | 'Reviewer' | 'Admin'; // This is the only valid property here
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

// Notification Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 'default',
            message: 'Welcome to the Translator Portal!',
            type: 'info',
            serverName: 'default-server',
            role: 'Admin', // Default role for the initial notification
        },
    ]);

    const addNotification = (notification: Notification) => {
        setNotifications(prevNotifications => [...prevNotifications, notification]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use notifications
export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
