import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dailyCountRouter from './routes/TransactionCounts/dailyCounts';
import TN_Schedule from './routes/TransactionCounts/Schedule';
import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch'; // Ensure fetch is available
import { v4 as uuid4 } from 'uuid'; // UUID for unique process IDs
import { stat } from 'fs';
import ProcessQueue from './routes/TransactionCounts/ProcessQueue';
import { ProcessCleaner } from './process/DBProccedures/ProcessCleaner'; // Adjust the path if necessary
import { checkAndStartWaitingProcess } from './process/TransactionCounts/ProcessQueueProcess';
import { SchedulerProcess } from './process/TransactionCounts/runScheduler';
import DatabaseQueryRouter from './routes/DatabaseQueryRouter';
import { initializeScheduledTask } from './scheduledTask';
import CredentialsRouter from './routes/CredentialsRouter'; // Adjust the path if necessary
import { ConnectionPool, pool as mssqlPool } from 'mssql'; // Assuming you're using mssql for database connection
import { TranslatorPortal } from './utils';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'; // Import CORS

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const proxyServerUrl = process.env.PROXY_SERVER; // ✅ this now works with dotenv

const pool = new ConnectionPool(TranslatorPortal);

const app = express();
const port = 5001;

// Middleware
app.use(express.json());

// Enable CORS for any origin
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// WebSocket Server
const wss = new WebSocketServer({ port: 5002 });
const clients: Set<WebSocket> = new Set();

const processCleaner = ProcessCleaner.getInstance();
processCleaner.scheduleTask();

checkAndStartWaitingProcess();

const processTask = SchedulerProcess.getInstance();
processTask.scheduleTask();

// Initialize the scheduled task
initializeScheduledTask();

