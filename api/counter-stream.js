import { kv } from '@vercel/kv';

const COUNTER_KEY = 'trump_counter';
const STREAM_KEY = 'trump_counter_stream';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Just return the current counter value as JSON
    let counter = await kv.get(COUNTER_KEY);
    if (counter === null) {
      counter = 233006980;
      await kv.set(COUNTER_KEY, counter);
    }
    
    return res.status(200).json({ counter, type: 'current' });

  } catch (error) {
    console.error('Counter Stream Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get counter',
      counter: 233006980,
      fallback: true
    });
  }
}
