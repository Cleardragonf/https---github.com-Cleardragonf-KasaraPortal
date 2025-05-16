import { WebSocket, WebSocketServer } from 'ws';
import cron from 'node-cron';
import * as os from 'os';

export class ScheduledEvent {
    private wss: WebSocketServer;

    constructor(wss: WebSocketServer) {
        this.wss = wss;
    }

    start(activeClients: Set<WebSocket>) {
        cron.schedule('*/5 * * * * *', () => {
            console.log('Scheduled event triggered');

            const processId = `proc-${Date.now()}`;
            const networkInterfaces = os.networkInterfaces();
            const server = Object.values(networkInterfaces)
                .flat()
                .find((iface) => (iface as os.NetworkInterfaceInfo)?.family === 'IPv4' && !(iface as os.NetworkInterfaceInfo).internal)?.address || 'localhost';
            const transactionType = 'TransactionType1'; // Replace with dynamic transaction type if needed

            const startMessage = {
                type: 'ServerStatus',
                server: `${server}`,
                data: {
                    processId,
                    server,
                    transactionType,
                    month: '03-Mar',  // Adjust dynamically as needed
                    year: '2025'     // Adjust dynamically as needed
                }
            };

            activeClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(startMessage));
                }
            });
        });
    }
}
