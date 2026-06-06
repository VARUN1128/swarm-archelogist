from pydantic import HttpUrl

from app.schemas.analysis import (
    ArchitectureReport,
    PerformanceReport,
    QAReport,
    SecurityReport,
    StaffEngineerReview,
)
from app.schemas.common import AgentProgress, RepositoryContext
from app.schemas.patching import ApplyPatchesReport, PatchProposal, PatchValidationReport, PullRequestDraft
from app.schemas.common import StrictBaseModel


class AnalyzeRepositoryRequest(StrictBaseModel):
    repository_url: HttpUrl


class AnalyzeRepositoryResponse(StrictBaseModel):
    repository_context: RepositoryContext
    progress: list[AgentProgress]
    architecture_report: ArchitectureReport
    security_report: SecurityReport
    qa_report: QAReport
    performance_report: PerformanceReport
    staff_engineer_review: StaffEngineerReview


class AnalysisJobStartResponse(StrictBaseModel):
    job_id: str
    status: str
    progress: list[AgentProgress]


class AnalysisJobStatusResponse(StrictBaseModel):
    job_id: str
    status: str
    progress: list[AgentProgress]
    result: AnalyzeRepositoryResponse | None = None
    error: str | None = None


class GenerateFixesRequest(StrictBaseModel):
    repository_context: RepositoryContext
    review: StaffEngineerReview


class GenerateFixesResponse(StrictBaseModel):
    patches: list[PatchProposal]
    validation_report: PatchValidationReport


class GeneratePRRequest(StrictBaseModel):
    repository_context: RepositoryContext
    review: StaffEngineerReview
    patches: list[PatchProposal]
    validation_report: PatchValidationReport


class GeneratePRResponse(StrictBaseModel):
    pr_draft: PullRequestDraft


class ApplyApprovedPatchesRequest(StrictBaseModel):
    local_root_path: str
    patches: list[PatchProposal]
    create_backup: bool = True
    force_overwrite: bool = False


class ApplyApprovedPatchesResponse(StrictBaseModel):
    report: ApplyPatchesReport
