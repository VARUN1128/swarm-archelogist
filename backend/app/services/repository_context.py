from pathlib import Path
from typing import Awaitable, Callable

from app.schemas.api import IncrementalAnalysisOptions
from app.schemas.common import (
    AgentContext,
    AgentContextMap,
    AgentProgress,
    ContextOptimization,
    FileSummary,
    RepoFile,
    RepositoryContext,
    ShortlistCandidate,
)
from app.services.github_service import GitHubService

ProgressCallback = Callable[[AgentProgress], Awaitable[None] | None]


class RepositoryContextBuilder:
    def __init__(self, github_service: GitHubService) -> None:
        self.github_service = github_service
        self.manifest_names = {
            "package.json",
            "pnpm-lock.yaml",
            "yarn.lock",
            "package-lock.json",
            "requirements.txt",
            "pyproject.toml",
            "Cargo.toml",
            "go.mod",
            "pom.xml",
            "Gemfile",
        }
        self.priority_suffixes = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java"}
        self._summary_cache: dict[str, FileSummary] = {}
        self._cache_hits = 0
        self._cache_misses = 0

    async def build(
        self,
        repository_url: str,
        incremental: IncrementalAnalysisOptions | None = None,
        progress_callback: ProgressCallback | None = None,
    ) -> RepositoryContext:
        self._cache_hits = 0
        self._cache_misses = 0
        await self._emit(progress_callback, "context_builder", "running", "Validating GitHub repository URL.")
        owner, repo = self.github_service.parse_repository_url(repository_url)
        await self._emit(progress_callback, "context_builder", "running", f"Fetching repository metadata for {owner}/{repo}.")
        metadata = await self.github_service.get_repository_metadata(owner, repo)
        await self._emit(progress_callback, "context_builder", "running", "Reading repository README for high-level context.")
        readme = await self.github_service.get_readme(owner, repo)
        await self._emit(progress_callback, "context_builder", "running", f"Loading repository tree from branch {metadata.default_branch}.")
        tree = await self.github_service.get_tree(owner, repo, metadata.default_branch)
        incremental_paths = await self._resolve_incremental_paths(owner, repo, incremental, progress_callback)
        await self._emit(progress_callback, "context_builder", "running", "Pass 1: ranking repository files for specialist analysis.")
        shortlists = self._build_specialist_shortlists(tree, incremental_paths)
        await self._emit(
            progress_callback,
            "context_builder",
            "running",
            f"Pass 2: summarizing {self._count_unique_shortlisted_paths(shortlists)} shortlisted files for deep analysis.",
        )
        manifests = await self._collect_manifest_summaries(owner, repo, tree, progress_callback)
        representative_files = await self._collect_representative_files(owner, repo, tree, shortlists, progress_callback)
        agent_contexts = self._build_agent_contexts(shortlists, representative_files)
        condensed_summary = self._condense_context(metadata.description or "", readme, manifests, representative_files, shortlists)
        await self._emit(
            progress_callback,
            "context_builder",
            "completed",
            f"Condensed context built from {len(manifests)} manifests, {len(representative_files)} shortlisted summaries, {self._cache_hits} cache hits, and {self._cache_misses} new summaries.",
        )
        return RepositoryContext(
            repository_url=repository_url,
            metadata=metadata,
            readme=readme[:6000],
            manifests=manifests,
            representative_files=representative_files,
            structure=tree[:250],
            condensed_summary=condensed_summary,
            agent_contexts=agent_contexts,
            optimization=ContextOptimization(
                cached_summary_hits=self._cache_hits,
                generated_summary_count=self._cache_misses,
                shortlisted_file_count=self._count_unique_shortlisted_paths(shortlists),
            ),
        )

    async def _resolve_incremental_paths(
        self,
        owner: str,
        repo: str,
        incremental: IncrementalAnalysisOptions | None,
        progress_callback: ProgressCallback | None,
    ) -> set[str] | None:
        if incremental is None or incremental.mode == "full":
            return None
        if incremental.mode == "diff" and incremental.base_ref and incremental.head_ref:
            await self._emit(progress_callback, "context_builder", "running", f"Loading compare diff {incremental.base_ref}...{incremental.head_ref}.")
            return set(await self.github_service.compare_refs(owner, repo, incremental.base_ref, incremental.head_ref))
        if incremental.mode == "pull_request" and incremental.pull_request_number is not None:
            await self._emit(progress_callback, "context_builder", "running", f"Loading changed files for pull request #{incremental.pull_request_number}.")
            return set(await self.github_service.get_pull_request_files(owner, repo, incremental.pull_request_number))
        if incremental.mode == "changed_files" and incremental.changed_files:
            await self._emit(progress_callback, "context_builder", "running", "Using caller-provided changed file list for incremental analysis.")
            return set(incremental.changed_files)
        return None

    async def _collect_manifest_summaries(
        self,
        owner: str,
        repo: str,
        tree: list[RepoFile],
        progress_callback: ProgressCallback | None = None,
    ) -> list[FileSummary]:
        manifests: list[FileSummary] = []
        for item in tree:
            if Path(item.path).name in self.manifest_names and item.type == "blob":
                await self._emit(progress_callback, "context_builder", "running", f"Summarizing manifest {item.path}.")
                manifests.append(await self._get_or_create_summary(owner, repo, item))
            if len(manifests) >= 10:
                break
        return manifests

    async def _collect_representative_files(
        self,
        owner: str,
        repo: str,
        tree: list[RepoFile],
        shortlists: dict[str, list[ShortlistCandidate]],
        progress_callback: ProgressCallback | None = None,
    ) -> list[FileSummary]:
        summaries: list[FileSummary] = []
        seen_paths: set[str] = set()
        tree_map = {item.path: item for item in tree}
        for shortlist in shortlists.values():
            for candidate in shortlist:
                if candidate.path in seen_paths:
                    continue
                seen_paths.add(candidate.path)
                repo_file = tree_map.get(candidate.path, RepoFile(path=candidate.path, type="blob"))
                await self._emit(progress_callback, "context_builder", "running", f"Inspecting shortlisted file {candidate.path}.")
                summaries.append(await self._get_or_create_summary(owner, repo, repo_file))
        return summaries

    async def _get_or_create_summary(self, owner: str, repo: str, item: RepoFile) -> FileSummary:
        cache_key = f"{owner}/{repo}:{item.path}:{item.sha or 'unknown'}"
        cached = self._summary_cache.get(cache_key)
        if cached is not None:
            self._cache_hits += 1
            return cached

        content = await self.github_service.get_file_content(owner, repo, item.path)
        summary = FileSummary(
            path=item.path,
            content_summary=self._summarize_file_content(content),
            language=self._infer_language(item.path),
            sha=item.sha,
            size=item.size,
        )
        self._summary_cache[cache_key] = summary
        self._cache_misses += 1
        return summary

    @staticmethod
    def _summarize_file_content(content: str) -> str:
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        preview = "\n".join(lines[:40])
        return preview[:1500]

    @staticmethod
    def _infer_language(path: str) -> str:
        suffix = Path(path).suffix.lower()
        return {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "tsx",
            ".js": "javascript",
            ".jsx": "jsx",
            ".go": "go",
            ".rs": "rust",
            ".java": "java",
            ".json": "json",
            ".toml": "toml",
            ".md": "markdown",
            ".yaml": "yaml",
            ".yml": "yaml",
        }.get(suffix, "text")

    def _condense_context(
        self,
        description: str,
        readme: str,
        manifests: list[FileSummary],
        representative_files: list[FileSummary],
        shortlists: dict[str, list[ShortlistCandidate]],
    ) -> str:
        manifest_paths = ", ".join(file.path for file in manifests) or "none"
        representative_paths = ", ".join(file.path for file in representative_files) or "none"
        shortlist_summary = "; ".join(
            f"{agent}: {', '.join(candidate.path for candidate in candidates[:4]) or 'none'}"
            for agent, candidates in shortlists.items()
        )
        readme_excerpt = readme[:1800]
        return (
            f"Description: {description or 'No description provided.'}\n"
            f"Manifest files: {manifest_paths}\n"
            f"Representative files: {representative_paths}\n"
            f"Specialist shortlists: {shortlist_summary}\n"
            f"README excerpt:\n{readme_excerpt}"
        )[:5000]

    def _build_specialist_shortlists(self, tree: list[RepoFile], incremental_paths: set[str] | None = None) -> dict[str, list[ShortlistCandidate]]:
        source_files = [
            item for item in tree
            if item.type == "blob" and Path(item.path).suffix.lower() in self.priority_suffixes
        ]
        if incremental_paths:
            focused_files = [item for item in source_files if item.path in incremental_paths or any(item.path.startswith(f"{path.rsplit('/', 1)[0]}/") for path in incremental_paths if "/" in path)]
            source_files = focused_files or source_files
        return {
            "architecture": self._select_candidates(source_files, self._architecture_score, limit=8),
            "security": self._select_candidates(source_files, self._security_score, limit=8),
            "qa": self._select_candidates(source_files, self._qa_score, limit=8),
            "performance": self._select_candidates(source_files, self._performance_score, limit=8),
        }

    def _select_candidates(
        self,
        files: list[RepoFile],
        scorer,
        limit: int,
    ) -> list[ShortlistCandidate]:
        ranked: list[tuple[int, str, RepoFile]] = []
        for item in files:
            score, reason = scorer(item.path)
            if score <= 0:
                continue
            ranked.append((score, reason, item))
        ranked.sort(key=lambda item: (-item[0], item[2].path))
        selected = ranked[:limit]
        if not selected:
            fallback = sorted(files, key=lambda item: item.path)[:limit]
            return [ShortlistCandidate(path=item.path, reason="General source coverage fallback.", score=1) for item in fallback]
        return [ShortlistCandidate(path=item.path, reason=reason, score=score) for score, reason, item in selected]

    def _build_agent_contexts(
        self,
        shortlists: dict[str, list[ShortlistCandidate]],
        representative_files: list[FileSummary],
    ) -> AgentContextMap:
        summary_map = {summary.path: summary for summary in representative_files}
        return AgentContextMap(
            architecture=self._build_agent_context(
                "Map components, integration boundaries, and dependency relationships.",
                "Use routing context to reason about system structure from the shortlisted files only.",
                shortlists["architecture"],
                summary_map,
            ),
            security=self._build_agent_context(
                "Inspect auth, secrets, trust boundaries, and risky request handling paths.",
                "Prioritize security-sensitive files and treat missing corroboration as uncertainty rather than a finding.",
                shortlists["security"],
                summary_map,
            ),
            qa=self._build_agent_context(
                "Inspect validation, error handling, tests, and reliability gaps.",
                "Use the shortlisted files to infer edge cases and coverage gaps before making recommendations.",
                shortlists["qa"],
                summary_map,
            ),
            performance=self._build_agent_context(
                "Inspect hot paths, data fetching, expensive loops, and scaling risks.",
                "Focus on runtime-critical flows and avoid generic performance advice without evidence in the shortlisted files.",
                shortlists["performance"],
                summary_map,
            ),
        )

    def _build_agent_context(
        self,
        focus: str,
        strategy: str,
        shortlist: list[ShortlistCandidate],
        summary_map: dict[str, FileSummary],
    ) -> AgentContext:
        paths = [candidate.path for candidate in shortlist]
        summaries = [summary_map[path] for path in paths if path in summary_map]
        return AgentContext(
            focus=focus,
            strategy=strategy,
            target_paths=paths,
            shortlist=shortlist,
            file_summaries=summaries,
        )

    @staticmethod
    def _count_unique_shortlisted_paths(shortlists: dict[str, list[ShortlistCandidate]]) -> int:
        return len({candidate.path for candidates in shortlists.values() for candidate in candidates})

    def _architecture_score(self, path: str) -> tuple[int, str]:
        lowered = path.lower()
        score = 1
        reasons: list[str] = ["General source file relevance."]
        for token, weight, reason in [
            ("app/", 4, "Application entrypoint or routed surface."),
            ("src/", 2, "Core source directory."),
            ("api", 4, "Likely service boundary or route layer."),
            ("component", 3, "Likely component boundary."),
            ("service", 3, "Likely internal service module."),
            ("lib", 2, "Shared infrastructure or utility layer."),
            ("config", 2, "Configuration shapes architecture boundaries."),
            ("index", 2, "Entrypoint often reveals composition."),
        ]:
            if token in lowered:
                score += weight
                reasons = [reason]
        return score, reasons[0]

    def _security_score(self, path: str) -> tuple[int, str]:
        lowered = path.lower()
        score = 0
        reason = "General request handling file."
        for token, weight, token_reason in [
            ("auth", 8, "Authentication and access control path."),
            ("login", 7, "Credential handling path."),
            ("session", 7, "Session management path."),
            ("token", 7, "Token verification or issuance path."),
            ("jwt", 7, "JWT handling path."),
            ("secret", 8, "Secret or sensitive configuration path."),
            ("password", 8, "Password or credential path."),
            ("middleware", 5, "Cross-cutting request enforcement path."),
            ("permission", 6, "Authorization logic path."),
            ("role", 5, "Role or policy enforcement path."),
            ("user", 3, "User-domain path that may contain auth logic."),
        ]:
            if token in lowered:
                score += weight
                reason = token_reason
        if lowered.endswith((".ts", ".tsx", ".js", ".py")) and any(part in lowered for part in ("api", "route", "controller")):
            score += 3
            reason = "Request-facing handler with security relevance."
        return score, reason

    def _qa_score(self, path: str) -> tuple[int, str]:
        lowered = path.lower()
        score = 0
        reason = "General reliability surface."
        for token, weight, token_reason in [
            ("test", 8, "Existing test coverage path."),
            ("spec", 7, "Specification or test file."),
            ("validation", 7, "Validation path with likely edge cases."),
            ("schema", 6, "Schema validation and input constraints."),
            ("form", 4, "User input path with edge-case handling."),
            ("error", 6, "Error handling path."),
            ("exception", 6, "Failure handling path."),
            ("guard", 5, "Boundary or validation guard."),
            ("retry", 5, "Reliability or retry logic."),
        ]:
            if token in lowered:
                score += weight
                reason = token_reason
        if lowered.endswith((".py", ".ts", ".tsx", ".js")) and "api" in lowered:
            score += 3
            reason = "API flow likely needs validation and reliability coverage."
        return score, reason

    def _performance_score(self, path: str) -> tuple[int, str]:
        lowered = path.lower()
        score = 0
        reason = "General runtime path."
        for token, weight, token_reason in [
            ("query", 7, "Query layer with latency and scale implications."),
            ("db", 7, "Database access path."),
            ("cache", 8, "Caching path with clear performance impact."),
            ("render", 6, "Rendering path with user-facing latency impact."),
            ("worker", 6, "Background processing path."),
            ("queue", 6, "Queue or async workload path."),
            ("api", 5, "Remote call path."),
            ("list", 4, "Collection handling path with scaling implications."),
            ("search", 5, "Potentially expensive query or filtering path."),
            ("pagination", 7, "Pagination path tied to scalability."),
        ]:
            if token in lowered:
                score += weight
                reason = token_reason
        if lowered.endswith((".tsx", ".jsx")):
            score += 2
            reason = "UI rendering path with client performance relevance."
        return score, reason

    @staticmethod
    async def _emit(
        progress_callback: ProgressCallback | None,
        agent: str,
        status: str,
        detail: str,
    ) -> None:
        if progress_callback is None:
            return
        maybe_coroutine = progress_callback(AgentProgress(agent=agent, status=status, detail=detail))
        if maybe_coroutine is not None:
            await maybe_coroutine
