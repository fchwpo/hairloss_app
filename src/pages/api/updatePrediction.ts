import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imgurLink, prediction } = req.body;

  const query = 'UPDATE images SET prediction = $1 WHERE imgur_url = $2 RETURNING *';
  const values = [prediction, imgurLink];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Image not found' });
    } else {
      res.status(200).json({ data: result.rows[0] });
    }
  } catch (error) {
    console.error('Error updating prediction in database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
