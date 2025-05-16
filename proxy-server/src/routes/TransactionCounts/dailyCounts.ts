  import express, { Request, Response } from 'express';
  import sql, { ConnectionPool } from 'mssql';
  import { sqlConfig } from '../../utils';


  const router = express.Router();

  router.get('/', async (req: Request, res: Response) => {
    const { year, month, day } = req.query;

    let query = 'SELECT * FROM dbo.Trans_Dly_Counts WHERE 1=1';
    const queryParams: any[] = [];

    if (year) {
      query += ' AND Year = @Year';
      queryParams.push({ name: 'Year', type: sql.NVarChar, value: year });
    }

    if (month) {
      query += ' AND Month = @Month';
      queryParams.push({ name: 'Month', type: sql.NVarChar, value: month });
    }

    if (day) {
      query += ' AND Day = @Day';
      queryParams.push({ name: 'Day', type: sql.NVarChar, value: day });
    }

    let pool: ConnectionPool | null = null;

    try {
      pool = await new ConnectionPool(sqlConfig).connect();
      const request = pool.request();

      queryParams.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      res.json(result.recordset);
    } catch (error) {
      console.error('SQL Server error:', error);
      res.status(500).json({ error: 'Failed to retrieve data from SQL Server' });
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  });

  export default router;
