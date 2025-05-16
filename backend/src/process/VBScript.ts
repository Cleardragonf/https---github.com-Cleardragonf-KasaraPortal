import { exec } from 'child_process';
import { WebSocket } from 'ws';

export class VBScript {
  static run(scriptPath: string, processId: string, server: string, transactionType: string, activeClients: Set<WebSocket>, year: string, month: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Start the script execution with cscript
      const process = exec(`C:\\Windows\\System32\\cscript.exe //nologo ${scriptPath} ${year} ${month}`);
      
      if (!process) {
        reject('Failed to start process');
        return;
      }

      // Log the command being executed for debugging purposes
      console.log(`Executing script: cscript //nologo ${scriptPath}`);

      // Broadcast initial message to all active WebSocket clients
      const startMessage = {
        type: 'process',
        status: 'update',
        message: `Transaction processing started for ${transactionType} ${server}`,
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

      // Handling stdout and stderr together for errors and normal output
      let processFailed = false;

      process.stdout?.on('data', (data) => {
        if (processFailed) return;  // Don't process stdout if there's already an error

        console.log(`VBScript stdout: ${data}`);

        // Explicitly check for error message in stdout
        if (data.includes('Can not find script file')) {
          processFailed = true;  // Flag that the process has failed
          console.error(`Script file not found: ${scriptPath}`);

          const errorMessage = {
            type: 'process',
            status: 'error',  // Indicates an error
            message: `Error on ${server}: ${data.trim()}`,
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
              client.send(JSON.stringify(errorMessage));
            }
          });

          reject(`Error executing script: ${data.trim()}`);
          return;  // Exit early to stop further execution
        }

        const outputMessage = {
          type: 'process',
          status: 'update',  // Update status if the script is still running
          message: data.trim(),
          data: {
            processId,
            server,
            transactionType,
            month: month,  // Adjust dynamically as needed
            year: year     // Adjust dynamically as needed
          }
        };

        activeClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(outputMessage));
          }
        });
      });

      // Capturing stderr output for errors
      process.stderr?.on('data', (data) => {
        if (processFailed) return;  // Don't process stderr if there's already an error

        processFailed = true; // Flag that the process has failed

        console.error(`VBScript stderr: ${data}`);  // Log stderr to help debug

        const errorMessage = {
          type: 'process',
          status: 'error',  // Indicates an error
          message: `Error on ${server}: ${data.trim()}`,
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
            client.send(JSON.stringify(errorMessage));
          }
        });

        // Reject the promise if there's an error
        reject(`Error executing script: ${data.trim()}`);
      });

      // When the process finishes successfully
      process.on('close', (code) => {
        if (processFailed) return; // If an error has occurred, don't send success message

        const closeMessage = {
          type: 'process',
          status: 'complete',
          message: `Script finished with exit code ${code}`,
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
            client.send(JSON.stringify(closeMessage));
          }
        });
        resolve();
      });

      // Catching any execution errors in the script
      process.on('error', (error) => {
        if (processFailed) return;

        processFailed = true;
        console.error(`VBScript Execution Error: ${error.message}`);

        const errorMessage = {
          type: 'process',
          status: 'error',
          message: `Error executing script: ${error.message}`,
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
            client.send(JSON.stringify(errorMessage));
          }
        });

        reject(error);
      });
    });
  }
}
