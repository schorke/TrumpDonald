import { kv } from '@vercel/kv';

const COUNTER_KEY = 'trump_counter';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get current counter value
      let counter = await kv.get(COUNTER_KEY);
      
      // Initialize counter if it doesn't exist (migrate from current value)
      if (counter === null) {
        counter = 233006980; // Current displayed value
        await kv.set(COUNTER_KEY, counter);
      }
      
      return res.status(200).json({ counter });
    }
    
    if (req.method === 'POST') {
      // Increment counter
      const newCounter = await kv.incr(COUNTER_KEY);
      
      return res.status(200).json({ 
        counter: newCounter,
        success: true 
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Counter API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      fallback: true,
      counter: 233006980 // Fallback to current displayed value
    });
  }
}
