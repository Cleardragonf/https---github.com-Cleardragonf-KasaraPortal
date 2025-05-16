import cron from 'node-cron';
import fetch from 'node-fetch';
import { getAvailableServer, serverStatus, serverMapping } from '../../proxyserver'; // Adjust the path if needed
import sql from 'mssql';
import { TranslatorPortal } from '../../utils'; // Adjust path if necessary

// Function to update the process status and LastSuccessfulRun
const updateProcessStatus = async (processId: string, status: string, lastSuccessfulRun: string) => {
    console.log(`Updating process ${processId} with status '${status}' and LastSuccessfulRun '${lastSuccessfulRun}'...`);
    try {
        // Fix: Ensure 'server' property is used instead of 'host'
        const fixedConfig = { ...TranslatorPortal, server: TranslatorPortal.host, host: undefined };
        const pool = await sql.connect(fixedConfig);
        await pool.request()
            .input('processID', sql.UniqueIdentifier, processId)
            .input('status', sql.VarChar(30), status)
            .input('lastSuccessfulRun', sql.DateTime, lastSuccessfulRun)
            .query(`
                UPDATE ProcessQueue
                SET Status = @status
                WHERE processID = @processID
            `);
        console.log(`Process ${processId} updated successfully.`);
    } catch (error) {
        console.error(`Error updating process ${processId}:`, error);
    }
};

// Function to check and process waiting transactions
export const checkAndStartWaitingProcess = async () => {
    console.log('checkAndStartWaitingProcess: Starting process...');
    try {
        // Connect to SQL Server and fetch waiting processes
        const fixedConfig = { ...TranslatorPortal, server: TranslatorPortal.host, host: undefined };
        const pool = await sql.connect(fixedConfig);
        const result = await pool
            .request()
            .query(`SELECT TOP 1 * FROM ProcessQueue WHERE status = 'waiting' ORDER BY position ASC, weight DESC`);
        
        if (result.recordset.length === 0) {
            console.log('checkAndStartWaitingProcess: No waiting processes found.');
            return;
        }

        const process = result.recordset[0];
        const { processID, transactionType, year, month } = process;
        console.log('checkAndStartWaitingProcess: Found waiting process:', process);

        // Find an available server
        const availableServer = getAvailableServer();
        if (!availableServer) {
            console.log('checkAndStartWaitingProcess: No available servers. Skipping process execution.');
            return;
        }

        // Mark the server as busy
        serverStatus[availableServer] = true;

        // Build the API request URL
        const serverUrl = `${serverMapping[availableServer]}/api/TransactionCounts/Start/${transactionType}/${year}/${month}/${processID}`;
        
        // Call the API to start processing
        try {
            console.log(`checkAndStartWaitingProcess: Triggering process ${processID} on server ${availableServer}...`);
            const response = await fetch(serverUrl, { method: 'GET' });
            const data = await response.json();

            console.log(`checkAndStartWaitingProcess: Process ${processID} started on ${availableServer}. Response:`, data);

            // Update database to mark the process as "in-progress"
            // await pool.request()
            //     .input('processID', sql.UniqueIdentifier, processID)
            //     .query(`UPDATE ProcessQueue SET Status = 'pending', Server = '${availableServer}' WHERE processID = @processID`);

            // console.log(`checkAndStartWaitingProcess: Process ${processID} marked as 'pending' on server ${availableServer}.`);

            // Example usage of the function
            await updateProcessStatus(processID, 'complete', new Date().toISOString());
            serverStatus[availableServer] = false; // Mark server as available again
        } catch (error) {
            console.error(`checkAndStartWaitingProcess: Error starting process ${processID}:`, error);
            serverStatus[availableServer] = false; // Mark server as available again
        }
    } catch (error) {
        console.error('checkAndStartWaitingProcess: Error checking process queue:', error);
    }
};

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
    console.log("Checking process queue...");
    await checkAndStartWaitingProcess();
});
