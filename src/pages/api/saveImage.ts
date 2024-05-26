import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { imgurLink } = req.body;

    const { data, error } = await supabase
      .from('images')
      .insert([{ imgur_url: imgurLink, timestamp: new Date(), prediction: '' }]);

    if (error) {
      res.status(500).json({ error: 'Error saving image to database' });
    } else {
      res.status(200).json({ data });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
