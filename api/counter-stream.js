import { createClient } from 'redis';

const COUNTER_KEY = 'trump_counter';

let redis = null;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL
    });
    
    redis.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    
    await redis.connect();
  }
  return redis;
}

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
    const client = await getRedisClient();
    
    // Just return the current counter value as JSON
    let counter = await client.get(COUNTER_KEY);
    if (counter === null) {
      counter = 233006980;
      await client.set(COUNTER_KEY, counter);
    } else {
      counter = parseInt(counter, 10);
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
