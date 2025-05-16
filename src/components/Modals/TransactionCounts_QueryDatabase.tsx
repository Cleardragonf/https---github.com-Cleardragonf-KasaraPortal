import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, TextField, FormControl, InputLabel, Select, MenuItem, Box, Chip } from '@mui/material';
const backendUrl = process.env.REACT_APP_PROXY; // Use process.env for CRA
if (!backendUrl) {
    console.error('REACT_APP_PROXY is not defined. Please check your .env.development file.');
    throw new Error('REACT_APP_PROXY is not defined');
}

interface QueryDatabaseDialogProps {
    showQuery: boolean;
    toggleQuery: () => void;
    handleQueryResults: (queryResults: any) => void; // Add callback prop
}

// Define suggestions for autocompletion
const suggestions = [
    "TransactionCount_Schedule", "ProcessQueue", // Existing tables
    "NewTable1", "NewTable2", // Add new tables here
    "id", "transactionType", "description", "dayOfMonth", "time", "createdAt", "updatedAt", "LastSuccessfulRun", // Columns from TransactionCount_Schedule
    "processID", "position", "weight", "transactionType", "year", "month", "status", "createdDate", "startedDate", "server", // Columns from ProcessQueue
    "newColumn1", "newColumn2", // Add new columns here
    "SELECT", "INSERT", "UPDATE", "DELETE", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY" // SQL keywords
];

export const TransactionCounts_QueryDatabaseDialog: React.FC<QueryDatabaseDialogProps> = ({ showQuery, toggleQuery, handleQueryResults }) => {
    const [selectedTab, setSelectedTab] = useState(0); // 0 for Stored Queries, 1 for Custom Query
    const [customQuery, setCustomQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null); // Track selected table

    // Handle Tab Change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    // Handle Custom Query Change
    const handleCustomQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomQuery(e.target.value);
    };

    // Add a query part to the custom query
    const addQueryPart = (part: string) => {
        setCustomQuery((prevQuery) => (prevQuery ? `${prevQuery} ${part}` : part));
    };

    // Handle table selection to show relevant columns
    const handleTableSelect = (table: string) => {
        setSelectedTable(table);
        addQueryPart(table);
    };

    // Update the tables and their columns
    const tableColumns: Record<string, string[]> = {
        TransactionCount_Schedule: ["id", "transactionType", "description", "dayOfMonth", "time", "createdAt", "updatedAt", "LastSuccessfulRun"],
        ProcessQueue: ["processID", "position", "weight", "transactionType", "year", "month", "status", "createdDate", "startedDate", "server"],
        NewTable1: ["newColumn1", "newColumn2", "newColumn3"], // Add columns for NewTable1
        NewTable2: ["anotherColumn1", "anotherColumn2"], // Add columns for NewTable2
        Trans_Counts: ["Fldr_Type", "Trans_Type", "Year", "Fldr_Dte", "Trans_Set_Cnt", "Indiv_Trans_Cnt"], // Add columns for Trans_Counts
        Trans_Dly_Counts: ["Fldr_Type", "Trans_Type", "Year", "Month", "Day", "Trans_Set_Cnt", "Indiv_Trans_Cnt", "Tp_Count"], // Add columns for Trans_Dly_Counts
    };

    // Clear the query box
    const clearQuery = () => {
        setCustomQuery('');
        setSelectedTable(null);
    };

    // Enhanced handleSubmit with validation
    const handleSubmit = () => {
        if (selectedTab === 1) {
            if (!customQuery.trim()) {
                setError("Query cannot be empty.");
                return;
            }

            const isValidQuery = /SELECT|INSERT|UPDATE|DELETE/i.test(customQuery);
            if (!isValidQuery) {
                setError("Invalid query. Please ensure it is a valid SQL statement.");
                return;
            }

            setError(null); // Clear any previous errors

            // Send query to proxy server
            fetch(`${backendUrl}/api/Database/Custom/execute-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: customQuery }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Query result:", data.data);
                        handleQueryResults(data.data); // Pass results to parent
                        toggleQuery(); // Close the modal
                    } else {
                        setError(data.error || "Failed to execute query.");
                    }
                })
                .catch(err => {
                    console.error("Query execution error:", err);
                    setError("An error occurred while executing the query.");
                });
        } else {
            handleQuery(); // Handle stored query submission
        }
    };

    return (
        <Dialog open={showQuery} onClose={toggleQuery}>
            <DialogTitle>Query Database</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="query tabs">
                        <Tab label="Stored Queries" />
                        <Tab label="Custom Query" />
                    </Tabs>
                </Box>

                {selectedTab === 0 && (
                    <div>
                        <h3>Stored Queries</h3>
                        <p>Select predefined queries to run:</p>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Predefined Queries</InputLabel>
                            <Select>
                                <MenuItem value="query1">Query 1</MenuItem>
                                <MenuItem value="query2">Query 2</MenuItem>
                                <MenuItem value="query3">Query 3</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                )}

                {selectedTab === 1 && (
                    <div>
                        <h3>Custom Query</h3>
                        <p>Build or type your query:</p>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <div>
                            <TextField
                                label="Query"
                                multiline
                                fullWidth
                                rows={4}
                                value={customQuery}
                                onChange={handleCustomQueryChange}
                                margin="normal"
                            />
                        </div>
                        <Box mt={2}>
                            <h4>Query Builder</h4>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                <strong>Keywords:</strong>
                                {["SELECT", "*", "FROM", "WHERE", "AND", "OR"].map((keyword) => (
                                    <Chip key={keyword} label={keyword} onClick={() => addQueryPart(keyword)} />
                                ))}
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                <strong>Tables:</strong>
                                {["TransactionCount_Schedule", "ProcessQueue", "NewTable1", "NewTable2", "Trans_Counts", "Trans_Dly_Counts"].map((table) => (
                                    <Chip key={table} label={table} onClick={() => handleTableSelect(table)} />
                                ))}
                            </Box>
                            {selectedTable && (
                                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                    <strong>Columns ({selectedTable}):</strong>
                                    {tableColumns[selectedTable]?.map((column) => (
                                        <Chip key={column} label={column} onClick={() => addQueryPart(column)} />
                                    ))}
                                </Box>
                            )}
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                <strong>Operators:</strong>
                                {["=", ">", "<", ">=", "<=", "LIKE"].map((operator) => (
                                    <Chip key={operator} label={operator} onClick={() => addQueryPart(operator)} />
                                ))}
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                <strong>Functions:</strong>
                                {["COUNT", "SUM", "AVG", "MIN", "MAX"].map((func) => (
                                    <Chip key={func} label={func} onClick={() => addQueryPart(func)} />
                                ))}
                            </Box>
                            <Button onClick={clearQuery} variant="outlined" color="secondary" sx={{ mt: 2 }}>
                                Clear Query
                            </Button>
                        </Box>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={toggleQuery} color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};
function handleQuery() {
    throw new Error('Function not implemented.');
}

