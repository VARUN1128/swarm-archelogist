import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from app.schemas.api import (
    AnalyzeRepositoryResponse,
    GenerateFixesResponse,
    GeneratePRResponse,
    SessionRecord,
    SessionSummary,
)


class SessionStore:
    def __init__(self) -> None:
        self.store_path = Path(__file__).resolve().parents[2] / "data" / "analysis_sessions.json"
        self.store_path.parent.mkdir(parents=True, exist_ok=True)

    def create_session(self, analysis: AnalyzeRepositoryResponse, selected_finding_ids: list[str]) -> SessionRecord:
        sessions = self._load()
        session_id = str(uuid4())
        share_id = str(uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        analysis_with_session = analysis.model_copy(update={"session_id": session_id, "share_id": share_id})
        record = SessionRecord(
            summary=SessionSummary(
                session_id=session_id,
                share_id=share_id,
                repository_url=analysis.repository_context.repository_url,
                repository_name=analysis.repository_context.metadata.full_name,
                created_at=timestamp,
                updated_at=timestamp,
                approved_findings_count=len(selected_finding_ids),
                patch_count=0,
                has_pr_draft=False,
            ),
            analysis=analysis_with_session,
            selected_finding_ids=selected_finding_ids,
            fixes=None,
            pr=None,
        )
        sessions.append(record)
        self._save(sessions)
        return record

    def list_sessions(self) -> list[SessionSummary]:
        sessions = self._load()
        return [session.summary for session in sorted(sessions, key=lambda item: item.summary.updated_at, reverse=True)]

    def get_session(self, session_id: str) -> SessionRecord | None:
        sessions = self._load()
        return next((session for session in sessions if session.summary.session_id == session_id), None)

    def get_session_by_share_id(self, share_id: str) -> SessionRecord | None:
        sessions = self._load()
        return next((session for session in sessions if session.summary.share_id == share_id), None)

    def update_selected_findings(self, session_id: str, selected_finding_ids: list[str]) -> SessionRecord | None:
        sessions = self._load()
        updated = None
        for index, session in enumerate(sessions):
            if session.summary.session_id != session_id:
                continue
            updated = session.model_copy(
                update={
                    "selected_finding_ids": selected_finding_ids,
                    "summary": session.summary.model_copy(
                        update={
                            "approved_findings_count": len(selected_finding_ids),
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ),
                }
            )
            sessions[index] = updated
            break
        if updated is not None:
            self._save(sessions)
        return updated

    def update_fixes(self, session_id: str, fixes: GenerateFixesResponse) -> SessionRecord | None:
        sessions = self._load()
        updated = None
        for index, session in enumerate(sessions):
            if session.summary.session_id != session_id:
                continue
            updated = session.model_copy(
                update={
                    "fixes": fixes,
                    "summary": session.summary.model_copy(
                        update={
                            "patch_count": len(fixes.patches),
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ),
                }
            )
            sessions[index] = updated
            break
        if updated is not None:
            self._save(sessions)
        return updated

    def update_pr(self, session_id: str, pr: GeneratePRResponse) -> SessionRecord | None:
        sessions = self._load()
        updated = None
        for index, session in enumerate(sessions):
            if session.summary.session_id != session_id:
                continue
            updated = session.model_copy(
                update={
                    "pr": pr,
                    "summary": session.summary.model_copy(
                        update={
                            "has_pr_draft": True,
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ),
                }
            )
            sessions[index] = updated
            break
        if updated is not None:
            self._save(sessions)
        return updated

    def _load(self) -> list[SessionRecord]:
        if not self.store_path.exists():
            return []
        raw = json.loads(self.store_path.read_text(encoding="utf-8"))
        return [SessionRecord.model_validate(item) for item in raw]

    def _save(self, sessions: list[SessionRecord]) -> None:
        payload = [session.model_dump(mode="json") for session in sessions]
        self.store_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