// Initialize the scheduled task
initializeScheduledTask();

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress; // Get the IP address of the connecting client
    console.log(`Frontend connected via WebSocket from IP: ${clientIp}`);
    clients.add(ws);


    ws.on('message', async (message: Buffer) => {
        // Log raw message and convert buffer to string
        // console.log('Raw message received from frontend:', message);
        
        // Convert the buffer to string
        const messageString = message.toString();

        // Parse the message as JSON
        try {
            const parsedMessage = JSON.parse(messageString);

            // Check if the message is a "start transaction" message
            if (parsedMessage.type === 'process' && parsedMessage.data && parsedMessage.status === 'starting') {
                const { transactionType, year, month, processId } = parsedMessage.data;
                console.log(`Start transaction for: ${transactionType}, ${year}-${month}, ID: ${processId}`);

                // Trigger the API call to start the transaction
                const availableServer = getAvailableServer();

                if (!availableServer) {
                    ws.send(JSON.stringify({ type: 'error', message: 'No available servers' }));
                    return;
                }

                serverStatus[availableServer] = true; // Mark server as busy
                const serverUrl = `${serverMapping[availableServer]}/api/TransactionCounts/Start/${transactionType}/${year}/${month}/${processId}`;

                try {
                    const response = await fetch(serverUrl, { method: 'GET' });

                    // Log the full response
                    const data = await response.json();
                    console.log('Backend response data:', data);

                    const broadcastData = {
                      processId,
                      server: availableServer,
                      month,
                      year,
                      transactionType,
                    };

                    // If the response is successful, notify the WebSocket
                    // broadcast({
                    //     type: 'process',
                    //     status: 'Update',
                    //     message: `Server Found: ${availableServer}`,
                    //     data: broadcastData
                    // });
                } catch (error) {
                    console.error("Error while starting transaction:", error);
                
                    serverStatus[availableServer] = false; // Mark as available on failure
                    ws.send(JSON.stringify({ type: 'error', message: 'Error starting transaction' }));
                }
            }else if(parsedMessage.type === 'process' && parsedMessage.data && parsedMessage.status === 'update') {
                const { processId, server } = parsedMessage.data;
                console.log(`Received process update for process ID: ${processId} on server: ${server}`);

                // Notify WebSocket clients
                broadcast({ type: 'process', status: 'Update', message: `${parsedMessage.message}`, data: parsedMessage.data });
            }else if(parsedMessage.type === 'process' && parsedMessage.data && parsedMessage.status === 'error') {
            
                console.log(`Received process error for process ID: ${parsedMessage.data.processId} on server: ${parsedMessage.data.server}`);
                broadcast({ type: 'process', status: 'error', message: `${parsedMessage.message}`, data: parsedMessage.data });
                const { processId, server } = parsedMessage.data;

                if(serverStatus[server] !== undefined) {
                    serverStatus[server] = false;
                    console.log(`Server ${server} is now available.`);
                }

                delete processMapping[processId];
                
            } else if (parsedMessage.type === 'process' && parsedMessage.data && parsedMessage.status === 'complete') {
                const { processId, server, transactionType, year, month } = parsedMessage.data;
                
                // Mark the server as available again
                if (serverStatus[server] !== undefined) {
                    serverStatus[server] = false;
                    console.log(`Server ${server} is now available.`);
                }
            
                // Remove process from mapping if stored
                delete processMapping[processId];
            
                // Notify WebSocket clients about the process completion first
                broadcast({
                    type: 'process',
                    status: 'complete',
                    message: `${parsedMessage.message}`,
                    data: parsedMessage.data
                });
                
                // Define the URL to update the last successful run in the Schedule
                const updateLastRunURL = `http://${proxyServerUrl}:5001/api/TransactionCounts/Schedule/updateLastRun/${processId}`;
                            
                // Define specific data to send with the update
                const processUpdateData = {
                    year: year,
                    month: month,
                    processId,
                    transactionType: transactionType,
                    status: 'complete',  // Indicating that the process is complete
                    server,              // The server where the process was completed
                    lastSuccessfulRun: new Date().toISOString(),  // Ensure this field is correctly sent to the backend
                };
            
                // Make the API call in a non-blocking manner
                setImmediate(async () => {
                    try {
                        const response = await fetch(updateLastRunURL, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(processUpdateData)
                        });
            
                        // Log the status and raw response if it's not OK
                        if (!response.ok) {
                            console.error(`API error: ${response.status} - ${response.statusText}`);
                            const text = await response.text(); // Log the raw response if it's not OK
                            console.error('Raw response body:', text);
                            return;
                        }
            
                        const data = await response.json();
                        console.log('Schedule update response for Completion:', data);

                        // Log the LastSuccessfulRun field to verify it is being updated
                        if (data && typeof data === 'object') {
                            const lastSuccessfulRun = (data as { LastSuccessfulRun?: string }).LastSuccessfulRun;
                            if (lastSuccessfulRun) {
                                console.log('LastSuccessfulRun updated to:', lastSuccessfulRun);
                            } else {
                                console.warn('LastSuccessfulRun field is missing or not updated. Ensure the backend includes it in the response.');
                            }
                        } else {
                            console.warn('Unexpected response format. Check backend implementation.');
                        }
            
                        // After 3 minutes, trigger the delete operation for this process
                        setTimeout(async () => {
                            try {
                                const deleteProcessURL = `http://${proxyServerUrl}:5001/api/TransactionCounts/ProcessQueue/delete/${processId}`;
                                const deleteResponse = await fetch(deleteProcessURL, {
                                    method: 'DELETE'
                                });
            
                                // Handle response
                                if (!deleteResponse.ok) {
                                    console.error(`API error: ${deleteResponse.status} - ${deleteResponse.statusText}`);
                                    const text = await deleteResponse.text();
                                    console.error('Raw response body:', text);
                                } else {
                                    console.log(`Process ${processId} deleted successfully after 3 minutes.`);
                                }
            
                            } catch (error) {
                                console.error("Error while deleting process:", error);
                            }
                        }, 180000); // 3 minutes = 180000 milliseconds
                    } catch (error) {
                        console.error("Error while updating schedule:", error);
                    }
                });            
            } else if (parsedMessage.type === 'ServerStatus' && parsedMessage.data) {
                const { processId, server, transactionType, year, month } = parsedMessage.data;
                console.log("HITTING IT");
                // Notify WebSocket clients about the process completion first
                broadcast({
                    type: 'ServerStatus',
                    server: `${parsedMessage.server}`,
                    data: parsedMessage.data
                });        
            }

            
            else {
                // Handle any other message types that don't match the above condition
                console.log('Received an unrecognized message:', parsedMessage);
                ws.send(JSON.stringify({ type: 'error', message: 'Unrecognized message type or missing data' }));
            }
            
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });


    ws.on('close', () => {
        console.log('Frontend WebSocket disconnected');
        clients.delete(ws);
    });
});

// Function to broadcast messages to WebSocket clients
const broadcast = (message: any) => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

// Server Mappings
interface ServerMapping {
    [key: string]: string;
}

export const serverMapping: ServerMapping = {
    localhost: 'http://localhost:9277',
    DHHSEDIDevProc: 'http://DHHSEDIDevProc:9277',
    DHHSEDIDevRte: 'http://DHHSEDIDevRte:9277',
    DHSEDIDevOR: 'http://DHSEDIDevOR:9277',
};

// Server Availability Tracking
export const serverStatus: { [key: string]: boolean } = {
    localhost: false,
    DHHSEDIDevProc: true,
    DHHSEDIDevRte: true,
    DHSEDIDevOR: true,
};

// Find Available Server
export const getAvailableServer = (): string | null => {
    for (const [server, isBusy] of Object.entries(serverStatus)) {
        if (!isBusy) return server;
    }
    return null;
};

// Get Backend Server URL
const getServerUrl = (serverName: string): string | undefined => {
    return serverMapping[serverName];
};

