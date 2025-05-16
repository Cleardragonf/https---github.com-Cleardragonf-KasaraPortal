import express from 'express';
// Remove mssql imports
import { TranslatorPortal as KasaraPortal } from '../utils';
import { Pool } from 'pg'; // Use pg for Postgres
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const proxyServerUrl = process.env.PROXY_SERVER;

const router = express.Router();
const pool = new Pool(KasaraPortal);

// POST route to execute custom queries
router.post('/', express.json(), async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password, email, status, FirstName, LastName, Role } = req.body;

    if (!username || !password || !email || !status || !FirstName || !LastName || !Role) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
    }

    try {
        const query = `
            INSERT INTO "Authorization" (username, password, email, status, "FirstName", "LastName", role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await pool.query(query, [username, password, email, status, FirstName, LastName, Role]);

        // Send email with approval and denial links
        const transporter = nodemailer.createTransport({
          host: 'live.smtp.mailtrap.io',
          port: 2525,
          auth: {
            user: 'api', // <-- your Mailtrap user
            pass: '6ae52b9bedf8623ecf97ff4e127d543e', // <-- your Mailtrap password
          },
        });

        const approvalLink = `http://${proxyServerUrl}:5001/api/auth/approve?username=${encodeURIComponent(username)}`;
        const denialLink = `http://${proxyServerUrl}:5001/api/auth/deny?username=${encodeURIComponent(username)}`;

        const mailOptions = {
            from: 'noreply@play.ryugame.net', // Use your own verified domain here
            to: 'chrismwarner339@gmail.com',
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
            SELECT username, email, role, "FirstName", "LastName", status
            FROM "Authorization"
            WHERE username = $1 AND password = $2
        `;
        const result = await pool.query(query, [username, password]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
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
            UPDATE "Authorization"
            SET status = 'Active'
            WHERE username = $1
        `;
        await pool.query(query, [username]);

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
            UPDATE "Authorization"
            SET status = 'Denied'
            WHERE username = $1
        `;
        await pool.query(query, [username]);

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
            FROM "Authorization"
            WHERE username = $1
        `;
        const result = await pool.query(query, [username]);
        const exists = parseInt(result.rows[0].count, 10) > 0;
        res.json({ exists });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

export default router;
