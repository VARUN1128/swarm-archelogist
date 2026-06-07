# Swarm Archaeologist

## Overview
Swarm Archaeologist is an AI-powered repository intelligence workspace that helps engineering teams review AI-generated and human-written code with more structure, evidence, and confidence.

As vibe coding becomes normal, more people can create software faster than ever. That is powerful, but it also creates a new bottleneck: understanding whether the generated code is architecturally sound, secure, testable, performant, and safe to merge. Swarm Archaeologist is built for that moment.

It analyzes a repository through multiple specialist review agents, consolidates the strongest findings through a Staff Engineer validation pass, proposes code changes, validates approved patches, and assembles a pull request-ready review package.

The goal is simple: turn repository risk into pull request-ready fixes.

## Why This Matters
AI coding tools have changed how software gets built. Developers, founders, students, and non-traditional builders can now generate working applications quickly. But speed creates a new problem: codebases can grow faster than teams can understand them.

Vibe coding makes creation easier. Swarm Archaeologist makes review, validation, and handoff safer.

This product is valuable because the next generation of engineering workflows will not only need tools that write code. They will need tools that inspect, explain, prioritize, validate, and package code changes for real teams.

Swarm Archaeologist sits in that gap between fast generation and responsible engineering.

## Problem Statement
Modern repositories are hard to review deeply and quickly at the same time.

This becomes even harder in the AI-assisted development era, where code can be generated in large bursts and the reviewer may not have full context on every file, dependency, or architectural decision.

Engineering teams often struggle with:
- understanding unfamiliar or fast-growing codebases
- reviewing vibe-coded repositories for real production risks
- identifying architecture issues before they become expensive rewrites
- finding security, QA, and performance risks across scattered files
- separating important findings from generic AI suggestions
- turning review findings into safe, inspectable code changes
- validating generated fixes before they become part of the codebase
- creating a clean pull request narrative that teammates can trust

## Solution
Swarm Archaeologist turns repository analysis into a guided engineering review workflow.

Instead of asking one AI model to produce a long, noisy review, the system builds repository context once and routes focused evidence to specialist agents:

- Architecture agent
- Security agent
- QA agent
- Performance agent

Their findings are then passed through a Staff Engineer validation layer that filters weak or duplicated findings, prioritizes the strongest risks, and creates a clearer decision queue.

From there, teams can approve findings, generate patch proposals, validate approved patches against a local repository, and export a clean pull request-ready package.

## Core Workflow
1. Add a GitHub repository URL or local repository path.
2. Build repository context and specialist file shortlists.
3. Run architecture, security, QA, and performance agents.
4. Consolidate results through a Staff Engineer validation pass.
5. Approve the findings that matter.
6. Generate patch proposals for approved findings.
7. Approve individual patches or approve all.
8. Validate patches with lint and test commands.
9. Apply approved patches locally when running in local development.
10. Generate a pull request-ready markdown package.

## Features
- Multi-agent repository review across architecture, security, QA, and performance.
- Staff Engineer validation pass to deduplicate, filter, and prioritize findings.
- GitHub repository analysis for hosted workflows.
- Local repository analysis for developer machines.
- Incremental analysis modes for full, diff, and pull request review.
- Agent-specific context routing to reduce token usage and improve relevance.
- Cached file summaries to avoid repeated analysis work.
- Two-pass file shortlist analysis for targeted deep review.
- Findings approval workflow before fix generation.
- Patch generation with per-patch approval and approve-all support.
- Side-by-side original and suggested code review.
- Local patch application with backup creation and overwrite protection.
- Lint and test execution for validating approved patches.
- Pull request-ready markdown package generation.
- Persistent session history.
- Shareable review sessions for team handoff.
- Live progress tracking during repository ingestion and specialist execution.

## Product Value
Swarm Archaeologist is not just a code review bot. It is a review board for repositories.

