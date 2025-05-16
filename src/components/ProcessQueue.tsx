import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, Box, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
const backendUrl = process.env.REACT_APP_PROXY; // Use process.env for CRA
if (!backendUrl) {
    console.error('REACT_APP_PROXY is not defined. Please check your .env.development file.');
    throw new Error('REACT_APP_PROXY is not defined');
}


interface ProcessQueueProps {
    queue: Record<string, any>;
    onDelete: (processId: string) => void; // Add onDelete prop
}

const ProcessQueue: React.FC<ProcessQueueProps> = ({ queue, onDelete }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

    useEffect(() => {
        console.log("🚀 ProcessQueue re-rendered. Queue:", queue);
    }, [queue]);

    const handleDeleteClick = (processId: string) => {
        setSelectedProcessId(processId);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProcessId(null);
    };

    const handleConfirmDelete = async () => {
        if (selectedProcessId) {
            try {
                const response = await fetch(`${backendUrl}/api/TransactionCounts/ProcessQueue/delete/${selectedProcessId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    console.log('Process deleted successfully');
                    onDelete(selectedProcessId);
                    handleCloseDialog();
                } else {
                    console.error('Failed to delete process');
                }
            } catch (error) {
                console.error('Error deleting process:', error);
            }
        }
    };

    return (
        <div>
            {Object.keys(queue).length > 0 ? (
                Object.values(queue).map((process, index) => (
                    <Paper
                        key={index}
                        sx={{
                            marginBottom: '8px',
                            padding: '16px',
                            borderRadius: '8px',
                            boxShadow: 3,
                            position: 'relative',
                        }}
                    >
                        <IconButton
                            sx={{ position: 'absolute', top: '8px', right: '8px' }}
                            onClick={() => handleDeleteClick(process.data.processId)}
                        >
                            <CloseIcon color="error" />
                        </IconButton>
                        <Typography variant="h6">{`Transaction: ${process.data?.transactionType || 'Unknown'}`}</Typography>
                        <Typography variant="body1">{`Year: ${process.data?.year || 'Unknown'}, Month: ${process.data?.month || 'Unknown'}`}</Typography>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                Status: {process.status}
                            </Typography>
                            {process.status === 'In Progress' && <CircularProgress size={24} />}
                        </Box>
                    </Paper>
                ))
            ) : (
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="h4">No processes in the queue.</Typography>
                </Box>
            )}

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this process?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProcessQueue;
