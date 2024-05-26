import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imgurLink } = req.query;

  const { data = [], error } = await supabase
    .from('images')
    .select('*')
    .eq('imgur_url', imgurLink);

  if (error || !data?.length) {
    res.status(404).json({ error: 'Image not found' });
  } else {
    res.status(200).json({ data: data[0] });
  }
}
