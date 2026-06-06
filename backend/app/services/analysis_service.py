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
from app.services.session_store import SessionStore

ProgressCallback = Callable[[AgentProgress], Awaitable[None] | None]


class AnalysisService:
    def __init__(
        self,
        context_builder: RepositoryContextBuilder,
        orchestrator: ReviewOrchestrator,
        patch_service: PatchService,
        pr_service: PRService,
        session_store: SessionStore,
    ) -> None:
        self.context_builder = context_builder
        self.orchestrator = orchestrator
        self.patch_service = patch_service
        self.pr_service = pr_service
        self.session_store = session_store

    async def analyze_repository(self, request: AnalyzeRepositoryRequest) -> AnalyzeRepositoryResponse:
        return await self.analyze_repository_with_progress(request)

    async def analyze_repository_with_progress(
        self,
        request: AnalyzeRepositoryRequest,
        progress_callback: ProgressCallback | None = None,
    ) -> AnalyzeRepositoryResponse:
        repository_context = await self.context_builder.build(
            str(request.repository_url) if request.repository_url else None,
            request.local_root_path,
            incremental=request.incremental,
            progress_callback=progress_callback,
        )
        progress, architecture_report, security_report, qa_report, performance_report, staff_engineer_review = await self.orchestrator.run(
            repository_context,
            progress_callback=progress_callback,
        )
        response = AnalyzeRepositoryResponse(
            session_id="",
            share_id="",
            repository_context=repository_context,
            progress=progress,
            architecture_report=architecture_report,
            security_report=security_report,
            qa_report=qa_report,
            performance_report=performance_report,
            staff_engineer_review=staff_engineer_review,
        )
        selected_ids = [finding.id for finding in staff_engineer_review.approved_findings]
        session = self.session_store.create_session(response, selected_ids)
        return session.analysis

    async def generate_fixes(self, request: GenerateFixesRequest) -> GenerateFixesResponse:
        selected_ids = set(request.selected_finding_ids or [finding.id for finding in request.review.approved_findings])
        filtered_review = request.review.model_copy(
            update={"approved_findings": [finding for finding in request.review.approved_findings if finding.id in selected_ids]}
        )
        patches = await self.patch_service.generate_patches(request.repository_context, filtered_review)
        validation_report = self.patch_service.validate_patches(request.repository_context, patches)
        response = GenerateFixesResponse(patches=patches, validation_report=validation_report)
        if request.session_id:
            self.session_store.update_selected_findings(request.session_id, list(selected_ids))
            self.session_store.update_fixes(request.session_id, response)
        return response

    async def generate_pr(self, request: GeneratePRRequest) -> GeneratePRResponse:
        draft = await self.pr_service.generate_pr_draft(
            repository_context=request.repository_context,
            review=request.review,
            patches=request.patches,
            validation_report=request.validation_report,
        )
        response = GeneratePRResponse(pr_draft=draft)
        if request.session_id:
            self.session_store.update_pr(request.session_id, response)
        return response
