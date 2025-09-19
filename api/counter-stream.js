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

  // Set up Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Send initial counter value
    let counter = await kv.get(COUNTER_KEY);
    if (counter === null) {
      counter = 233006980;
      await kv.set(COUNTER_KEY, counter);
    }
    
    res.write(`data: ${JSON.stringify({ counter, type: 'initial' })}\n\n`);

    // Set up polling for counter changes
    const pollInterval = setInterval(async () => {
      try {
        const currentCounter = await kv.get(COUNTER_KEY);
        const lastSentCounter = await kv.get(`${STREAM_KEY}_${req.connection?.remoteAddress || 'unknown'}`);
        
        if (currentCounter !== lastSentCounter) {
          await kv.set(`${STREAM_KEY}_${req.connection?.remoteAddress || 'unknown'}`, currentCounter);
          res.write(`data: ${JSON.stringify({ counter: currentCounter, type: 'update' })}\n\n`);
        }
      } catch (error) {
        console.error('Stream polling error:', error);
      }
    }, 1000); // Poll every second

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(pollInterval);
    });

    req.on('end', () => {
      clearInterval(pollInterval);
    });

  } catch (error) {
    console.error('Counter Stream Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream error', counter: 233006980 })}\n\n`);
  }
}
