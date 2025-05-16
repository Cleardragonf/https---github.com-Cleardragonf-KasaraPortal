import React, { useEffect, useReducer, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface SessionState {
    isModalVisible: boolean;
    countdown: number | null;
}

type SessionAction =
    | { type: 'START_COUNTDOWN'; payload: number }
    | { type: 'RESET_SESSION' }
    | { type: 'HIDE_MODAL' }
    | { type: 'SET_COUNTDOWN'; payload: number };

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
    switch (action.type) {
        case 'START_COUNTDOWN':
            return { ...state, isModalVisible: true, countdown: action.payload };
        case 'RESET_SESSION':
            return { ...state, isModalVisible: false, countdown: null };
        case 'HIDE_MODAL':
            return { ...state, isModalVisible: false };
        case 'SET_COUNTDOWN':
            return { ...state, countdown: action.payload };
        default:
            return state;
    }
};

const SessionTimeout: React.FC<{ excludedPaths?: string[]; children?: React.ReactNode }> = ({ children, excludedPaths = ['/login'] }) => {
    const { isAuthenticated, logout } = useAuth();
    const [state, dispatch] = useReducer(sessionReducer, { isModalVisible: false, countdown: null });
    const countdownRef = useRef<number | null>(null);
    const sessionTimeout = 1 * 60 * 1000; // 15 minutes
    const countdownDuration = 30; // 30 seconds

    useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId: NodeJS.Timeout;
        let countdownId: NodeJS.Timeout;

        const startSessionTimeout = () => {
            console.log('[SessionTimeout] Starting session timeout');
            timeoutId = setTimeout(() => {
                console.log('[SessionTimeout] Session timeout reached, starting countdown');
                dispatch({ type: 'START_COUNTDOWN', payload: countdownDuration });
                countdownRef.current = countdownDuration;

                countdownId = setInterval(() => {
                    if (countdownRef.current !== null) {
                        countdownRef.current -= 1;
                        dispatch({ type: 'SET_COUNTDOWN', payload: countdownRef.current });

                        if (countdownRef.current === 0) {
                            clearInterval(countdownId);
                            logout();
                            console.log('[SessionTimeout] User logged out due to inactivity');
                        }
                    }
                }, 1000);
            }, sessionTimeout - countdownDuration * 1000);
        };

        const resetTimeout = () => {
            console.log('[SessionTimeout] Resetting session timeout');
            clearTimeout(timeoutId);
            clearInterval(countdownId);
            countdownRef.current = null;
            dispatch({ type: 'RESET_SESSION' });

            // Restart the countdown if the modal is visible
            if (state.isModalVisible) {
                countdownRef.current = countdownDuration;
                dispatch({ type: 'SET_COUNTDOWN', payload: countdownDuration });

                countdownId = setInterval(() => {
                    if (countdownRef.current !== null) {
                        countdownRef.current -= 1;
                        dispatch({ type: 'SET_COUNTDOWN', payload: countdownRef.current });

                        if (countdownRef.current === 0) {
                            clearInterval(countdownId);
                            logout();
                            console.log('[SessionTimeout] User logged out due to inactivity');
                        }
                    }
                }, 1000);
            } else {
                startSessionTimeout();
            }
        };

        startSessionTimeout();

        const activityEvents = ['mousemove', 'keydown', 'click'];
        activityEvents.forEach((event) => window.addEventListener(event, resetTimeout));

        return () => {
            clearTimeout(timeoutId);
            clearInterval(countdownId);
            activityEvents.forEach((event) => window.removeEventListener(event, resetTimeout));
        };
    }, [isAuthenticated, logout]);

    const currentPath = window.location.pathname;
    if (excludedPaths.includes(currentPath)) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            <Dialog open={state.isModalVisible} onClose={() => dispatch({ type: 'HIDE_MODAL' })}>
                <DialogTitle>Session Timeout</DialogTitle>
                <DialogContent>
                    <p>
                        You will be logged out in <strong>{state.countdown}</strong> seconds due to inactivity.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            dispatch({ type: 'RESET_SESSION' });
                            console.log('[SessionTimeout] User chose to stay logged in');
                        }}
                        color="primary"
                    >
                        Stay Logged In
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SessionTimeout;
