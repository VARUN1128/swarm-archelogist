# Deployment Guide

## Backend to Railway

1. Create a Railway project for `backend/`.
2. Set environment variables from `.env.example`.
3. Use the start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

## Frontend to Vercel

1. Import `frontend/` into Vercel.
2. Set `VITE_API_BASE_URL` to the deployed backend URL.
3. Build command: `npm run build`.
4. Output directory: `dist`.
