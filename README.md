# Swarm Archaeologist

Swarm Archaeologist is an AI-powered engineering review board that analyzes GitHub repositories with multiple specialist agents, validates findings through a Staff Engineer review pass, and generates PR-ready review packages with proposed fixes and tests.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui-style component primitives, React Flow
- Backend: FastAPI, Python 3.12+, AsyncIO, Pydantic
- AI: OpenAI API with GPT-5
- Repository analysis: GitHub REST API

## Monorepo Layout

```text
backend/   FastAPI service and AI orchestration
frontend/  Vite React dashboard
docs/      Architecture, setup, and deployment guides
```

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Required Manual Setup

Before repository analysis can run against live services, provide:

- `OPENAI_API_KEY`
- `GITHUB_TOKEN` for higher GitHub API limits and private repository access

Optional:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Core API

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/generate-fixes`
- `POST /api/generate-pr`

## Notes

- The system does not create branches, commit code, push code, or open pull requests.
- AI output is schema-validated before it is returned.
- Patch validation is deterministic and does not use AI.

## Documentation

- [Installation Guide](D:\Codex Hackathon\docs\installation.md)
- [Architecture Overview](D:\Codex Hackathon\docs\architecture.md)
- [Environment Setup](D:\Codex Hackathon\docs\environment.md)
- [Deployment Guide](D:\Codex Hackathon\docs\deployment.md)
- [API Documentation](D:\Codex Hackathon\docs\api.md)
- [Roadmap](D:\Codex Hackathon\docs\roadmap.md)
