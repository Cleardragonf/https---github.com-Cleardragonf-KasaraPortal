import React, { useEffect, useState } from 'react';
import SessionTimeout from './components/SessionTimeout';
import { Route, Routes, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ServerStats from './pages/ServerStats';
import Counts from './pages/Counts';
import Archive from './pages/Archive';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import './App.css';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout, username } = useAuth();
    const { notifications } = useNotifications(); // Access notifications from NotificationContext
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    const handleBadgeClick = () => {
        setShowModal(true); // Show the modal when the badge is clicked
    };

    const closeModal = () => {
        setShowModal(false); // Close the modal
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg sticky-top navbar-dark bg-primary">
                <a className="navbar-brand" href="#">Translator Portal</a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarText"
                    aria-controls="navbarText"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item active">
                            <NavLink className="nav-link" to="/">
                                Home <span className="sr-only">(current)</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/counts">
                                Counts
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/server-stats">
                                Server Stats
                            </NavLink>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        {isAuthenticated && notifications.length > 0 && (
                            <span
                                className="badge bg-danger ms-2"
                                style={{ cursor: 'pointer' }}
                                onClick={handleBadgeClick}
                            >
                                {notifications.length}
                            </span>
                        )}
                        <div className="dropdown">
                            <button
                                className="btn"
                                type="button"
                                id="loginDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-person-circle"></i>{' '}
                                {isAuthenticated ? `Hello, ${username}` : 'Login'}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="loginDropdown">
                                {isAuthenticated ? (
                                    <>
                                        <li>
                                            <NavLink className="dropdown-item" to="/account">
                                                Account
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink className="dropdown-item" to="/preferences">
                                                Preferences
                                            </NavLink>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={logout}>
                                                Sign Out
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <li>
                                        <NavLink className="dropdown-item" to="/login">
                                            Login
                                        </NavLink>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {showModal && (
                <div className="modal show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Notifications</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {notifications.map(notification => (
                                    <div key={notification.id} className={`alert alert-${notification.type}`}>
                                        <strong>{notification.serverName}:</strong> {notification.message}
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const App: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (!isAuthenticated || location.pathname === '/login') {
            setShowWarning(false);
            setCountdown(30);
            return;
        }

        let logoutTimer: NodeJS.Timeout;
        let warningTimer: NodeJS.Timeout;
        let countdownInterval: NodeJS.Timeout;

        const startTimers = () => {
            warningTimer = setTimeout(() => {
                setShowWarning(true);
                let timeLeft = 30;
                countdownInterval = setInterval(() => {
                    timeLeft -= 1;
                    setCountdown(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(countdownInterval);
                        logout();
                        navigate('/login');
                    }
                }, 1000);
            }, 30 * 1000);

            logoutTimer = setTimeout(() => {
                logout();
                navigate('/login');
            }, 60 * 1000);
        };

        const resetTimers = () => {
            clearTimeout(logoutTimer);
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);

            setShowWarning(false);
            setCountdown(30);
            startTimers();
        };

        window.addEventListener('mousemove', resetTimers);
        window.addEventListener('keydown', resetTimers);

        startTimers();

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                resetTimers();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearTimeout(logoutTimer);
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);
            window.removeEventListener('mousemove', resetTimers);
            window.removeEventListener('keydown', resetTimers);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, location.pathname, logout, navigate]);

    return (
        <UserProvider>
            <AuthProvider>
                <NotificationProvider>
                    <SessionTimeout excludedPaths={['/login']}>
                        <div>
                            <Navbar />
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/"
                                    element={
                                        <PrivateRoute>
                                            <Home />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/server-stats"
                                    element={
                                        <PrivateRoute>
                                            <ServerStats />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/counts"
                                    element={
                                        <PrivateRoute>
                                            <Counts />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/projects/archive"
                                    element={
                                        <PrivateRoute>
                                            <Archive />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="/create-user" element={<CreateUserPage />} />
                            </Routes>
                        </div>
                    </SessionTimeout>
                </NotificationProvider>
            </AuthProvider>
        </UserProvider>
    );
};

export default App;
