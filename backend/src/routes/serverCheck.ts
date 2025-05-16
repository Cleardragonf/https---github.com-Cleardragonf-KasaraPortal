import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import { getSystemStats, formatUptime } from '../utils';
import { services } from '../utils';  // Assuming services are imported from utils.ts

const router = express.Router();

/**
 * @swagger
 * name: ServerCheck
 * /api/server/{serverId}:
 *   get:
 *     summary: Get server status and service information
 *     description: Pings the specified server, checks system stats, and checks the status of configured services.
 *     parameters:
 *       - name: serverId
 *         in: path
 *         required: true
 *         description: The ID or address of the server to check
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Server status and service information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serverId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: "online"
 *                 lastChecked:
 *                   type: string
 *                   format: date-time
 *                 responseTime:
 *                   type: integer
 *                   example: 100
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       startupType:
 *                         type: string
 *                       uptime:
 *                         type: string
 *       500:
 *         description: Failed to ping the server or retrieve service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to ping server"
 */
router.get('/:serverId', (req: Request, res: Response) => {
  const { serverId } = req.params;

  const pingCommand = `ping -n 1 ${serverId}`;

  exec(pingCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      const errorMessage = stderr || error?.message || 'Unknown error';
      return res.status(500).json({ error: `Failed to ping server: ${errorMessage}` });
    }

    const isServerOnline = stdout.includes('TTL=');
    const serviceStatuses: any[] = [];
    const systemStatsPromise = getSystemStats();

    const serviceChecks = Object.keys(services).map((serviceName) => {
      const serviceCommand = `sc qc ${services[serviceName as keyof typeof services]}`;

      return new Promise<void>((resolve) => {
        console.log(`Running service check for: ${serviceName}`);
        exec(serviceCommand, (serviceError, serviceStdout, serviceStderr) => {
          console.log(`Service check result for ${serviceName}: ${serviceStdout}`);
          if (serviceError || serviceStderr) {
            resolve();
            return;
          }

          console.log(`Service Query Output for ${serviceName}:`, serviceStdout);

          const startTypeMatch = serviceStdout.match(/START_TYPE\s+:\s+(\d+)/);
          const startType = startTypeMatch ? startTypeMatch[1] : 'Unknown start type';

          const isDisabled = startType === '4';

          let serviceStatus: string;
          if (isDisabled) {
            serviceStatus = 'Disabled';
          } else {
            const statusCommand = `sc query ${services[serviceName as keyof typeof services]}`;
            exec(statusCommand, (statusError, statusStdout, statusStderr) => {
              if (statusError || statusStderr) {
                serviceStatus = 'Unknown';
              } else {
                serviceStatus = statusStdout.includes('RUNNING') ? 'Running' : 'Stopped';
              }

              // Extract start time from the output
              const startTimeMatch = statusStdout.match(/START_TIME\s+:\s+(\S+ \S+)/);
              const startTimeStr = startTimeMatch ? startTimeMatch[1] : 'Unknown start time';
              console.log(`Start Time for ${serviceName}: ${startTimeStr}`);

              // Try parsing the date
              const startTimeDate = new Date(startTimeStr);
              const uptime = !isNaN(startTimeDate.getTime())
                ? formatUptime(Date.now() - startTimeDate.getTime())
                : 'Unknown uptime'; // Fallback in case of invalid date

              // Push the service status data into the serviceStatuses array
              serviceStatuses.push({
                name: serviceName,
                status: serviceStatus,
                startupType: startType,
                isDisabled,
                uptime,
              });

              resolve();
            });
            return;
          }

          // Fallback code to handle disabled or unknown status cases
          const startTimeMatch = serviceStdout.match(/START_TIME\s+:\s+(\S+ \S+)/);
          const startTimeStr = startTimeMatch ? startTimeMatch[1] : 'Unknown start time';
          const startTimeDate = new Date(startTimeStr);
          const uptime = !isNaN(startTimeDate.getTime())
            ? formatUptime(Date.now() - startTimeDate.getTime())
            : 'Unknown uptime';

          serviceStatuses.push({
            name: serviceName,
            status: serviceStatus,
            startupType: startType,
            isDisabled,
            uptime,
          });

          resolve();
        });
      });
    });

    // Wait for all the service checks and system stats to complete
    Promise.all([systemStatsPromise, ...serviceChecks]).then(([systemStats]) => {
      res.json({
        serverId,
        status: isServerOnline ? 'online' : 'online',
        lastChecked: new Date(),
        responseTime: 100, // Optional: can be calculated from ping result
        services: serviceStatuses,
        systemStats,
      });
    });
  });
});

