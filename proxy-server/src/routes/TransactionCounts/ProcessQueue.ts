import express, { Request, Response } from 'express';
import sql, { ConnectionPool } from 'mssql';
import { TranslatorPortal } from '../../utils'; // Assuming SQL config is here

const router = express.Router();
router.use(express.json()); // Middleware for JSON parsing

// Create a new row (POST)
router.post('/create', async (req: Request, res: Response) => {
  const {
    processId,
    weight,
    transactionType,
    year,
    month,
    status,
    server,
    position
  }: {
    processId: string;
    position: number;
    weight: number;
    transactionType: string;
    year: string;
    month: string;
    status: string;
    server?: string;
  } = req.body;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    await pool.request()
      .input('processId', sql.UniqueIdentifier, processId)
      .input('weight', sql.Int, weight)
      .input('transactionType', sql.VarChar(30), transactionType)
      .input('year', sql.Char(4), year)
      .input('month', sql.Char(6), month)
      .input('status', sql.VarChar(30), status)
      .input('server', sql.VarChar(30), server || null)
      .input('position', sql.Int, position)
      .query(`
        INSERT INTO dbo.ProcessQueue 
        (processId, weight, transactionType, year, month, status, server, position)
        VALUES (@processID, @weight, @transactionType, @year, @month, @status,  @server, @position);
      `);

    res.status(201).json({ message: 'Row created successfully' });
  } catch (error) {
    console.error('Error creating row:', error);
    res.status(500).json({ message: 'Error creating row', error });
  }
});

// Edit an existing row (PUT)
router.put('/edit/:processID', async (req: Request, res: Response) => {
  const { processID } = req.params;
  const {
    position,
    weight,
    transactionType,
    year,
    month,
    status,
    startedDate,
    server
  } = req.body;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    await pool.request()
      .input('processID', sql.UniqueIdentifier, processID)
      .input('position', sql.Int, position)
      .input('weight', sql.Int, weight)
      .input('transactionType', sql.VarChar(30), transactionType)
      .input('year', sql.Char(4), year)
      .input('month', sql.Char(6), month)
      .input('status', sql.VarChar(30), status)
      .input('startedDate', sql.DateTime, startedDate || null)
      .input('server', sql.VarChar(30), server || null)
      .query(`
        UPDATE dbo.ProcessQueue
        SET 
          position = @position,
          weight = @weight,
          transactionType = @transactionType,
          year = @year,
          month = @month,
          status = @status,
          startedDate = @startedDate,
          server = @server
        WHERE processID = @processID;
      `);

    res.status(200).json({ message: 'Row updated successfully' });
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ message: 'Error updating row', error });
  }
});

// Delete a row (DELETE)
router.delete('/delete/:processID', async (req: Request, res: Response) => {
  const { processID } = req.params;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    await pool.request()
      .input('processID', sql.UniqueIdentifier, processID)
      .query(`DELETE FROM dbo.ProcessQueue WHERE processID = @processID;`);

    res.status(200).json({ message: 'Row deleted successfully' });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ message: 'Error deleting row', error });
  }
});

// Get all rows (GET)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    const result = await pool.request()
      .query(`SELECT * FROM dbo.ProcessQueue ORDER BY createdDate DESC;`);

    // Map the result and format it according to the desired structure
    const formattedData = result.recordset.map(row => ({
      type: 'process',  // This is static for all rows, adjust as needed
      status: row.status,       // Replace with the actual status, you may need to modify based on your data
      data: {
        processId: row.processID,
        month: row.month,
        year: row.year,
        transactionType: row.transactionType,
        position: row.position,
        weight: row.weight,
        // Add any other fields you want to include here
      }
    }));

    // Send the formatted response
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching rows:', error);
    res.status(500).json({ message: 'Error fetching rows', error });
  }
});


// Get a specific row by processID (GET)
router.get('/:processID', async (req: Request, res: Response) => {
  const { processID } = req.params;

  try {
    const pool: ConnectionPool = await sql.connect(TranslatorPortal);
    const result = await pool.request()
      .input('processID', sql.UniqueIdentifier, processID)
      .query(`SELECT * FROM dbo.ProcessQueue WHERE processID = @processID;`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'Row not found' });
    }
  } catch (error) {
    console.error('Error fetching row:', error);
    res.status(500).json({ message: 'Error fetching row', error });
  }
});

export default router;