// Dynamic Routing
app.use('/api/server_Check/:serverName', (req: Request, res: Response, next: NextFunction) => {
    let { serverName } = req.params;
    console.log(`Received request for server: ${serverName}`);

    serverName = serverName.replace(/^\/+|\/+$/g, ''); // Clean input
    console.log(`Cleaned server name: ${serverName}`);

    const serverUrl = getServerUrl(serverName);
    if (serverUrl) {
        console.log(`Proxying to: ${serverUrl}/api/server_Check/${serverName}`);

        createProxyMiddleware({
            target: `${serverUrl}/api/server_Check/${serverName}`,
            changeOrigin: true,
            onError(err: Error, _req: Request, res: Response) {
                console.error(`Error connecting to ${serverUrl}:`, err);
                res.status(500).json({ message: 'Error connecting to backend', error: err.message });
            },
        } as any)(req, res, next);
    } else {
        res.status(404).json({ message: 'Server not found' });
    }
});

// Start Transaction on an Available Backend
interface StartTransactionResponse {
  processId: string;
  [key: string]: any; // Other properties if needed
}

const processMapping: { [key: string]: string } = {}; // Store process IDs

app.get('/api/TransactionCounts/Start/:transactionType/:year/:month', async (req: Request, res: Response): Promise<void> => {
  const { transactionType, year, month } = req.params;
  const availableServer = getAvailableServer();

  if (!availableServer) {
      res.status(503).json({ message: 'No available servers. Try again later.' });
      return;
  }

  serverStatus[availableServer] = true; // Mark as busy
  const serverUrl = `${serverMapping[availableServer]}/api/TransactionCounts/Start/${transactionType}/${year}/${month}`;
  const processId = uuid4(); // Generate a unique UUID for the transaction

  // Store the process ID and server in the processMapping
  processMapping[processId] = availableServer;

  try {
      const response = await fetch(serverUrl, { method: 'GET' });

      // Type assertion for response data
      const data = await response.json() as StartTransactionResponse;

      // Notify WebSocket clients
      broadcast({ type: 'process', status: 'Update', server: availableServer, transactionType, year, month, processId });

      res.json({ message: `Process '${transactionType}' for ${year}-${month} started on ${availableServer}`, processId, data });
  } catch (error) {
      serverStatus[availableServer] = false; // Reset status on failure
      res.status(500).json({ message: 'Error starting process', error });
  }
});

// Backend Reports Process Completion
app.post('/api/reportCompletion/:serverName/:processId', (req: Request, res: Response) => {
    const { serverName, processId } = req.params;

    if (serverStatus[serverName] !== undefined) {
        // Check if the processId exists in the processMapping
        const serverForProcess = processMapping[processId];
        if (!serverForProcess || serverForProcess !== serverName) {
            res.status(400).json({ message: 'Invalid process ID or mismatched server' });
        }

        // Mark the server as available now
        serverStatus[serverName] = false;

        const broadcastData = {
            processId,
        }

        // Notify WebSocket clients of process completion
        broadcast({ type: 'process', status: 'complete', server: serverName, data: broadcastData });

        res.json({ message: `Process with ID '${processId}' completed on ${serverName}. Server is now available.` });
    } else {
        res.status(400).json({ message: 'Invalid server name' });
    }
});

// Retained Your Dynamic Routing
app.use('/api/server_Check/:serverName/:service/:status', (req: Request, res: Response, next: NextFunction) => {
    let { serverName, service, status } = req.params;
    console.log(`Received request for server: ${serverName}, service: ${service}, status: ${status}`);

    serverName = serverName.replace(/^\/+|\/+$/g, '');
    console.log(`Cleaned server name: ${serverName}`);

    const serverUrl = getServerUrl(serverName);
    if (serverUrl) {
        const fullUrl = `${serverUrl}/api/${serverName}/${service}/${status}`;
        console.log(`Proxying to: ${fullUrl}`);

        createProxyMiddleware({
            target: fullUrl,
            changeOrigin: true,
            pathRewrite: { '^/api/': '/' },
            onError(err: Error, _req: Request, res: Response) {
                console.error(`Error connecting to ${serverUrl}:`, err);
                res.status(500).json({ message: 'Error connecting to the backend', error: err.message });
            },
        } as any)(req, res, next);
    } else {
        res.status(404).json({ message: 'Server not found' });
    }
});

// Mounting Your Original Routers
app.use('/api/TransactionCounts/Daily', dailyCountRouter);
app.use('/api/TransactionCounts/Schedule', TN_Schedule);
app.use('/api/TransactionCounts/ProcessQueue', ProcessQueue);
app.use('/api/Database/Custom', DatabaseQueryRouter);
app.use('/api/auth', CredentialsRouter);

// Confirm WebSocket is Running
app.get('/ws/status', (req, res) => {
    res.json({ message: 'WebSocket running on ws://localhost:5002' });
});

// Start Proxy Server
app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
    console.log(`WebSocket server running on ws://localhost:5002`);
    console.log('Proxy server initialized and scheduled task started.');
});

export {wss};