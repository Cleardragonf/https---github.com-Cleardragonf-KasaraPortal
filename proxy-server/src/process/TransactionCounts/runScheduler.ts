import cron from 'node-cron';
import sql from 'mssql';
import { TranslatorPortal } from '../../utils';
import { wss } from '../../proxyserver';

export class SchedulerProcess {
  private static instance: SchedulerProcess;

  private constructor() {}

  public static getInstance(): SchedulerProcess {
    if (!SchedulerProcess.instance) {
      SchedulerProcess.instance = new SchedulerProcess();
    }
    return SchedulerProcess.instance;
  }

  // Function to fetch rows from the TransactionCount_Schedule table
  private async fetchTransactionSchedules(): Promise<any[]> {
    try {
      await sql.connect(TranslatorPortal);
      const currentDayOfMonth = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1; // Months are 0-based, so add 1
      const currentYear = new Date().getFullYear();

      const result = await sql.query(`
        SELECT 
          id, 
          transactionType, 
          description, 
          dayOfMonth, 
          time, 
          createdAt, 
          updatedAt, 
          LastSuccessfulRun 
        FROM TransactionCount_Schedule
        WHERE 
          dayOfMonth <= ${currentDayOfMonth} AND 
          (LastSuccessfulRun IS NULL OR 
          MONTH(LastSuccessfulRun) != ${currentMonth} OR 
          YEAR(LastSuccessfulRun) != ${currentYear})
      `);

      const rows = result.recordset;
      console.log('Fetched transaction schedules:', rows);

      // Notify WebSocket clients about fetched schedules
      const message = {
        type: 'DBFetch',
        subtype: 'TransactionSchedules',
        status: 'success',
        data: rows,
        timestamp: new Date().toISOString(),
      };

      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(message));
        }
      });

      return rows; // Return the fetched rows for further processing
    } catch (err) {
      console.error('Error fetching transaction schedules:', err);
      return [];
    }
  }

  // Function to create a process in the ProcessQueue table
  private async createProcessInQueue(processData: {
    processId: string;
    weight: number;
    transactionType: string;
    year: string;
    month: string;
    status: string;
    server?: string;
    position: number;
  }): Promise<void> {
    const { processId, weight, transactionType, year, month, status, server, position } = processData;

    // Validate inputs against database constraints
    if (!/^[0-3][0-9]-[A-Za-z]{3}$/.test(month)) {
      throw new Error(`Invalid month format: ${month}. Expected format: [0-3][0-9]-[A-Za-z][A-Za-z][A-Za-z]`);
    }
    if (!/^[1-2][0-9]{3}$/.test(year)) {
      throw new Error(`Invalid year format: ${year}. Expected format: [1-2][0-9][0-9][0-9]`);
    }
    if (!['Pending', 'Complete', 'Update', 'Error', 'Start', 'Waiting'].includes(status)) {
      throw new Error(`Invalid status: ${status}. Allowed values: Pending, Complete, Update, Error, Start, Waiting`);
    }
    if (![1, 0, -1].includes(weight)) {
      throw new Error(`Invalid weight: ${weight}. Allowed values: 1, 0, -1`);
    }
    if (position < 0) {
      throw new Error(`Invalid position: ${position}. Must be greater than or equal to 0`);
    }

    try {
      const pool = await sql.connect(TranslatorPortal);

      // Check if the processId already exists
      const existingProcess = await pool.request()
        .input('processID', sql.UniqueIdentifier, processId)
        .query(`
          SELECT COUNT(*) AS count
          FROM dbo.ProcessQueue
          WHERE processId = @processID
        `);

      if (existingProcess.recordset[0].count > 0) {
        console.log(`Process with ID ${processId} already exists in the queue. Skipping insertion.`);
        return; // Skip insertion if the process already exists
      }

      // Insert the new process
      await pool.request()
        .input('processID', sql.UniqueIdentifier, processId)
        .input('weight', sql.Int, -1)
        .input('transactionType', sql.VarChar(30), transactionType)
        .input('year', sql.Char(4), year)
        .input('month', sql.Char(6), month)
        .input('status', sql.VarChar(30), status)
        .input('server', sql.VarChar(30), server || null)
        .input('position', sql.Int, position)
        .query(`
          INSERT INTO dbo.ProcessQueue 
          (processId, weight, transactionType, year, month, status, server, position)
          VALUES (@processID, @weight, @transactionType, @year, @month, @status, @server, @position);
        `);

      console.log(`Process created in queue for transactionType: ${transactionType}`);
    } catch (error) {
      console.error(`Error creating process in queue for processId: ${processId}`, error);
      throw error;
    }
  }

  // Function to process all schedules and create processes in the queue
  private async processSchedules(): Promise<void> {
    const schedules = await this.fetchTransactionSchedules();

    if (schedules.length === 0) {
      console.log('No schedules to process.');
      return;
    }

    for (const schedule of schedules) {
      const { id, transactionType, description, dayOfMonth, time } = schedule;

      console.log(`Processing schedule: ${id} - ${transactionType}`);

      try {
        // Format the month as "DD-MMM" to match sql.Char(6)
        const formattedMonth = `${String(new Date().getDate()).padStart(2, '0')}-${new Date()
          .toLocaleString('default', { month: 'short' })
          .toUpperCase()}`;

        // Create a process in the queue for each schedule
        await this.createProcessInQueue({
          processId: id, // Use the schedule ID as the process ID
          weight: 1, // Assign a default weight or calculate based on your logic
          transactionType,
          year: new Date().getFullYear().toString(),
          month: formattedMonth, // Use the formatted month
          status: 'Waiting',
          server: 'localhost', // Assign a default server or fetch dynamically
          position: 1,
        });

        console.log(`Successfully created process for schedule ID: ${id}`);
      } catch (error) {
        console.error(`Error creating process for schedule ID: ${id}`, error);
      }
    }
  }

  // Schedule the task to run at the specified interval
  public scheduleTask(): void {
    cron.schedule('* * * * *', async () => {
      console.log('Running scheduled task...');
      await this.processSchedules();
      console.log('Scheduled task completed.');
    });
    console.log('Scheduled task to process transaction schedules every minute.');
  }
}

// Initialize and schedule the task
const process = SchedulerProcess.getInstance();
process.scheduleTask();
