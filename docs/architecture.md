# Architecture Overview

Swarm Archaeologist is a split frontend/backend application.

## Backend flow

1. Validate a GitHub repository URL.
2. Build condensed repository context from GitHub metadata and representative files.
3. Run specialist agents in parallel.
4. Pass findings into the Staff Engineer review agent.
5. Generate deterministic patch validation and PR package artifacts.

## Frontend flow

1. Collect a repository URL.
2. Trigger analysis.
3. Visualize execution progress, architecture graphs, and findings.
4. Generate and inspect fixes.
5. Produce a PR-ready markdown package.
