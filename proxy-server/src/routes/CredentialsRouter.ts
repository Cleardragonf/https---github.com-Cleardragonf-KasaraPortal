import express from 'express';
import sql, { ConnectionPool } from 'mssql';
import { TranslatorPortal, sqlConfig2 } from '../utils'; // Import both configs
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import dotenv from 'dotenv'; // Import dotenv for environment variables
import path from 'path'; // Import path for resolving file paths

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const proxyServerUrl = process.env.PROXY_SERVER; // ✅ this now works with dotenv

const router = express.Router();

// POST route to execute custom queries
router.post('/', express.json(), async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password, email, status, FirstName, LastName, Role } = req.body;

    if (!username || !password || !email || !status || !FirstName || !LastName || !Role) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
    }

    try {
        const query = `
            INSERT INTO Roles (username, password, email, status, FirstName, LastName, role)
            VALUES (@username, @password, @mail, @status, @FirstName, @LastName, @Role)
        `;

        let pool: ConnectionPool | null = null;
        pool = await new ConnectionPool(TranslatorPortal).connect();
        await pool.request()
            .input('username', username)
            .input('password', password)
            .input('mail', email)
            .input('status', status)
            .input('FirstName', FirstName)
            .input('LastName', LastName)
            .input('Role', Role)
            .query(query);

        // Send email with approval and denial linkss
        const transporter = nodemailer.createTransport(<nodemailer.TransportOptions>{
            host: 'mxout.ne.gov', // Use the Nebraska SMTP server
            port: 25,             // Port 25 is commonly used for non-encrypted SMTP
            secure: false,        // Set to false as this server likely doesn't use SSL/TLS
            auth: undefined,      // No authentication required for this server
        });

        const approvalLink = `http://${proxyServerUrl}:5001/api/auth/approve?username=${encodeURIComponent(username)}`;
        const denialLink = `http://${proxyServerUrl}:5001/api/auth/deny?username=${encodeURIComponent(username)}`;

        const mailOptions = {
            from: 'chris.warner@nebraska.gov', // Replace with your email
            to: 'chris.warner@nebraska.gov',
            subject: 'User Approval Required',
            html: `
                <p>A new user has been created. Please review their profile:</p>
                <p>Username: ${username}</p>
                <p>
                    <a href="${approvalLink}">Approve</a> | 
                    <a href="${denialLink}">Deny</a>
                </p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'User created successfully. Approval email sent.' });
    } catch (error) {
        console.error('Error during user creation:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// POST route to validate user credentials
router.post('/validate', express.json(), async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required.' });
        return;
    }

    try {
        const query = `
            SELECT username, email, role, FirstName, LastName, status
            FROM Roles
            WHERE username = @username AND password COLLATE Latin1_General_BIN = @password
        `;

        let pool: ConnectionPool | null = null;
        pool = await new ConnectionPool(TranslatorPortal).connect();
        const result = await pool.request()
            .input('username', username)
            .input('password', password)
            .query(query);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            if (user.status !== 'Active') {
                res.status(403).json({ success: false, message: 'Profile isn\'t approved.' });
                return;
            }
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/approve', async (req: express.Request, res: express.Response): Promise<void> => {
    const { username } = req.query;

    if (!username) {
        res.status(400).json({ message: 'Username is required.' });
        return;
    }

    try {
        const query = `
            UPDATE Roles
            SET status = 'Active'
            WHERE username = @username
        `;

        let pool: ConnectionPool | null = null;
        pool = await new ConnectionPool(TranslatorPortal).connect();
        await pool.request()
            .input('username', username)
            .query(query);

        res.json({ success: true, message: 'User approved successfully.' });
    } catch (error) {
        console.error('Error during user approval:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/deny', async (req: express.Request, res: express.Response): Promise<void> => {
    const { username } = req.query;

    if (!username) {
        res.status(400).json({ message: 'Username is required.' });
        return;
    }

    try {
        const query = `
            UPDATE Roles
            SET status = 'Denied'
            WHERE username = @username
        `;

        let pool: ConnectionPool | null = null;
        pool = await new ConnectionPool(TranslatorPortal).connect();
        await pool.request()
            .input('username', username)
            .query(query);

        res.json({ success: true, message: 'User denied successfully.' });
    } catch (error) {
        console.error('Error during user denial:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/check-username', async (req: express.Request, res: express.Response): Promise<void> => {
    const { username } = req.query;

    if (!username) {
        res.status(400).json({ message: 'Username is required.' });
        return;
    }

    try {
        const query = `
            SELECT COUNT(*) AS count
            FROM Roles
            WHERE username = @username
        `;

        let pool: ConnectionPool | null = null;
        pool = await new ConnectionPool(TranslatorPortal).connect();
        const result = await pool.request()
            .input('username', username)
            .query(query);

        const exists = result.recordset[0].count > 0;
        res.json({ exists });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

export default router;
