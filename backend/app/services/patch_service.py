import re
from pathlib import Path

from app.core.exceptions import ApplicationError
from app.schemas.analysis import StaffEngineerReview
from app.schemas.common import RepositoryContext, StrictBaseModel
from app.schemas.patching import PatchDraft, PatchProposal, PatchValidationIssue, PatchValidationReport
from app.services.github_service import GitHubService
from app.services.openai_service import OpenAIService


class PatchBatchResponse(PatchValidationReport):
    patches: list[PatchProposal]


class PatchGenerationResponse(PatchValidationReport):
    patches: list[PatchProposal]


class PatchService:
    def __init__(self, openai_service: OpenAIService, github_service: GitHubService) -> None:
        self.openai_service = openai_service
        self.github_service = github_service

    async def generate_patches(
        self,
        repository_context: RepositoryContext,
        review: StaffEngineerReview,
    ) -> list[PatchProposal]:
        prompt_path = Path(__file__).resolve().parents[2] / "prompts" / "patch_generator.txt"
        prompt = prompt_path.read_text(encoding="utf-8")
        response = await self.openai_service.generate_structured_output(
            system_prompt=prompt,
            user_payload={
                "repository_context": repository_context.model_dump(),
                "approved_findings": [finding.model_dump() for finding in review.approved_findings],
            },
            response_model=PatchListResponse,
        )
        enriched_patches: list[PatchProposal] = []
        structure_paths = {entry.path for entry in repository_context.structure}
        for patch in response.patches:
            original_content = await self._get_original_content(repository_context, patch.file)
            proposed_content = self._apply_unified_diff(original_content, patch.patch_diff)
            enriched_patches.append(
                PatchProposal(
                    **patch.model_dump(),
                    change_type="create" if patch.file not in structure_paths else "modify",
                    original_content=original_content,
                    proposed_content=proposed_content,
                )
            )
        return enriched_patches

    def validate_patches(
        self,
        repository_context: RepositoryContext,
        patches: list[PatchProposal],
    ) -> PatchValidationReport:
        structure_paths = {entry.path for entry in repository_context.structure}
        issues: list[PatchValidationIssue] = []
        for patch in patches:
            if patch.change_type != "create" and patch.file not in structure_paths:
                issues.append(PatchValidationIssue(patch_file=patch.file, message="Patch targets a file not present in repository structure."))
            if not patch.patch_diff.startswith("---"):
                issues.append(PatchValidationIssue(patch_file=patch.file, message="Patch diff must start with unified diff header."))
            if "@@" not in patch.patch_diff:
                issues.append(PatchValidationIssue(patch_file=patch.file, message="Patch diff is missing a hunk header."))
            if not patch.issue.strip() or not patch.explanation.strip():
                issues.append(PatchValidationIssue(patch_file=patch.file, message="Patch metadata is incomplete."))
            if not patch.proposed_content.strip():
                issues.append(PatchValidationIssue(patch_file=patch.file, message="Patch could not be expanded into proposed file content."))
        return PatchValidationReport(valid=not issues, issues=issues)

    async def _get_original_content(self, repository_context: RepositoryContext, path: str) -> str:
        if repository_context.source_type == "local" and repository_context.local_root_path:
            local_path = Path(repository_context.local_root_path) / path
            if not local_path.exists() or not local_path.is_file():
                return ""
            return local_path.read_text(encoding="utf-8", errors="ignore")
        try:
            return await self.github_service.get_file_content(repository_context.metadata.owner, repository_context.metadata.name, path)
        except ApplicationError as exc:
            if exc.code == "github_not_found":
                return ""
            raise

    def _apply_unified_diff(self, original_content: str, patch_diff: str) -> str:
        lines = original_content.splitlines()
        output: list[str] = []
        source_index = 0
        diff_lines = patch_diff.splitlines()
        hunk_pattern = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")
        line_index = 0

        while line_index < len(diff_lines):
            line = diff_lines[line_index]
            match = hunk_pattern.match(line)
            if match is None:
                line_index += 1
                continue

            old_start = int(match.group(1))
            while source_index < max(old_start - 1, 0) and source_index < len(lines):
                output.append(lines[source_index])
                source_index += 1

            line_index += 1
            while line_index < len(diff_lines) and not diff_lines[line_index].startswith("@@"):
                diff_line = diff_lines[line_index]
                if not diff_line:
                    output.append("")
                    source_index += 1
                    line_index += 1
                    continue
                marker = diff_line[0]
                content = diff_line[1:]
                if marker == " ":
                    if source_index < len(lines):
                        output.append(lines[source_index])
                    else:
                        output.append(content)
                    source_index += 1
                elif marker == "-":
                    source_index += 1
                elif marker == "+":
                    output.append(content)
                line_index += 1

        while source_index < len(lines):
            output.append(lines[source_index])
            source_index += 1

        return "\n".join(output).strip("\n")


class PatchListResponse(StrictBaseModel):
    patches: list[PatchDraft]
