import asyncio

from fastapi import APIRouter, Depends
from fastapi import HTTPException, status

from app.core.dependencies import (
    get_analysis_job_manager,
    get_analysis_service,
    get_apply_service,
    get_session_store,
    get_validation_service,
)
from app.schemas.api import (
    ApplyApprovedPatchesRequest,
    ApplyApprovedPatchesResponse,
    AnalyzeRepositoryRequest,
    AnalyzeRepositoryResponse,
    AnalysisJobStartResponse,
    AnalysisJobStatusResponse,
    GenerateFixesRequest,
    GenerateFixesResponse,
    GeneratePRRequest,
    GeneratePRResponse,
    SessionListResponse,
    SessionResponse,
    ValidateApprovedPatchesRequest,
    ValidateApprovedPatchesResponse,
)
from app.services.analysis_jobs import AnalysisJobManager
from app.services.analysis_service import AnalysisService
from app.services.apply_service import ApplyService
from app.services.session_store import SessionStore
from app.services.validation_service import ValidationService

router = APIRouter(tags=["review"])


@router.post("/analyze", response_model=AnalyzeRepositoryResponse)
async def analyze_repository(
    request: AnalyzeRepositoryRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> AnalyzeRepositoryResponse:
    return await service.analyze_repository(request)


@router.post("/analyze-jobs", response_model=AnalysisJobStartResponse)
async def create_analysis_job(
    request: AnalyzeRepositoryRequest,
    service: AnalysisService = Depends(get_analysis_service),
    job_manager: AnalysisJobManager = Depends(get_analysis_job_manager),
) -> AnalysisJobStartResponse:
    job = await job_manager.create_job()
    asyncio.create_task(_run_analysis_job(job.job_id, request, service, job_manager))
    return AnalysisJobStartResponse(job_id=job.job_id, status=job.status, progress=job.progress)


@router.get("/analyze-jobs/{job_id}", response_model=AnalysisJobStatusResponse)
async def get_analysis_job(
    job_id: str,
    job_manager: AnalysisJobManager = Depends(get_analysis_job_manager),
) -> AnalysisJobStatusResponse:
    job = await job_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")
    return job


@router.post("/generate-fixes", response_model=GenerateFixesResponse)
async def generate_fixes(
    request: GenerateFixesRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> GenerateFixesResponse:
    return await service.generate_fixes(request)


@router.post("/generate-pr", response_model=GeneratePRResponse)
async def generate_pr(
    request: GeneratePRRequest,
    service: AnalysisService = Depends(get_analysis_service),
) -> GeneratePRResponse:
    return await service.generate_pr(request)


@router.post("/apply-approved-patches", response_model=ApplyApprovedPatchesResponse)
async def apply_approved_patches(
    request: ApplyApprovedPatchesRequest,
    service: ApplyService = Depends(get_apply_service),
) -> ApplyApprovedPatchesResponse:
    report = service.apply_patches(
        local_root_path=request.local_root_path,
        patches=request.patches,
        create_backup=request.create_backup,
        force_overwrite=request.force_overwrite,
    )
    return ApplyApprovedPatchesResponse(report=report)


@router.post("/validate-approved-patches", response_model=ValidateApprovedPatchesResponse)
async def validate_approved_patches(
    request: ValidateApprovedPatchesRequest,
    service: ValidationService = Depends(get_validation_service),
) -> ValidateApprovedPatchesResponse:
    report = service.validate_with_execution(
        local_root_path=request.local_root_path,
        patches=request.patches,
        lint_command=request.lint_command,
        test_command=request.test_command,
    )
    return ValidateApprovedPatchesResponse(report=report)


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(service: SessionStore = Depends(get_session_store)) -> SessionListResponse:
    return SessionListResponse(sessions=service.list_sessions())


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, service: SessionStore = Depends(get_session_store)) -> SessionResponse:
    session = service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    return SessionResponse(session=session)


@router.get("/shared/{share_id}", response_model=SessionResponse)
async def get_shared_session(share_id: str, service: SessionStore = Depends(get_session_store)) -> SessionResponse:
    session = service.get_session_by_share_id(share_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared session not found.")
    return SessionResponse(session=session)


async def _run_analysis_job(
    job_id: str,
    request: AnalyzeRepositoryRequest,
    service: AnalysisService,
    job_manager: AnalysisJobManager,
) -> None:
    try:
        await job_manager.set_running(job_id)
        result = await service.analyze_repository_with_progress(
            request,
            progress_callback=lambda progress: job_manager.append_progress(job_id, progress),
        )
        await job_manager.set_result(job_id, result)
    except Exception as exc:
        await job_manager.set_error(job_id, str(exc))
