import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cron from 'node-cron'; // Replace node-schedule with node-cron
import * as unzipper from 'unzipper';
import winston from 'winston';

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'scheduledTask.log' }),
    ],
});

// Environment variables for paths
const SHARED_FILE_PATH: string = '\\\\dhhsfs1.hhss.local\\epm$\\_TranslatorTeam\\TranslatorPortal\\versions.json';
const PROXYSERVER_DOWNLOAD_URL: string = '\\\\dhhsfs1.hhss.local\\epm$\\_TranslatorTeam\\TranslatorPortal\\proxy-server\\proxyserver.zip';
const FRONTEND_DOWNLOAD_URL: string = '\\\\dhhsfs1.hhss.local\\epm$\\_TranslatorTeam\\TranslatorPortal\\frontend\\frontend.zip';
const FRONTEND_DIR: string = path.join('C:\\TranslatorPortal\\nginx-1.27.4\\html');
const PROXYSERVER_DIR: string = path.join(__dirname);

// Type definitions
interface Versions {
    proxyserver: { version: string; updateUrl: string } | null;
    frontend: { version: string; updateUrl: string } | null;
    backend: { version: string; updateUrl: string } | null;
}

let currentVersions: Versions = {
    proxyserver: null,
    frontend: null,
    backend: null,
};

// Initialize current versions
const initializeCurrentVersions = (): void => {
    if (fs.existsSync(SHARED_FILE_PATH)) {
        const fileContent = fs.readFileSync(SHARED_FILE_PATH, 'utf-8');
        const versions: Partial<Versions> = JSON.parse(fileContent);
        if (isValidVersionFile(versions)) {
            currentVersions.proxyserver = versions.proxyserver || null;
            currentVersions.frontend = versions.frontend || null;
            currentVersions.backend = versions.backend || null;
        } else {
            logger.error('Invalid version file format during initialization.');
        }
    } else {
        logger.warn('Shared file not found during initialization. Using default versions.');
    }
};

// Validate JSON structure
const isValidVersionFile = (data: any): data is Versions => {
    if (!data || typeof data !== 'object') {
        logger.error('Version file is not a valid object.');
        return false;
    }
    const isValidComponent = (component: any) =>
        component &&
        typeof component.version === 'string' &&
        typeof component.updateUrl === 'string';

    if (!isValidComponent(data.proxyserver)) {
        logger.error('Invalid or missing "proxyserver" field in version file.');
        return false;
    }
    if (!isValidComponent(data.frontend)) {
        logger.error('Invalid or missing "frontend" field in version file.');
        return false;
    }
    if (!isValidComponent(data.backend)) {
        logger.error('Invalid or missing "backend" field in version file.');
        return false;
    }
    return true;
};

// Check for updates
const checkForUpdates = (): void => {
    if (!fs.existsSync(SHARED_FILE_PATH)) {
        console.log('Shared file not found:', SHARED_FILE_PATH);
        logger.error('Shared file not found:', SHARED_FILE_PATH);
        return;
    }

    const fileContent = fs.readFileSync(SHARED_FILE_PATH, 'utf-8');
    const newVersions: Partial<Versions> = JSON.parse(fileContent);

    if (!isValidVersionFile(newVersions)) {
        logger.error('Invalid version file format.');
        return;
    }

    if (newVersions.proxyserver?.version !== currentVersions.proxyserver?.version) {
        handleProxyServerUpdate(newVersions.proxyserver!);
    }

    if (newVersions.frontend?.version !== currentVersions.frontend?.version) {
        logger.info('Frontend update detected. Downloading...');
        if (newVersions.frontend) {
            downloadWithRetry(newVersions.frontend.updateUrl, FRONTEND_DIR, 'frontend.zip', newVersions.frontend.version);
        }
        currentVersions.frontend = newVersions.frontend;
    }

    if (newVersions.backend?.version !== currentVersions.backend?.version) {
        logger.info('Backend update detected. Please handle backend updates manually.');
        currentVersions.backend = newVersions.backend;
    }
};

