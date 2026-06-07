# Swarm Archaeologist

## Overview
Swarm Archaeologist is an AI-powered repository intelligence workspace for engineering teams. It analyzes a codebase through multiple specialist review agents, consolidates the strongest findings through a Staff Engineer validation pass, proposes code changes, validates approved patches, and assembles a pull request-ready review package.

The product is designed to feel less like a raw AI dump and more like a structured engineering workflow: inspect architecture, detect risk, approve findings, review generated fixes, validate them locally, and package the outcome for team review.

## Problem Statement
Modern repositories are hard to review deeply and quickly at the same time.

Engineering teams often struggle with:
- architecture understanding across unfamiliar codebases
- scattered risk review across security, QA, and performance concerns
- noisy AI code review output with weak prioritization
- difficulty turning findings into safe, reviewable code changes
- repeated analysis cost when only a small part of the repo has changed

## Solution
Swarm Archaeologist solves this by turning repository analysis into a guided review system.

It builds repository context once, routes focused evidence to specialist agents, and sends their outputs through a Staff Engineer adjudication layer before suggesting fixes. From there, teams can approve findings, generate patches, validate them against a local repository, and export a clean pull request package.

It supports:
- GitHub repository analysis
- local repository analysis
- incremental diff and PR review modes
- persistent analysis history
- shareable review sessions

## Features
- Multi-agent engineering review across architecture, security, QA, and performance.
- Staff Engineer validation pass to deduplicate and prioritize findings.
- Incremental analysis for `full`, `diff`, and `pull request` workflows.
- Local-only repository analysis when a GitHub URL is not available.
- Findings approval workflow before fix generation.
- Patch generation with per-patch approval and approve-all flows.
- Local patch application with backup creation and overwrite protection.
- Lint and test execution for validating approved patches.
- PR-ready markdown package generation for approved fixes.
- Persistent analysis history and shareable team review sessions.
- Live progress tracking during repository ingestion and agent execution.

## Tech Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Radix UI primitives, React Router, React Flow
- Backend: FastAPI, Python, Pydantic, AsyncIO
- Database / Persistence: local JSON session persistence
- APIs: OpenAI API, GitHub REST API
- Hosting: local development setup currently included; production hosting can be added for frontend and backend separately

## Codex / OpenAI Usage
Codex and OpenAI tooling were used across the full product build cycle:

- Ideation:
  product shaping, workflow design, and feature prioritization
- Architecture planning:
  backend/frontend split, routing design, session model, and agent orchestration approach
- Code generation:
  FastAPI routes, React components, shared types, validation flows, and UX scaffolding
- Debugging:
  schema fixes, request/response alignment, dependency issues, and frontend state flow repairs
- Testing and verification:
  build verification, backend compile checks, local execution validation flow implementation
- Documentation:
  architecture docs, setup docs, roadmap notes, and README authoring
- API integration:
  OpenAI structured outputs, GitHub API repository access, and local repository analysis support

OpenAI is also part of the runtime product itself through:
- structured specialist review generation
- Staff Engineer synthesis
- patch proposal generation
- PR package drafting

## Demo
- Demo / pitch video: `https://youtu.be/Z2yFDBkelmk`

## Live Link
- Hosted app: `https://swarm-archelogist.vercel.app/`

## Screenshots<img width="1901" height="861" alt="image" src="https://github.com/user-attachments/assets/8d78351d-fbee-4a76-b89b-7426f5eeb227" />
<img width="1896" height="961" alt="image" src="https://github.com/user-attachments/assets/c3f326c3-d024-4b56-8eb7-f74bcbd42202" />
<img width="1903" height="965" alt="image" src="https://github.com/user-attachments/assets/aa3833f6-c088-43f7-bed6-5c292b4694ec" />

Add screenshots here for:
- home / intake experience
- live analysis progress
- findings approval workspace
- patch review and apply flow
- PR package output

If you capture assets later, you can place them in a folder like `docs/screenshots/` and link them here.

## Monorepo Layout
```text
backend/   FastAPI service, agent orchestration, repository analysis, patching, validation
frontend/  Vite + React engineering review workspace
docs/      installation, architecture, environment, deployment, API, and roadmap docs
```

## How to Run Locally

### 1. Clone the repository
```bash
git clone <repo-url>
cd <project-folder>
```

### 2. Start the backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### 3. Configure backend environment variables
At minimum, set:

- `OPENAI_API_KEY`

Recommended:

- `GITHUB_TOKEN` for higher rate limits and private repository access

Optional:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4. Start the frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 5. Open the app
- Frontend: [http://localhost:5173/home](http://localhost:5173/home)
- Backend health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

## Core API
- `GET /api/health`
- `POST /api/analyze`
- `POST /api/analyze-jobs`
- `GET /api/analyze-jobs/{job_id}`
- `POST /api/generate-fixes`
- `POST /api/generate-pr`
- `POST /api/apply-approved-patches`
- `POST /api/validate-approved-patches`
- `GET /api/sessions`
- `GET /api/sessions/{session_id}`
- `GET /api/shared/{share_id}`

## Notes
- The system generates review output and approved patch packages, but does not automatically push code or open GitHub pull requests yet.
- Pull request mode requires a GitHub repository URL.
- Local-only analysis supports full and diff-oriented flows.
- Patch validation execution depends on the target local repository having runnable project dependencies and valid commands.

## Documentation
- [Installation Guide](D:\Codex Hackathon\docs\installation.md)
- [Architecture Overview](D:\Codex Hackathon\docs\architecture.md)
- [Environment Setup](D:\Codex Hackathon\docs\environment.md)
- [Deployment Guide](D:\Codex Hackathon\docs\deployment.md)
- [API Documentation](D:\Codex Hackathon\docs\api.md)
- [Roadmap](D:\Codex Hackathon\docs\roadmap.md)
