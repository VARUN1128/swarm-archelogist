import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from app.schemas.api import AnalyzeRepositoryResponse, AnalysisJobStatusResponse
from app.schemas.common import AgentProgress


class AnalysisJobRecord:
    def __init__(self, job_id: str) -> None:
        self.job_id = job_id
        self.status = "queued"
        self.progress: list[AgentProgress] = [
            AgentProgress(agent="queue", status="queued", detail="Analysis job created and waiting to start.")
        ]
        self.result: AnalyzeRepositoryResponse | None = None
        self.error: str | None = None
        self.updated_at = datetime.now(timezone.utc)


class AnalysisJobManager:
    def __init__(self) -> None:
        self._jobs: dict[str, AnalysisJobRecord] = {}
        self._lock = asyncio.Lock()

    async def create_job(self) -> AnalysisJobStatusResponse:
        async with self._lock:
            job_id = str(uuid4())
            record = AnalysisJobRecord(job_id=job_id)
            self._jobs[job_id] = record
            return self._to_response(record)

    async def append_progress(self, job_id: str, progress: AgentProgress) -> None:
        async with self._lock:
            record = self._jobs[job_id]
            record.progress.append(progress)
            if progress.status == "running":
                record.status = "running"
            if progress.status == "failed":
                record.status = "failed"
            record.updated_at = datetime.now(timezone.utc)

    async def set_running(self, job_id: str) -> None:
        await self.append_progress(
            job_id,
            AgentProgress(agent="orchestrator", status="running", detail="Starting repository analysis pipeline."),
        )

    async def set_result(self, job_id: str, result: AnalyzeRepositoryResponse) -> None:
        async with self._lock:
            record = self._jobs[job_id]
            record.result = result
            record.status = "completed"
            record.progress.append(
                AgentProgress(agent="orchestrator", status="completed", detail="Analysis completed successfully.")
            )
            record.updated_at = datetime.now(timezone.utc)

    async def set_error(self, job_id: str, message: str) -> None:
        async with self._lock:
            record = self._jobs[job_id]
            record.error = message
            record.status = "failed"
            record.progress.append(
                AgentProgress(agent="orchestrator", status="failed", detail=message)
            )
            record.updated_at = datetime.now(timezone.utc)

    async def get_job(self, job_id: str) -> AnalysisJobStatusResponse | None:
        async with self._lock:
            record = self._jobs.get(job_id)
            if record is None:
                return None
            return self._to_response(record)

    def _to_response(self, record: AnalysisJobRecord) -> AnalysisJobStatusResponse:
        return AnalysisJobStatusResponse(
            job_id=record.job_id,
            status=record.status,
            progress=record.progress,
            result=record.result,
            error=record.error,
        )
