import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import serverCheckRoute from './routes/serverCheck';
import dailyCountsRoute from './routes/dailyCounts';
import { TransactionCountsRoute } from './routes/TransactionCountsRoute';
import http from 'http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';
import { ScheduledEvent } from './utils/ScheduledEvent';

const app = express();
const server = http.createServer(app); // Create an HTTP server
const wss = new WebSocketServer({ server }); // Attach WebSocket Server

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const apiBaseUrl = process.env.API_BASE_URL; // ✅ this now works with dotenv
const webSocketServer = process.env.WEB_SOCKET_SERVER; // ✅ this now works with dotenv

// Backend WebSocket client that connects to the proxy WebSocket server
const webSocketServerUrl = webSocketServer
  ? `ws://${webSocketServer}:5002`
  : 'ws://localhost:5002';

const wsClient = new WebSocket(webSocketServerUrl);



app.use(express.json());

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for the backend',
        },
    },
    apis: ['./src/routes/serverCheck.ts', './src/routes/dailyCounts.ts', './src/routes/TransactionCountsRoute.ts'],  // Corrected to .ts paths
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Use the routes
app.use('/api/server_Check', serverCheckRoute);
app.use('/api/counts/daily', dailyCountsRoute);
app.use('/api/TransactionCounts/Start', TransactionCountsRoute(wss));

const PORT = process.env.PORT || 9277;

const activeProcesses: { [key: string]: { ws: WebSocket; status: string } } = {};

wss.on('connection', (ws) => {
    console.log('Client connected to Backend WebSocket');

    ws.on('message', (message) => {
        const { type, data } = JSON.parse(message.toString());

        if (type === 'process') {
            const processId = `proc-${Date.now()}`;
            activeProcesses[processId] = { ws, status: 'Processing started' };

            ws.send(JSON.stringify({ processId, update: 'Processing started' }));

            // Simulate process execution with live updates
            setTimeout(() => {
                activeProcesses[processId].status = 'Processing 50% done';
                ws.send(JSON.stringify({ processId, update: 'Processing 50% done' }));
            }, 3000);

            setTimeout(() => {
                activeProcesses[processId].status = 'Processing completed';
                ws.send(JSON.stringify({ processId, update: 'Processing completed' }));

                // Cleanup
                delete activeProcesses[processId];
                ws.close();
            }, 6000);
        }
    });

    ws.on('close', () => console.log('Client disconnected from Backend WebSocket'));
});

const scheduledEvent = new ScheduledEvent(wss);
scheduledEvent.start(new Set([wsClient]));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Base URL: ${apiBaseUrl}`); // Log the API base URL
});
