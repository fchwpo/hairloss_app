import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imgurLink } = req.body;

  const timestamp = new Date().toISOString();
  const query = 'INSERT INTO images (imgur_url, timestamp, prediction) VALUES ($1, $2, $3) RETURNING *';
  const values = [imgurLink, timestamp, ''];

  try {
    const result = await pool.query(query, values);
    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error saving image to database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