/**
 * @swagger
 * /api/server/{serverId}/{service}/{status}:
 *   post:
 *     summary: Manage service status
 *     description: Starts, stops, restarts, disables, or enables a specified service on a given server.
 *     parameters:
 *       - name: serverId
 *         in: path
 *         required: true
 *         description: The ID or address of the server to manage
 *         schema:
 *           type: string
 *       - name: service
 *         in: path
 *         required: true
 *         description: The name of the service to manage
 *         schema:
 *           type: string
 *       - name: status
 *         in: path
 *         required: true
 *         description: The action to perform on the service (start, stop, restart, disable, enable)
 *         schema:
 *           type: string
 *           enum:
 *             - start
 *             - stop
 *             - restart
 *             - disable
 *             - enable
 *     responses:
 *       200:
 *         description: Successfully managed the service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Service started successfully."
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Service xyz not found"
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid status. Allowed values are 'start', 'stop', 'restart', 'disable', 'enable'."
 *       500:
 *         description: Failed to manage the service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to start service: Unknown error"
 */
router.post('/:serverId/:service/:status', (req: Request, res: Response): void => {
  const { serverId, service, status } = req.params;

  if (!services[service as keyof typeof services]) {
    res.status(404).json({ error: `Service ${service} not found` });
    return;
  }

  const serviceName = services[service as keyof typeof services];

  const isValidStatus = ['start', 'stop', 'restart', 'disable', 'enable'].includes(status.toLowerCase());
  if (!isValidStatus) {
    res.status(400).json({ error: `Invalid status. Allowed values are 'start', 'stop', 'restart', 'disable', 'enable'.` });
    return;
  }

  const startService = () => {
    exec(`sc start ${serviceName}`, (error, stdout, stderr) => {
      if (error || stderr) {
        const errorMessage = stderr ?? error?.message ?? 'Unknown error';
        return res.status(500).json({ error: `Failed to start service: ${errorMessage}` });
      }
      return res.json({ message: `Service ${service} started successfully.` });
    });
  };

  const stopService = (): void => {
    exec(`sc stop ${serviceName}`, (error, stdout, stderr) => {
      if (error || stderr) {
        const errorMessage = stderr ?? error?.message ?? 'Unknown error';
        return res.status(500).json({ error: `Failed to stop service: ${errorMessage}` });
      }
      return res.json({ message: `Service ${service} stopped successfully.` });
    });
  };

  const restartService = (): void => {
    exec(`sc stop ${serviceName}`, (stopError, stopStdout, stopStderr) => {
      if (stopError || stopStderr) {
        const errorMessage = stopStderr ?? stopError?.message ?? 'Unknown error';
        return res.status(500).json({ error: `Failed to stop service: ${errorMessage}` });
      }

      setTimeout(() => {
        exec(`sc start ${serviceName}`, (startError, startStdout, startStderr) => {
          if (startError || startStderr) {
            const errorMessage = startStderr ?? startError?.message ?? 'Unknown error';
            return res.status(500).json({ error: `Failed to start service: ${errorMessage}` });
          }
          return res.json({ message: `Service ${service} restarted successfully.` });
        });
      }, 2000);
    });
  };

  const disableService = (): void => {
    exec(`sc stop ${serviceName}`, (stopError, stopStdout, stopStderr) => {
      if (stopError || stopStderr) {
        const errorMessage = stopStderr ?? stopError?.message ?? 'Unknown error';
        return res.status(500).json({ error: `Failed to stop service: ${errorMessage}` });
      }

      exec(`sc config ${serviceName} start= disabled`, (configError, configStdout, configStderr) => {
        if (configError || configStderr) {
          const errorMessage = configStderr ?? configError?.message ?? 'Unknown error';
          return res.status(500).json({ error: `Failed to disable service: ${errorMessage}` });
        }
        return res.json({ message: `Service ${service} disabled successfully.` });
      });
    });
  };

  const enableService = (): void => {
    exec(`sc config ${serviceName} start= demand`, (configError, configStdout, configStderr) => {
      if (configError || configStderr) {
        const errorMessage = configStderr ?? configError?.message ?? 'Unknown error';
        return res.status(500).json({ error: `Failed to enable service: ${errorMessage}` });
      }
      return res.json({ message: `Service ${service} enabled successfully.` });
    });
  };

  switch (status.toLowerCase()) {
    case 'start':
      startService();
      break;
    case 'stop':
      stopService();
      break;
    case 'restart':
      restartService();
      break;
    case 'disable':
      disableService();
      break;
    case 'enable':
      enableService();
      break;
    default:
      res.status(400).json({ error: `Invalid status value. Use 'start', 'stop', 'restart', 'disable', or 'enable'.` });
      break;
  }
});

export default router;
