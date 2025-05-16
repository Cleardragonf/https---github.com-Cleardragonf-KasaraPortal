import React, { useState, ChangeEvent, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, IconButton, Collapse, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';
const backendUrl = process.env.REACT_APP_PROXY; // Use process.env for CRA
if (!backendUrl) {
    console.error('REACT_APP_PROXY is not defined. Please check your .env.development file.');
    throw new Error('REACT_APP_PROXY is not defined');
}

interface ConfigureScheduleDialogProps {
    showForm: boolean;
    toggleForm: () => void;
    handleSubmit: () => void;
}

interface Schedule {
    id: string;
    transactionType: string;
    description: string;
    expanded: boolean;
    editable: boolean;
    dayOfMonth: string;
    time: string;
}


export const TransactionCounts_ConfigureScheduleDialog: React.FC<ConfigureScheduleDialogProps> = ({
    showForm,
    toggleForm,
    handleSubmit
}) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [newScheduleData, setNewScheduleData] = useState({
        transactionType: '',
        description: '',
        dayOfMonth: '',
        time: ''
    });

    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
    const [transactionTypeToDelete, setTransactionTypeToDelete] = useState<string | null>(null);

    const handleAddNewSchedule = () => {
        const newSchedule: Schedule = {
            id: uuidv4(),
            transactionType: newScheduleData.transactionType,
            description: newScheduleData.description,
            expanded: true,
            editable: true,
            dayOfMonth: newScheduleData.dayOfMonth,
            time: newScheduleData.time
        };
        setSchedules([...schedules, newSchedule]);
        setNewScheduleData({ transactionType: '', description: '', dayOfMonth: '', time: '' });
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/TransactionCounts/Schedule`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setSchedules(result);
        } catch (error) {
            console.log((error as Error).message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleSchedule = (id: string) => {
        setSchedules(schedules.map(schedule =>
            schedule.id === id ? { ...schedule, expanded: !schedule.expanded } : schedule
        ));
    };

    const handleEditSchedule = (id: string) => {
        setSchedules(schedules.map(schedule =>
            schedule.id === id ? { ...schedule, editable: true, expanded: true } : schedule
        ));
    };

    const handleSaveSchedule = async (id: string) => {
        const updatedSchedule = schedules.find(schedule => schedule.id === id);
        if (!updatedSchedule) return;

        const formattedTime = updatedSchedule.time.trim(); // Trim the time

        try {
            // Check if the schedule exists by doing a GET request
            const scheduleExistsResponse = await fetch(`${backendUrl}/api/TransactionCounts/Schedule/${id}`);
            
            // If the schedule exists, we proceed with PUT request, otherwise POST request
            if (scheduleExistsResponse.ok) {
                const response = await fetch(`${backendUrl}/api/TransactionCounts/Schedule/edit/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transactionType: updatedSchedule.transactionType,
                        description: updatedSchedule.description,
                        dayOfMonth: updatedSchedule.dayOfMonth,
                        time: formattedTime, // Send the trimmed time
                        updatedAt: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    throw new Error('Error saving schedule');
                }

                setSchedules(schedules.map(schedule =>
                    schedule.id === id ? { ...schedule, editable: false, expanded: false } : schedule
                ));
            } else {
                const response = await fetch(`${backendUrl}/api/TransactionCounts/Schedule/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: updatedSchedule.id,
                        transactionType: updatedSchedule.transactionType,
                        description: updatedSchedule.description,
                        dayOfMonth: updatedSchedule.dayOfMonth,
                        time: formattedTime,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    })

                    
                });
                setSchedules(schedules.map(schedule =>
                    schedule.id === id ? { ...schedule, editable: false, expanded: false } : schedule
                ));

                if (!response.ok) {
                    throw new Error('Error creating schedule');
                }

                setSchedules([...schedules, updatedSchedule]);

                setNewScheduleData({ transactionType: '', description: '', dayOfMonth: '', time: '' });

                setSchedules(schedules.map(schedule =>
                    schedule.id === id ? { ...schedule, expanded: !schedule.expanded } : schedule
                ));

                fetchData();
            }
        } catch (error) {
            console.error('Error during save:', error);
        }
    };

    const handleDeleteScheduleClick = (id: string, transactionType: string) => {
        setScheduleToDelete(id);
        setTransactionTypeToDelete(transactionType);
        setOpenDeleteConfirmDialog(true);
    };

    const handleDeleteSchedule = async () => {
        if (!scheduleToDelete) return;

        try {
            const response = await fetch(`${backendUrl}/api/TransactionCounts/Schedule/delete/${scheduleToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error deleting schedule');
            }

            setSchedules(schedules.filter(schedule => schedule.id !== scheduleToDelete));
            setOpenDeleteConfirmDialog(false);
            setScheduleToDelete(null);
            setTransactionTypeToDelete(null);
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const handleCancelDelete = () => {
        setOpenDeleteConfirmDialog(false);
        setScheduleToDelete(null);
        setTransactionTypeToDelete(null);
    };

    const handleFieldChange = (id: string, field: string, value: string) => {
        setSchedules(schedules.map(schedule =>
            schedule.id === id ? { ...schedule, [field]: value } : schedule
        ));
    };

    const handleNewScheduleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewScheduleData({ ...newScheduleData, [e.target.name]: e.target.value });
    };

    const resetSchedules = () => {
        setSchedules(schedules.map(schedule => ({
            ...schedule,
            expanded: false,
            editable: false
        })));
    };

    const handleCancel = () => {
        resetSchedules();
        toggleForm();
    };

    return (
        <Dialog open={showForm} onClose={toggleForm}>
            <DialogTitle>Transaction Count Scheduling</DialogTitle>
            <DialogContent>
                <Button variant="contained" color="primary" onClick={handleAddNewSchedule} style={{marginBottom: '16px'}}>
                    + Add New Schedule
                </Button>

                {schedules.map(schedule => (
                    <Paper key={schedule.id} sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', boxShadow: 'none', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{schedule.transactionType} - {schedule.dayOfMonth}</h2>
                            <div>
                                {!schedule.editable ? (
                                    <IconButton onClick={() => handleEditSchedule(schedule.id)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                ) : (
                                    <IconButton onClick={() => handleSaveSchedule(schedule.id)} color="secondary">
                                        Save
                                    </IconButton>
                                )}
                                <IconButton onClick={() => handleDeleteScheduleClick(schedule.id, schedule.transactionType)} color="secondary">
                                    <DeleteIcon />
                                </IconButton>
                                <IconButton onClick={() => handleToggleSchedule(schedule.id)} color="primary">
                                    <ExpandMoreIcon />
                                </IconButton>
                            </div>
                        </div>

                        <Collapse in={schedule.expanded}>
                            {schedule.editable ? (
                                <>
                                    <TextField
                                        label="Transaction Type"
                                        value={schedule.transactionType}
                                        onChange={e => handleFieldChange(schedule.id, 'transactionType', e.target.value)}
                                        fullWidth
                                        style={{ marginBottom: '8px' }}
                                    />
                                    <TextField
                                        label="Description"
                                        value={schedule.description}
                                        onChange={e => handleFieldChange(schedule.id, 'description', e.target.value)}
                                        fullWidth
                                        style={{ marginBottom: '8px' }}
                                    />
                                    <FormControl fullWidth style={{ marginBottom: '8px' }}>
                                        <InputLabel>Day of the Month</InputLabel>
                                        <Select
                                            value={schedule.dayOfMonth}
                                            onChange={e => handleFieldChange(schedule.id, 'dayOfMonth', e.target.value)}
                                        >
                                            {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(day => (
                                                <MenuItem key={day} value={day}>{day}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Time (HH:mm)"
                                        value={schedule.time}
                                        onChange={e => handleFieldChange(schedule.id, 'time', e.target.value)}
                                        fullWidth
                                        style={{ marginBottom: '8px' }}
                                    />
                                </>
                            ) : (
                                <p>{schedule.description}</p>
                            )}
                        </Collapse>
                    </Paper>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="secondary">Cancel</Button>
            </DialogActions>

            <Dialog open={openDeleteConfirmDialog} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the schedule for <strong>{transactionTypeToDelete}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteSchedule} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};
