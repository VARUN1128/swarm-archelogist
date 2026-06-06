from pathlib import Path

from app.schemas.analysis import StaffEngineerReview
from app.schemas.common import RepositoryContext
from app.schemas.patching import PatchProposal, PatchValidationReport, PullRequestDraft
from app.services.openai_service import OpenAIService


class PRService:
    def __init__(self, openai_service: OpenAIService) -> None:
        self.openai_service = openai_service

    async def generate_pr_draft(
        self,
        repository_context: RepositoryContext,
        review: StaffEngineerReview,
        patches: list[PatchProposal],
        validation_report: PatchValidationReport,
    ) -> PullRequestDraft:
        prompt_path = Path(__file__).resolve().parents[2] / "prompts" / "pr_generator.txt"
        prompt = prompt_path.read_text(encoding="utf-8")
        return await self.openai_service.generate_structured_output(
            system_prompt=prompt,
            user_payload={
                "repository_context": repository_context.model_dump(),
                "review": review.model_dump(),
                "patches": [patch.model_dump() for patch in patches],
                "validation_report": validation_report.model_dump(),
            },
            response_model=PullRequestDraft,
        )
