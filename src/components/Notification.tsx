import React from 'react';
import './Notification.css';

interface NotificationProps {
    id: string;
    message: string;
    type: 'error' | 'info' | 'warning';
    onClose: (id: string) => void;
    onClick: (serverName: string) => void;  // Expecting a function that takes serverName as an argument
    serverName: string;  // To uniquely identify the server
}

const Notification: React.FC<NotificationProps> = ({ id, message, type, onClose, onClick, serverName }) => {
    return (
        <div className={`notification ${type}`} onClick={() => onClick(serverName)}>
            <span>{message}</span>
            <button onClick={() => onClose(id)}>✖</button>
        </div>
    );
};

export default Notification;
