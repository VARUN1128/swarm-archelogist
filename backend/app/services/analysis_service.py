from typing import Awaitable, Callable

from app.schemas.api import (
    AnalyzeRepositoryRequest,
    AnalyzeRepositoryResponse,
    GenerateFixesRequest,
    GenerateFixesResponse,
    GeneratePRRequest,
    GeneratePRResponse,
)
from app.schemas.common import AgentProgress
from app.services.orchestrator import ReviewOrchestrator
from app.services.patch_service import PatchService
from app.services.pr_service import PRService
from app.services.repository_context import RepositoryContextBuilder

ProgressCallback = Callable[[AgentProgress], Awaitable[None] | None]


class AnalysisService:
    def __init__(
        self,
        context_builder: RepositoryContextBuilder,
        orchestrator: ReviewOrchestrator,
        patch_service: PatchService,
        pr_service: PRService,
    ) -> None:
        self.context_builder = context_builder
        self.orchestrator = orchestrator
        self.patch_service = patch_service
        self.pr_service = pr_service

    async def analyze_repository(self, request: AnalyzeRepositoryRequest) -> AnalyzeRepositoryResponse:
        return await self.analyze_repository_with_progress(request)

    async def analyze_repository_with_progress(
        self,
        request: AnalyzeRepositoryRequest,
        progress_callback: ProgressCallback | None = None,
    ) -> AnalyzeRepositoryResponse:
        repository_context = await self.context_builder.build(str(request.repository_url), progress_callback=progress_callback)
        progress, architecture_report, security_report, qa_report, performance_report, staff_engineer_review = await self.orchestrator.run(
            repository_context,
            progress_callback=progress_callback,
        )
        return AnalyzeRepositoryResponse(
            repository_context=repository_context,
            progress=progress,
            architecture_report=architecture_report,
            security_report=security_report,
            qa_report=qa_report,
            performance_report=performance_report,
            staff_engineer_review=staff_engineer_review,
        )

    async def generate_fixes(self, request: GenerateFixesRequest) -> GenerateFixesResponse:
        patches = await self.patch_service.generate_patches(request.repository_context, request.review)
        validation_report = self.patch_service.validate_patches(request.repository_context, patches)
        return GenerateFixesResponse(patches=patches, validation_report=validation_report)

    async def generate_pr(self, request: GeneratePRRequest) -> GeneratePRResponse:
        draft = await self.pr_service.generate_pr_draft(
            repository_context=request.repository_context,
            review=request.review,
            patches=request.patches,
            validation_report=request.validation_report,
        )
        return GeneratePRResponse(pr_draft=draft)
