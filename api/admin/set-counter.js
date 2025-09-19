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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Check for admin secret
  const adminSecret = req.headers.authorization?.replace('Bearer ', '');
  const expectedSecret = process.env.ADMIN_SECRET;
  
  if (!expectedSecret) {
    return res.status(500).json({ error: 'Admin secret not configured' });
  }
  
  if (!adminSecret || adminSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin secret' });
  }

  try {
    const { newValue } = req.body;
    
    if (typeof newValue !== 'number' || newValue < 0) {
      return res.status(400).json({ error: 'newValue must be a positive number' });
    }

    const client = await getRedisClient();
    
    // Set the new counter value
    await client.set(COUNTER_KEY, newValue);
    
    return res.status(200).json({ 
      success: true,
      message: `Counter set to ${newValue}`,
      counter: newValue
    });

  } catch (error) {
    console.error('Set Counter Error:', error);
    return res.status(500).json({ 
      error: 'Failed to set counter value'
    });
  }
}
