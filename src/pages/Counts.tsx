import React, { useState, useEffect, useRef } from 'react';
import SimpleTable from '../components/Table';
import { Button, Paper, SelectChangeEvent } from '@mui/material';
import * as XLSX from 'xlsx'; // Import xlsx library
import { TransactionCounts_ManualLaunch } from '../components/Modals/TransactionCounts_ManualLaunch';
import { TransactionCounts_QueryDatabaseDialog } from '../components/Modals/TransactionCounts_QueryDatabase';
import { TransactionCounts_ConfigureScheduleDialog } from '../components/Modals/TransactionCounts_ConfigureSchedule';
import ProcessQueue from '../components/ProcessQueue';
import { v4 as uuidv4 } from 'uuid';
const backendUrl = process.env.REACT_APP_PROXY; // Get the backend URL from environment variables

const currentDate = new Date();
const monthNames = [
    "01-Jan", "02-Feb", "03-Mar", "04-Apr", "05-May", "06-Jun",
    "07-Jul", "08-Aug", "09-Sep", "10-Oct", "11-Nov", "12-Dec"
];

const Counts: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showQuery, setShowQuery] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const [status, setStatus] = useState<string>('Waiting for updates...');
    const [queue, setQueue] = useState<Record<string, any>>({});
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const queueArray = Object.values(queue); // Convert object to array

    useEffect(() => {
        console.log("Queue updated in ProcessQueue:", queueArray);
    }, [queueArray]);

    const [formData, setFormData] = useState({
        transactionType: '837P',
        year: currentDate.getFullYear().toString(),
        month: monthNames[currentDate.getMonth()],
    });

    // Reference to the SimpleTable component
    const tableRef = useRef<any>(null);

    // WebSocket connection setup
    useEffect(() => {
        const ws = new WebSocket('ws://dhhsedisydvxm:5002');

        ws.onopen = () => console.log('Connected to WebSocket server');
        
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('🔄 Received WebSocket Message:', message);
                if (message.type === 'process'){
                    if (message.status === 'waiting' || message.status === 'update' || message.status === 'completed') {
                        fetchProcessQueueData();
                    }
            
                    setStatus(message.update);
            
                    setQueue(prevQueue => {
                        const processId = message.data?.processId?.toLowerCase(); // Normalize
                    
                        if (!processId) return prevQueue; // Ignore if no processId
                    
                        return {
                            ...prevQueue,
                            [processId]: {
                                ...prevQueue[processId], // Preserve transactionType, month, year
                                status: message.status, 
                                processId, 
                                message: message.message,
                                data: { 
                                    ...(prevQueue[processId]?.data || {}), // Keep existing transaction details
                                    ...message.data // Merge only new data
                                }
                            }
                        };
                    });
                }else if (message.type === 'DBCleanup') {
                    if (message.subtype === 'ProcessQueue' && message.status === 'completed') {
                        fetchProcessQueueData();                        
                    }                    
                }
            } catch (error) {
                console.error('❌ Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => console.error('WebSocket error:', error);
        ws.onclose = () => console.log('WebSocket connection closed');

        setSocket(ws);
        return () => ws.close();
    }, []);

    // Create process function
    const createProcess = async (data: Record<string, any>) => {
        try {
            const response = await fetch(`${backendUrl}/api/TransactionCounts/ProcessQueue/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            console.log('Process created successfully:', data);
        } catch (error) {
            console.error('Error creating process:', error);
        }
    };

    // Start transaction with async handling
    const startTransaction = async () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const processId = uuidv4(); // Generate a new UUID for the process ID
            const requestData = { 
                processId, 
                ...formData, 
                status: 'waiting', 
                position: 0, 
                weight: 1 
            };
    
            await createProcess(requestData);  // Ensure the process is created in the backend
            socket.send(JSON.stringify({ type: 'process', status: 'waiting', data: requestData }));
    
            // **Manually fetch ProcessQueue to ensure state updates**
            setTimeout(fetchProcessQueueData, 500); // Slight delay to ensure backend updates
        } else {
            console.error('WebSocket is not open');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/TransactionCounts/Daily`);
                if (!response.ok) throw new Error('Network response was not ok');
                setData(await response.json());
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchProcessQueueData = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/TransactionCounts/ProcessQueue`);
            if (!response.ok) throw new Error('Failed to fetch queue data');
    
            const updatedData = await response.json();
    
            setQueue(prevQueue => {
                const newQueue: Record<string, any> = {};
    
                updatedData.forEach((process: any) => {
                    const processId = process.data?.processId?.toLowerCase();
                    if (processId) {
                        newQueue[processId] = process;
                    }
                });
    
                console.log('🔄 Refreshed Process Queue:', newQueue);
                return newQueue;
            });
        } catch (error) {
            console.error('Error fetching ProcessQueue:', error);
        }
    };

    useEffect(() => {
        const processQueue = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/TransactionCounts/ProcessQueue`);
                if (!response.ok) throw new Error('Network response was not ok');
                setQueue(await response.json());
            } catch (error) {
                console.error('Error fetching process queue:', error);
            }
        }
        processQueue();
    }   , [showForm, showQuery, showSchedule, ]);

    const toggleForm = () => setShowForm((prev) => !prev);
    const toggleSchedule = () => setShowSchedule((prev) => !prev);
    const toggleQuery = () => setShowQuery((prev) => !prev);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async () => {
        const processId = uuidv4(); // Generate a new UUID for the process ID
        const requestData = { 
            processId, 
            ...formData, 
            status: 'waiting', 
            position: 0, 
            weight: 1 
        };
    
        setQueue(prevQueue => ({
            ...prevQueue,
            [processId]: {
                ...prevQueue[processId], // Preserve existing transaction details
                status: 'waiting', // Ensure only status updates
                processId, // New process ID
                data: { 
                    ...(prevQueue[processId]?.data || {}), // Keep existing transactionType, month, year
                    ...requestData // Merge only necessary updates
                }
            }
        }));
    
        await startTransaction(); // Send to WebSocket & backend
        toggleForm(); // Close modal after submission
    };

    const handleDeleteProcess = (processId: string) => {
        fetchProcessQueueData();
    };

    const handleQueryResults = (queryResults: any) => {
        if (queryResults && queryResults.length > 0) {
            const dynamicColumnDefs = Object.keys(queryResults[0]).map((key) => ({
                headerName: key.replace(/_/g, ' '),
                field: key,
            }));
            setColumnDefs(dynamicColumnDefs);
        }
        setData(queryResults);
    };

    const [columnDefs, setColumnDefs] = useState<any[]>([
        { headerName: 'Folder Type', field: 'Fldr_Type' },
        { headerName: 'Transaction Type', field: 'Trans_Type' },
        { headerName: 'Year', field: 'Year' },
        { headerName: 'Month', field: 'Month' },
        { headerName: 'Day', field: 'Day' },
        { headerName: 'Daily Transaction Count', field: 'Indiv_Trans_Cnt' },
        { headerName: 'TP Count', field: 'Tp_Count' },
        { headerName: 'Transaction Set Counts', field: 'Trans_Set_Cnt' },
    ]);

    // Function to export filtered table data to Excel
    const exportToExcel = () => {
        if (!tableRef.current) {
            console.error('Table reference is not available.');
            return;
        }

        // Get the filtered data from the table
        const filteredData = tableRef.current.getFilteredData(); // Assuming SimpleTable exposes this method

        if (!filteredData || filteredData.length === 0) {
            console.error('No filtered data available to export.');
            return;
        }

        // Reorder the data based on columnDefs
        const reorderedData = filteredData.map((row: any) => {
            const reorderedRow: Record<string, any> = {};
            columnDefs.forEach((col) => {
                reorderedRow[col.headerName] = row[col.field]; // Use headerName as the key for Excel
            });
            return reorderedRow;
        });

        // Create a worksheet from the reordered data
        const worksheet = XLSX.utils.json_to_sheet(reorderedData);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'FilteredTransactionCounts');

        // Generate an Excel file and trigger download
        XLSX.writeFile(workbook, 'FilteredTransactionCounts.xlsx');
    };

    return (
        <div>
            <Paper sx={{ padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <h2>Transaction Counts</h2>
            </Paper>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Button onClick={() => setShowForm(true)} variant="contained">Manual Launch</Button>
                <Button onClick={() => setShowQuery(true)} variant="contained">Query Database</Button>
                <Button onClick={() => setShowSchedule(true)} variant="contained">Configure Schedule</Button>
                <Button onClick={exportToExcel} variant="contained" >Export to Excel</Button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {data && (
                <SimpleTable
                    ref={tableRef} // Attach the table reference
                    columnDefs={columnDefs}
                    rowData={data}
                />
            )}

            <ProcessQueue queue={queue} onDelete={handleDeleteProcess} />

            {/* Dialog Components */}
            <TransactionCounts_ManualLaunch
                showForm={showForm}
                toggleForm={toggleForm}
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleSubmit={handleSubmit}
            />
            <TransactionCounts_QueryDatabaseDialog
                showQuery={showQuery}
                toggleQuery={() => setShowQuery(false)}
                handleQueryResults={handleQueryResults} // Pass the callback
            />
            <TransactionCounts_ConfigureScheduleDialog
                showForm={showSchedule}
                toggleForm={() => setShowSchedule(false)}
                handleSubmit={() => console.log('Schedule submitted')}
            />
        </div>
    );
};

export default Counts;
