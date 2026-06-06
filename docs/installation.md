# Installation Guide

## Backend

1. Install Python 3.12+.
2. Create a virtual environment in `backend/`.
3. Install dependencies with `pip install -r requirements.txt`.
4. Copy `.env.example` to `.env`.
5. Start the API with `uvicorn app.main:app --reload`.

## Frontend

1. Install Node.js 20+.
2. Run `npm install` inside `frontend/`.
3. Copy `.env.example` to `.env`.
4. Start the app with `npm run dev`.

## Credentials

Set `OPENAI_API_KEY` before using AI endpoints.
Set `GITHUB_TOKEN` to increase rate limits and support private repository access.