It is designed for:
- solo builders who vibe-code quickly and need a second engineering brain
- startup teams shipping fast with limited review bandwidth
- hackathon teams generating code quickly and needing confidence before demo
- engineering managers reviewing unfamiliar repositories
- teams adopting AI coding tools but needing better governance
- developers inheriting messy or undocumented codebases

The product creates value by helping teams move from:
- raw code to understood architecture
- noisy findings to prioritized risk
- vague suggestions to approved patches
- local investigation to shareable review package
- AI generation to engineering confidence

## Tech Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Radix UI primitives, React Router, React Flow
- Backend: FastAPI, Python, Pydantic, AsyncIO
- Persistence: local JSON session persistence
- APIs: OpenAI API, GitHub REST API
- Hosting: Vercel frontend and FastAPI backend deployment support

## Architecture Highlights
- FastAPI backend exposes repository analysis, job polling, patching, validation, sessions, and share routes.
- React frontend provides the home intake, live progress workspace, findings boards, patch review, and PR package views.
- OpenAI structured outputs are used for specialist reports, Staff Engineer synthesis, patch proposals, and PR package drafting.
- GitHub API is used for hosted repository ingestion.
- Local repository service supports local filesystem analysis during development.
- Session storage persists analysis results and shareable review state.

## Codex / OpenAI Usage
Codex and OpenAI tooling were used across the full build cycle.

Build-time usage:
- Ideation and product positioning
- Architecture planning
- Backend and frontend implementation
- Debugging schema and API issues
- UI refactoring and design iteration
- Testing and verification support
- Documentation and README authoring
- Deployment guidance

Runtime usage:
- Specialist architecture, security, QA, and performance review
- Staff Engineer validation and prioritization
- Patch proposal generation
- Pull request package drafting

This project is also an example of the problem it solves: AI accelerates creation, and Swarm Archaeologist adds the review layer needed to make that acceleration safer.

## Demo
- Demo / pitch video: https://youtu.be/Z2yFDBkelmk

## Live Link
- Hosted app: https://swarm-archelogist.vercel.app/

## Screenshots
<img width="1901" height="861" alt="Swarm Archaeologist home screen" src="https://github.com/user-attachments/assets/8d78351d-fbee-4a76-b89b-7426f5eeb227" />

<img width="1896" height="961" alt="Swarm Archaeologist workspace" src="https://github.com/user-attachments/assets/c3f326c3-d024-4b56-8eb7-f74bcbd42202" />

<img width="1903" height="965" alt="Swarm Archaeologist review output" src="https://github.com/user-attachments/assets/aa3833f6-c088-43f7-bed6-5c292b4694ec" />

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
- Frontend: http://localhost:5173/home
- Backend health check: http://localhost:8000/api/health

## Hosted vs Local Behavior
The hosted app can analyze GitHub repositories through the deployed backend.

Local-only features require running the app on a developer machine because a cloud deployment cannot read files from a user's laptop.

Hosted mode supports:
- GitHub repository analysis
- findings
- generated fixes
- pull request package generation
- shared sessions

Local mode additionally supports:
- local path repository analysis
- applying approved patches to a local codebase
- running local lint and test validation commands

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

## Future Roadmap
- Real GitHub branch creation and pull request opening
- GitHub App authentication
- Persistent database-backed session storage
- Organization-level dashboards
- Patch confidence and blast-radius scoring
- Deeper code navigation from finding to evidence
- Team comments and reviewer assignment
- Local companion agent for secure desktop patch application from hosted sessions

## Notes
- The system generates review output and approved patch packages, but does not automatically push code or open GitHub pull requests yet.
- Pull request mode requires a GitHub repository URL.
- Local-only analysis supports full and diff-oriented flows.
- Patch validation execution depends on the target local repository having runnable project dependencies and valid commands.

## Documentation
- [Installation Guide](docs/installation.md)
- [Architecture Overview](docs/architecture.md)
- [Environment Setup](docs/environment.md)
- [Deployment Guide](docs/deployment.md)
- [API Documentation](docs/api.md)
- [Roadmap](docs/roadmap.md)
