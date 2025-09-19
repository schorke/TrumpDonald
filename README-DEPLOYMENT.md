# Deployment Instructions

## Database Setup

1. Go to your Vercel dashboard
2. Navigate to Storage > Create Database
3. Choose **"KV"** (Redis) - it's the cheapest option for a simple counter
4. Click "Create" on the KV option
5. Name your database (e.g., "trump-counter")
6. The environment variables will be automatically added to your project

## Deployment Steps

1. Push your code to GitHub
2. Deploy to Vercel (the KV database will be automatically connected)
3. Your counter will start with the migrated value of 233,006,980
4. All clicks will now be saved to the database and synced across all users in real-time

## Features

- **Persistent Storage**: Counter is saved in Vercel KV (Redis)
- **Real-time Updates**: All users see live counter updates via Server-Sent Events
- **Optimistic UI**: Counter updates instantly on click, then syncs with server
- **Fallback Support**: Gracefully falls back to polling if real-time connection fails
- **Error Handling**: Reverts optimistic updates if server request fails

## Cost

- Vercel KV Free Tier: 30,000 commands/month (more than enough for this use case)
- Each click = 1 command, each user connection = ~60 commands/hour for polling
