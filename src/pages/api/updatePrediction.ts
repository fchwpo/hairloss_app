import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imgurLink, prediction } = req.body;

  const { data = [], error } = await supabase
    .from('images')
    .update({ prediction })
    .eq('imgur_url', imgurLink);

  if (error) {
    res.status(404).json({ error: 'Image not found or error updating prediction' });
  } else {
    res.status(200).json({ msg: 'updated' });
  }
}
