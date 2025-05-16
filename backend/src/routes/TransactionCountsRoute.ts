import express, { Request, Response, Router, NextFunction } from 'express';
import { VBScript } from '../process/VBScript';
import WebSocket, { Server } from 'ws';
import path from 'path'; // Import the 'path' module to handle file paths
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import os from 'os'; // Import os to get the server's hostname (DNS name)

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const webSocketServer = process.env.WEB_SOCKET_SERVER; // ✅ this now works with dotenv


const router = Router();
let isProcessing = false;

// Backend WebSocket client that connects to the proxy WebSocket server
const webSocketServerUrl = webSocketServer
  ? `ws://${webSocketServer}:5002`
  : 'ws://localhost:5002';

const wsClient = new WebSocket(webSocketServerUrl);


wsClient.on('open', () => {
    console.log('Connected to proxy WebSocket server');
});

wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
});

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: API to process and manage transactions
 */

/**
 * @swagger
 * /transaction-counts/{transactionType}/{year}/{month}/{processId}:
 *   
 *   get:
 *     summary: Get transaction count for a specific transaction type and time period
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: transactionType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of the transaction (e.g., "sale", "refund")
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: The year of the transaction
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: The month of the transaction
 *       - in: path
 *         name: processId
 *         required: true
 *         schema:
 *           type: string
 *         description: The process ID of the transaction request
 *     responses:
 *       200:
 *         description: Transaction count processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transaction processing started for sale 2025-03"
 *                 processId:
 *                   type: string
 *                   example: "12345"
 *       503:
 *         description: Service unavailable because server is processing another request
 *       500:
 *         description: Internal server error
 */
export function TransactionCountsRoute(wss: Server): Router {
    router.get('/:transactionType/:year/:month/:processId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { transactionType, year, month, processId } = req.params;
        const server = os.hostname();  // Get the current server's hostname (DNS name)
        console.log(`Received transaction request for ${transactionType}, ${year}-${month}, processId: ${processId}, server: ${server}`);

        try {
            if (isProcessing) {
                console.log('Server is busy, rejecting request');
                res.status(503).json({ message: 'Server is already processing a request.' });
                return;
            }

            isProcessing = true;
            console.log(`Transaction processing started for ${transactionType} ${year}-${month}`);

            const scriptPath = path.join(__dirname, '..', 'scripts', `${transactionType}.vbs`);

            // Find an active WebSocket client with a retry mechanism
            async function getActiveWebSocket(wss: Server, retries = 5, delay = 1000): Promise<WebSocket | null> {
                for (let i = 0; i < retries; i++) {
                    const wsClient = [...wss.clients].find(client => client.readyState === WebSocket.OPEN);
                    if (wsClient) return wsClient;
                    console.log(`Retrying WebSocket connection... (${i + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
                }
                return null;
            }

            try {
                // Pass the required arguments to the VBScript.run method
                await VBScript.run(scriptPath, processId, server, transactionType, new Set([wsClient]), year, month);
            } catch (error) {
                console.error('VBScript execution error:', error);

                // Send error message if script execution fails
                if (wsClient.readyState === WebSocket.OPEN) {
                    const errorMessage = {
                        processId,
                        error: 'Script execution failed',
                        details: (error as Error).message,
                        server,
                    };
                    wsClient.send(JSON.stringify(errorMessage));  // Send error to the frontend
                }
            }

            isProcessing = false;
            res.json({ message: `Transaction processing started for ${transactionType} ${year}-${month}`, processId });

        } catch (error) {
            console.error('Error while processing transaction:', error);
            isProcessing = false;
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    return router;
}
