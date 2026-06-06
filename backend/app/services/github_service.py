import base64
from urllib.parse import urlparse

import httpx
from fastapi import status

from app.core.config import get_settings
from app.core.exceptions import ApplicationError
from app.schemas.common import RepoFile, RepositoryMetadata


class GitHubService:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.github_api_base.rstrip("/")
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if settings.github_token:
            self.headers["Authorization"] = f"Bearer {settings.github_token}"

    @staticmethod
    def parse_repository_url(repository_url: str) -> tuple[str, str]:
        parsed = urlparse(repository_url)
        if parsed.netloc.lower() != "github.com":
            raise ApplicationError("Only GitHub repository URLs are supported.", "invalid_repository_url")
        parts = [part for part in parsed.path.split("/") if part]
        if len(parts) < 2:
            raise ApplicationError("Repository URL must include owner and repository name.", "invalid_repository_url")
        return parts[0], parts[1].removesuffix(".git")

    async def _get(self, path: str, params: dict[str, str] | None = None) -> dict | list:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(f"{self.base_url}{path}", headers=self.headers, params=params)
        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise ApplicationError("Repository or resource not found.", "github_not_found", status.HTTP_404_NOT_FOUND)
        if response.status_code == status.HTTP_403_FORBIDDEN:
            raise ApplicationError("GitHub API access denied or rate limited.", "github_forbidden", status.HTTP_403_FORBIDDEN)
        response.raise_for_status()
        return response.json()

    async def get_repository_metadata(self, owner: str, repo: str) -> RepositoryMetadata:
        payload = await self._get(f"/repos/{owner}/{repo}")
        return RepositoryMetadata(
            owner=owner,
            name=repo,
            full_name=payload["full_name"],
            default_branch=payload["default_branch"],
            description=payload.get("description"),
            primary_language=payload.get("language"),
            stars=payload.get("stargazers_count", 0),
            forks=payload.get("forks_count", 0),
            open_issues=payload.get("open_issues_count", 0),
            topics=payload.get("topics", []),
        )

    async def get_readme(self, owner: str, repo: str) -> str:
        payload = await self._get(f"/repos/{owner}/{repo}/readme")
        encoded = payload.get("content", "")
        if not encoded:
            return ""
        return base64.b64decode(encoded).decode("utf-8", errors="ignore")

    async def get_tree(self, owner: str, repo: str, branch: str) -> list[RepoFile]:
        payload = await self._get(f"/repos/{owner}/{repo}/git/trees/{branch}", params={"recursive": "1"})
        return [
            RepoFile(path=item["path"], type=item["type"], sha=item.get("sha"), size=item.get("size"))
            for item in payload.get("tree", [])
            if item["type"] in {"blob", "tree"}
        ]

    async def get_file_content(self, owner: str, repo: str, path: str) -> str:
        payload = await self._get(f"/repos/{owner}/{repo}/contents/{path}")
        encoded = payload.get("content", "")
        if not encoded:
            return ""
        return base64.b64decode(encoded).decode("utf-8", errors="ignore")
