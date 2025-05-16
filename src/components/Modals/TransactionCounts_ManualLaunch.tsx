import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

export interface ManualLaunchDialogProps {
    showForm: boolean;
    toggleForm: () => void;
    formData: { transactionType: string; year: string; month: string };
    setFormData: React.Dispatch<React.SetStateAction<{ transactionType: string; year: string; month: string }>>; 
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (e: SelectChangeEvent<string>) => void;
    handleSubmit: () => void;
}

export const transactionTypes = ['test', 'TRN_DLY_TP_270_TRANS_COUNTS', 'TRN_DLY_TP_837D_TRANS_COUNTS_NoDB', 'TRN_DLY_TP_837D_TRANS_COUNTS',
    'TRN_DLY_TP_837I_TRANS_COUNTS_NoDB', 'TRN_DLY_TP_837I_TRANS_COUNTS', 'TRN_DLY_TP_837P_TRANS_COUNTS_NoDB', 'TRN_DLY_TP_837P_TRANS_COUNTS',
    'TRN_EDIFECS_MEDNE_TRANS_COUNTS'
];


export const TransactionCounts_ManualLaunch: React.FC<ManualLaunchDialogProps> = ({
    showForm, toggleForm, formData, handleInputChange, handleSelectChange, handleSubmit,
}) => {
    return (
        <Dialog open={showForm} onClose={toggleForm}>
            <DialogTitle>Manually Fire Transaction Counts</DialogTitle>
            <DialogContent>
                <form>
                <FormControl fullWidth margin="normal">
                        <InputLabel>Transaction Type</InputLabel>
                        <Select
                            label="Transaction Type"
                            name="transactionType"
                            value={formData.transactionType}
                            onChange={handleSelectChange}
                        >
                            {transactionTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Year</InputLabel>
                        <Select
                            label="Year"
                            name="year"
                            value={formData.year}
                            onChange={handleSelectChange}
                        >
                            {['2021', '2022', '2023', '2024', '2025'].map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Month</InputLabel>
                        <Select
                            label="Month"
                            name="month"
                            value={formData.month}
                            onChange={handleSelectChange}
                        >
                            {["01-Jan", "02-Feb", "03-Mar", "04-Apr", "05-May", "06-Jun", "07-Jul", "08-Aug", "09-Sep", "10-Oct", "11-Nov", "12-Dec"].map(month => (
                                <MenuItem key={month} value={month}>{month}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={toggleForm} color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};
