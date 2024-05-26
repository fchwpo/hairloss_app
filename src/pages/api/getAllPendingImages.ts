import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('imgur_url, id')
      .filter("prediction", "eq", "")
      // .or('prediction.eq.""')

    if (error) {
      throw error
    }

    res.status(200).json({ images: data })
  } catch (error) {
    console.error('Error fetching pending images:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
