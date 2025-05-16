import cron from 'node-cron';
import { TranslatorPortal } from '../../utils';
import { Client } from 'pg';
import { wss } from '../../proxyserver';

export class ProcessCleaner {
  private static instance: ProcessCleaner;

  private constructor() {}

  public static getInstance(): ProcessCleaner {
    if (!ProcessCleaner.instance) {
      ProcessCleaner.instance = new ProcessCleaner();
    }
    return ProcessCleaner.instance;
  }

  // Function to remove completed processes and notify clients
  private async removeCompletedProcesses(): Promise<void> {
    try {
      const client = new Client(TranslatorPortal);
      await client.connect();

      const result = await client.query('EXEC RemoveCompletedProcesses');

      console.log('Completed processes removed');

      // Notify WebSocket clients about removed processes
      const message = {
        type: 'DBCleanup',
        subtype: 'ProcessQueue',
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(message));
        }
      });

      await client.end();
    } catch (err) {
      console.error('Error removing completed processes:', err);
    }
  }

  // Schedule the task to run at the specified interval
  public scheduleTask(): void {
    cron.schedule('* * * * *', async () => {
      await this.removeCompletedProcesses();
    });
    console.log('Scheduled task to remove completed processes every hour.');
  }
}

// Initialize and schedule the task
const processCleaner = ProcessCleaner.getInstance();
processCleaner.scheduleTask();
