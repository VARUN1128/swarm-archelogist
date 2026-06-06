import subprocess
from pathlib import Path

from app.core.exceptions import ApplicationError
from app.schemas.api import IncrementalAnalysisOptions
from app.schemas.common import RepoFile, RepositoryMetadata


class LocalRepositoryService:
    def __init__(self) -> None:
        self.ignored_directories = {
            ".git",
            "node_modules",
            ".venv",
            "venv",
            "__pycache__",
            ".next",
            "dist",
            "build",
        }
        self.readme_names = ("README.md", "README.txt", "README.rst", "readme.md")

    def parse_local_root(self, local_root_path: str) -> Path:
        root = Path(local_root_path).expanduser().resolve()
        if not root.exists() or not root.is_dir():
            raise ApplicationError("Local repository path does not exist or is not a directory.", "invalid_local_repository_path")
        return root

    def get_repository_metadata(self, root: Path) -> RepositoryMetadata:
        branch = self._get_current_branch(root)
        return RepositoryMetadata(
            owner="local",
            name=root.name,
            full_name=f"local/{root.name}",
            default_branch=branch,
            description=f"Local repository analysis for {root}",
            primary_language=None,
            stars=0,
            forks=0,
            open_issues=0,
            topics=["local"],
        )

    def get_readme(self, root: Path) -> str:
        for name in self.readme_names:
            candidate = root / name
            if candidate.exists() and candidate.is_file():
                return candidate.read_text(encoding="utf-8", errors="ignore")
        return ""

    def get_tree(self, root: Path) -> list[RepoFile]:
        files: list[RepoFile] = []
        for path in root.rglob("*"):
            if any(part in self.ignored_directories for part in path.parts):
                continue
            if not path.is_file():
                continue
            relative_path = path.relative_to(root).as_posix()
            stat = path.stat()
            files.append(RepoFile(path=relative_path, type="blob", sha=None, size=stat.st_size))
        return sorted(files, key=lambda item: item.path)

    def get_file_content(self, root: Path, relative_path: str) -> str:
        target = (root / relative_path).resolve()
        if not str(target).startswith(str(root)):
            raise ApplicationError("Requested file is outside the local repository root.", "invalid_local_repository_file")
        if not target.exists() or not target.is_file():
            return ""
        return target.read_text(encoding="utf-8", errors="ignore")

    def resolve_incremental_paths(
        self,
        root: Path,
        incremental: IncrementalAnalysisOptions | None,
    ) -> set[str] | None:
        if incremental is None or incremental.mode == "full":
            return None
        if incremental.mode == "changed_files" and incremental.changed_files:
            return set(incremental.changed_files)
        if incremental.mode == "diff" and incremental.base_ref and incremental.head_ref:
            output = subprocess.run(
                ["git", "-C", str(root), "diff", "--name-only", f"{incremental.base_ref}..{incremental.head_ref}"],
                capture_output=True,
                text=True,
                check=False,
            )
            if output.returncode != 0:
                raise ApplicationError(
                    f"Unable to compute local git diff: {output.stderr.strip() or 'unknown error'}",
                    "local_git_diff_failed",
                )
            return {line.strip() for line in output.stdout.splitlines() if line.strip()}
        if incremental.mode == "pull_request":
            raise ApplicationError(
                "Pull request mode requires a GitHub repository URL. Use full or diff mode for local-only analysis.",
                "local_pull_request_mode_unsupported",
            )
        return None

    def _get_current_branch(self, root: Path) -> str:
        output = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            check=False,
        )
        if output.returncode != 0:
            return "HEAD"
        branch = output.stdout.strip()
        return branch or "HEAD"
