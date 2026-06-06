from pydantic import Field, HttpUrl

from app.schemas.analysis import (
    ArchitectureReport,
    PerformanceReport,
    QAReport,
    SecurityReport,
    StaffEngineerReview,
)
from app.schemas.common import AgentProgress, Finding, RepositoryContext
from app.schemas.patching import (
    ApplyPatchesReport,
    PatchExecutionValidationReport,
    PatchProposal,
    PatchValidationReport,
    PullRequestDraft,
)
from app.schemas.common import StrictBaseModel


class IncrementalAnalysisOptions(StrictBaseModel):
    mode: str = "full"
    base_ref: str | None = None
    head_ref: str | None = None
    pull_request_number: int | None = None
    changed_files: list[str] = Field(default_factory=list)


class AnalyzeRepositoryRequest(StrictBaseModel):
    repository_url: HttpUrl
    incremental: IncrementalAnalysisOptions | None = None


class AnalyzeRepositoryResponse(StrictBaseModel):
    session_id: str
    share_id: str
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
    session_id: str | None = None
    repository_context: RepositoryContext
    review: StaffEngineerReview
    selected_finding_ids: list[str] = Field(default_factory=list)


class GenerateFixesResponse(StrictBaseModel):
    patches: list[PatchProposal]
    validation_report: PatchValidationReport


class GeneratePRRequest(StrictBaseModel):
    session_id: str | None = None
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


class ValidateApprovedPatchesRequest(StrictBaseModel):
    local_root_path: str
    patches: list[PatchProposal]
    lint_command: str | None = None
    test_command: str | None = None


class ValidateApprovedPatchesResponse(StrictBaseModel):
    report: PatchExecutionValidationReport


class SessionSummary(StrictBaseModel):
    session_id: str
    share_id: str
    repository_url: str
    repository_name: str
    created_at: str
    updated_at: str
    approved_findings_count: int
    patch_count: int
    has_pr_draft: bool


class SessionRecord(StrictBaseModel):
    summary: SessionSummary
    analysis: AnalyzeRepositoryResponse
    selected_finding_ids: list[str]
    fixes: GenerateFixesResponse | None = None
    pr: GeneratePRResponse | None = None


class SessionListResponse(StrictBaseModel):
    sessions: list[SessionSummary]


class SessionResponse(StrictBaseModel):
    session: SessionRecord
