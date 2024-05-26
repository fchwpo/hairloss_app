import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { imgurLink, prediction } = req.body;

  const { data, error } = await supabase
    .from('images')
    .update({ prediction })
    .eq('imgur_url', imgurLink);

  if (error || !data.length) {
    res.status(404).json({ error: 'Image not found or error updating prediction' });
  } else {
    res.status(200).json({ data: data[0] });
  }
}