// Handle proxy server updates
const handleProxyServerUpdate = (newVersion: { version: string; updateUrl: string }): void => {
    logger.info('Proxy server update detected. Downloading...');
    downloadWithRetry(newVersion.updateUrl, PROXYSERVER_DIR, 'proxyserver.zip', newVersion.version);
    currentVersions.proxyserver = newVersion;
};

// Verify update
const verifyUpdate = (expectedVersion: string, targetDir: string): boolean => {
    try {
        const packageJsonPath = path.join(targetDir, 'package.json'); // Assume package.json exists in the extracted files
        if (!fs.existsSync(packageJsonPath)) {
            logger.error(`package.json not found in ${targetDir}`);
            return false;
        }

        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        if (packageJson.version === expectedVersion) {
            logger.info(`Update verification successful. Version: ${packageJson.version}`);
            return true;
        } else {
            logger.info(`Version mismatch detected. Expected: ${expectedVersion}, Found: ${packageJson.version}`);
            updatePackageVersion(expectedVersion);
            restartApplication();
            return true; // Consider this a successful update
        }
    } catch (error) {
        logger.error('Error verifying update:', error);
        return false;
    }
};

const updatePackageVersion = (newVersion: string): void => {
    try {
        const packageJsonPath = path.join(__dirname, '../package.json');
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        packageJson.version = newVersion; // Update the version
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
        logger.info(`Updated package.json version to ${newVersion}`);
    } catch (error) {
        logger.error('Error updating package.json version:', error);
    }
};

const restartApplication = (): void => {
    try {
        logger.info('Restarting application...');
        process.exit(0); // Exit the process to allow a process manager (e.g., PM2, systemd) to restart the app
    } catch (error) {
        logger.error('Error restarting application:', error);
    }
};

// Download with retry logic
const downloadWithRetry = async (url: string, targetDir: string, fileName: string, expectedVersion?: string, retries: number = 3): Promise<void> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await downloadAndUpdate(url, targetDir, fileName, expectedVersion);
            return;
        } catch (error) {
            logger.error(`Attempt ${attempt} failed for ${fileName}:`, error);
            if (attempt === retries) {
                logger.error(`Failed to download ${fileName} after ${retries} attempts.`);
            }
        }
    }
};

// Download and update
const downloadAndUpdate = async (url: string, targetDir: string, fileName: string, expectedVersion?: string): Promise<void> => {
    const filePath: string = path.join(targetDir, fileName);

    try {
        if (url.startsWith('\\\\') || path.isAbsolute(url)) {
            // Handle UNC path or absolute file path by copying the file locally
            logger.info(`Copying file from UNC or local path: ${url}`);
            if (!fs.existsSync(url)) {
                throw new Error(`File not found at UNC path: ${url}`);
            }
            fs.copyFileSync(url, filePath);
        } else {
            // Handle HTTP/HTTPS URLs
            logger.info(`Downloading file from URL: ${url}`);
            const response = await axios.get(url, { responseType: 'stream' });
            const writer = fs.createWriteStream(filePath);
            (response.data as NodeJS.ReadableStream).pipe(writer);

            await new Promise<void>((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        }

        logger.info(`${fileName} downloaded/copied successfully.`);
        await extractAndReplace(filePath, targetDir);

        // Verify the update if an expected version is provided
        if (expectedVersion) {
            const isVerified = verifyUpdate(expectedVersion, targetDir);
            if (!isVerified) {
                logger.error('Update verification failed.');
            }
        }
    } catch (error) {
        logger.error(`Error downloading or copying ${fileName}:`, error);
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Clean up the zip file
        }
    }
};

// Extract and replace files
const extractAndReplace = async (filePath: string, targetDir: string): Promise<void> => {
    try {
        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(unzipper.Extract({ path: targetDir }))
                .on('close', resolve)
                .on('error', reject);
        });
        logger.info(`Extracted ${filePath} to ${targetDir}`);
        fs.unlinkSync(filePath); // Clean up the zip file
    } catch (error) {
        logger.error(`Error extracting ${filePath}:`, error);
    }
};

// Export initialization and scheduling logic
export const initializeScheduledTask = (): void => {
    initializeCurrentVersions();
    cron.schedule('* * * * *', checkForUpdates); // Use cron to schedule the task every minute
    logger.info('Scheduled task started. Monitoring for updates...');
};
