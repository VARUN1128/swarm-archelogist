from app.schemas.common import StrictBaseModel


class PatchDraft(StrictBaseModel):
    file: str
    issue: str
    explanation: str
    patch_diff: str
    impact: str
    risk: str


class PatchProposal(PatchDraft):
    change_type: str
    original_content: str
    proposed_content: str


class PatchValidationIssue(StrictBaseModel):
    patch_file: str
    message: str


class PatchValidationReport(StrictBaseModel):
    valid: bool
    issues: list[PatchValidationIssue]


class PullRequestDraft(StrictBaseModel):
    title: str
    summary: str
    modified_files: list[str]
    impact: str
    risk_assessment: str
    engineering_rationale: str
    markdown: str


class AppliedPatchResult(StrictBaseModel):
    file: str
    status: str
    action: str
    message: str
    backup_path: str | None = None


class ApplyPatchesReport(StrictBaseModel):
    target_root_path: str
    applied_count: int
    skipped_count: int
    results: list[AppliedPatchResult]
