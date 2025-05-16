import express from 'express';
import sql, { ConnectionPool } from 'mssql';
import { TranslatorPortal, KasaraPortal } from '../utils'; // Import both configs

const router = express.Router();

// POST route to execute custom queries
router.post('/execute-query', express.json(), async (req: express.Request, res: express.Response): Promise<void> => {
    const { query } = req.body as { query: string };

    if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Invalid query. Query must be a non-empty string.' });
        return;
    }

    let pool: ConnectionPool | null = null;

    try {
        // Try connecting to TranslatorPortal
        pool = await new ConnectionPool({ ...TranslatorPortal, server: TranslatorPortal.host }).connect();
        const result = await pool.request().query(query);
        res.status(200).json({
            success: true,
            executedQuery: query,
            data: result.recordset,
            source: 'TranslatorPortal', // Indicate the source of the data
        });
    } catch (error) {
        console.warn('TranslatorPortal connection failed. Trying sqlConfig2...', error);

        try {
            // Fallback to sqlConfig2
            pool = await new ConnectionPool({ ...KasaraPortal, server: KasaraPortal.host }).connect();
            const result = await pool.request().query(query);
            res.status(200).json({
                success: true,
                executedQuery: query,
                data: result.recordset,
                source: 'sqlConfig2', // Indicate the fallback source
            });
        } catch (fallbackError) {
            console.error('Both TranslatorPortal and sqlConfig2 connections failed.', fallbackError);
            res.status(500).json({ success: false, error: 'Failed to execute query on both databases.' });
        }
    } finally {
        if (pool) {
            await pool.close(); // Ensure the connection is closed
        }
    }
});

export default router;
