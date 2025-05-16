import express, { Request, Response } from 'express';
import sql, { ConnectionPool } from 'mssql';
import { TranslatorPortal as RawTranslatorPortal } from '../../utils'; // Assuming you have a SQL config file

// Fix config: mssql expects 'server', not 'host'
const TranslatorPortal = {
  ...RawTranslatorPortal,
  server: RawTranslatorPortal.host,
};

const router = express.Router();

// Middleware to parse JSON request bodies
router.use(express.json()); // <-- Added to ensure that body is parsed correctly

// Create a new row (POST)
router.post('/create', async (req: Request, res: Response) => {
  const {
    id,
    transactionType = 'edi',
    description = 'asdf',
    
    dayOfMonth = '15',
    time = '12:00',
    createdAt = '',
    updatedAt
  }: {
    id: string;
    transactionType: string;
    description: string;
    dayOfMonth: string;
    time: string;
    createdAt: string;
    updatedAt: string;
  } = req.body;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id) // Assuming UUID as UniqueIdentifier
      .input('transactionType', sql.NVarChar, transactionType)
      .input('description', sql.NVarChar, description)
      .input('dayOfMonth', sql.Char(2), dayOfMonth)
      .input('time', sql.Char(5), time)
      .input('createdAt', sql.DateTime2, createdAt)
      .input('updatedAt', sql.DateTime2, updatedAt)
      .query(`
        INSERT INTO dbo.TransactionCount_Schedule 
        (id, transactionType, description, dayOfMonth, time, createdAt, updatedAt)
        VALUES (@id, @transactionType, @description, @dayOfMonth, @time, @createdAt, @updatedAt);
      `);

    res.status(201).json({ message: 'Row created successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during creation:', error.message);
      res.status(500).json({ message: 'Error creating the row', error: error.message });
    } else {
      console.error('Unknown error during creation:', error);
      res.status(500).json({ message: 'Unknown error during creation', error });
    }
  }
});

// Edit an existing row (PUT)
router.put('/edit/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    transactionType,
    description,
    dayOfMonth,
    time,
    updatedAt,
    lastSuccessfulRun // Optional field
  }: {
    transactionType: string;
    description: string;
    dayOfMonth: string;
    time: string;
    updatedAt: string;
    lastSuccessfulRun?: string; // Optional field
  } = req.body;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id || null) // Ensure id is valid or null
      .input('transactionType', sql.NVarChar, transactionType)
      .input('description', sql.NVarChar, description)
      .input('dayOfMonth', sql.Char(2), dayOfMonth)
      .input('time', sql.Char(5), time)
      .input('updatedAt', sql.DateTime2, updatedAt);

    if (lastSuccessfulRun) {
      request.input('lastSuccessfulRun', sql.DateTime2, lastSuccessfulRun);
    }

    const query = `
      UPDATE dbo.TransactionCount_Schedule
      SET 
        transactionType = @transactionType,
        description = @description,
        dayOfMonth = @dayOfMonth,
        time = @time,
        updatedAt = @updatedAt
        ${lastSuccessfulRun ? ', lastSuccessfulRun = @lastSuccessfulRun' : ''} -- Ensure proper SQL syntax
      WHERE id = @id;
    `;

    await request.query(query);

    res.status(200).json({ message: 'Row updated successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during update:', error.message);
      res.status(500).json({ message: 'Error updating the row', error: error.message });
    } else {
      console.error('Unknown error during update:', error);
      res.status(500).json({ message: 'Unknown error during update', error });
    }
  }
});

// Update LastSuccessfulRun and status (PUT)
router.put('/updateLastRun/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { lastSuccessfulRun }: { lastSuccessfulRun: string } = req.body;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);

    // Check if the LastSuccessfulRun column exists in the TransactionCount_Schedule table
    const columnCheck = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'TransactionCount_Schedule' AND COLUMN_NAME = 'LastSuccessfulRun'
    `);

    if (columnCheck.recordset.length === 0) {
      throw new Error("Column 'LastSuccessfulRun' does not exist in the TransactionCount_Schedule table.");
    }

    // Update the LastSuccessfulRun
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('LastSuccessfulRun', sql.DateTime2, lastSuccessfulRun)
      .query(`
        UPDATE dbo.TransactionCount_Schedule
        SET 
          LastSuccessfulRun = @LastSuccessfulRun
        WHERE id = @id;
      `);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: 'Row not found' });
      return;
    }

    // Check if the status column exists in the ProcessQueue table
    const statusColumnCheck = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'ProcessQueue' AND COLUMN_NAME = 'status'
    `);

    if (statusColumnCheck.recordset.length === 0) {
      throw new Error("Column 'status' does not exist in the ProcessQueue table.");
    }

    // Update the status to 'Complete'
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('status', sql.NVarChar, 'Complete') // Hardcoded status
      .query(`
        UPDATE dbo.ProcessQueue
        SET 
          status = @status
        WHERE processId = @id;
      `);

    // Fetch the updated row to include in the response
    const updatedRow = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT id, LastSuccessfulRun
        FROM dbo.TransactionCount_Schedule
        WHERE id = @id;
      `);

    if (updatedRow.recordset.length > 0) {
      res.status(200).json({ message: 'Row updated successfully', ...updatedRow.recordset[0] });
    } else {
      res.status(404).json({ message: 'Row not found after update' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating LastSuccessfulRun:', error.message);
      res.status(500).json({ message: 'Error updating LastSuccessfulRun', error: error.message });
    } else {
      console.error('Unknown error updating LastSuccessfulRun:', error);
      res.status(500).json({ message: 'Unknown error updating LastSuccessfulRun', error });
    }
  }
});

// Delete a row (DELETE)
router.delete('/delete/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        DELETE FROM dbo.TransactionCount_Schedule
        WHERE id = @id;
      `);

    res.status(200).json({ message: 'Row deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during deletion:', error.message);
      res.status(500).json({ message: 'Error deleting the row', error: error.message });
    } else {
      console.error('Unknown error during deletion:', error);
      res.status(500).json({ message: 'Unknown error during deletion', error });
    }
  }
});

// Get all rows (GET)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    const result = await pool.request()
      .query(`
        SELECT * FROM dbo.TransactionCount_Schedule;
      `);

    res.status(200).json(result.recordset); // This will return all rows
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during get all rows:', error.message);
      res.status(500).json({ message: 'Error fetching the rows', error: error.message });
    } else {
      console.error('Unknown error during get all rows:', error);
      res.status(500).json({ message: 'Unknown error during get all rows', error });
    }
  }
});

// Check if the schedule exists (GET)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
      const pool: ConnectionPool = await sql.connect(TranslatorPortal);
      const result = await pool.request()
          .input('id', sql.UniqueIdentifier, id)
          .query(`
              SELECT * FROM dbo.TransactionCount_Schedule WHERE id = @id;
          `);

      if (result.recordset.length > 0) {
          res.status(200).json(result.recordset[0]); // Schedule exists
      } else {
          res.status(404).json({ message: 'Schedule not found' }); // Schedule does not exist
      }
  } catch (error: unknown) {
      if (error instanceof Error) {
          console.error('Error during schedule check:', error.message);
          res.status(500).json({ message: 'Error checking the schedule', error: error.message });
      } else {
          console.error('Unknown error during schedule check:', error);
          res.status(500).json({ message: 'Unknown error during schedule check', error });
      }
  }
});

export default router;
