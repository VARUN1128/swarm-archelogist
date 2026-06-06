from app.services.analysis_service import AnalysisService
from app.services.analysis_jobs import AnalysisJobManager
from app.services.apply_service import ApplyService
from app.services.github_service import GitHubService
from app.services.local_repository_service import LocalRepositoryService
from app.services.openai_service import OpenAIService
from app.services.orchestrator import ReviewOrchestrator
from app.services.patch_service import PatchService
from app.services.pr_service import PRService
from app.services.repository_context import RepositoryContextBuilder
from app.services.session_store import SessionStore
from app.services.validation_service import ValidationService

analysis_job_manager = AnalysisJobManager()
apply_service = ApplyService()
session_store = SessionStore()
validation_service = ValidationService(apply_service=apply_service)


def get_analysis_service() -> AnalysisService:
    github_service = GitHubService()
    local_repository_service = LocalRepositoryService()
    openai_service = OpenAIService()
    context_builder = RepositoryContextBuilder(
        github_service=github_service,
        local_repository_service=local_repository_service,
    )
    orchestrator = ReviewOrchestrator(openai_service=openai_service)
    patch_service = PatchService(openai_service=openai_service, github_service=github_service)
    pr_service = PRService(openai_service=openai_service)
    return AnalysisService(
        context_builder=context_builder,
        orchestrator=orchestrator,
        patch_service=patch_service,
        pr_service=pr_service,
        session_store=session_store,
    )


def get_analysis_job_manager() -> AnalysisJobManager:
    return analysis_job_manager


def get_apply_service() -> ApplyService:
    return apply_service


def get_session_store() -> SessionStore:
    return session_store


def get_validation_service() -> ValidationService:
    return validation_service
