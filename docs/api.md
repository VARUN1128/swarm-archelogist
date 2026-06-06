# API Documentation

## Health

`GET /api/health`

Returns service health information and configuration status.

## Analyze

`POST /api/analyze`

Builds repository context, runs specialist agents, and returns an architecture report, findings, and Staff Engineer review.

## Generate Fixes

`POST /api/generate-fixes`

Generates patch proposals and runs deterministic patch validation.

## Generate PR

`POST /api/generate-pr`

Generates a markdown PR-ready review package from review and patch artifacts.
