import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imgurLink } = req.query;

  const query = 'SELECT * FROM images WHERE imgur_url = $1';
  const values = [imgurLink];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.status(200).json({ data: result.rows[0] });
    }
  } catch (error) {
    console.error('Error fetching prediction from database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
