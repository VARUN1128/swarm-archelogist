import asyncio
from typing import Awaitable, Callable

from app.agents.specialists import ArchitectAgent, PerformanceAgent, QAAgent, SecurityAgent
from app.agents.staff_engineer import StaffEngineerAgent
from app.schemas.analysis import (
    ArchitectureReport,
    PerformanceReport,
    QAReport,
    SecurityReport,
    StaffEngineerReview,
)
from app.schemas.common import AgentProgress, Finding, RepositoryContext
from app.services.openai_service import OpenAIService

ProgressCallback = Callable[[AgentProgress], Awaitable[None] | None]


class ReviewOrchestrator:
    def __init__(self, openai_service: OpenAIService) -> None:
        self.architect_agent = ArchitectAgent(openai_service=openai_service)
        self.security_agent = SecurityAgent(openai_service=openai_service)
        self.qa_agent = QAAgent(openai_service=openai_service)
        self.performance_agent = PerformanceAgent(openai_service=openai_service)
        self.staff_engineer_agent = StaffEngineerAgent(openai_service=openai_service)

    async def run(
        self,
        repository_context: RepositoryContext,
        progress_callback: ProgressCallback | None = None,
    ) -> tuple[
        list[AgentProgress],
        ArchitectureReport,
        SecurityReport,
        QAReport,
        PerformanceReport,
        StaffEngineerReview,
    ]:
        progress = [
            AgentProgress(agent="context_builder", status="completed", detail="Repository context condensed for AI analysis."),
            AgentProgress(agent="architect", status="running", detail=f"Inspecting repository architecture across {len(repository_context.agent_contexts.architecture.target_paths)} shortlisted files."),
            AgentProgress(agent="security", status="running", detail=f"Scanning {len(repository_context.agent_contexts.security.target_paths)} security-sensitive files for vulnerabilities and risky patterns."),
            AgentProgress(agent="qa", status="running", detail=f"Reviewing {len(repository_context.agent_contexts.qa.target_paths)} reliability-focused files for test and edge-case gaps."),
            AgentProgress(agent="performance", status="running", detail=f"Inspecting {len(repository_context.agent_contexts.performance.target_paths)} performance-critical files for bottlenecks."),
        ]
        await self._emit_initial_progress(progress_callback, progress[1:])
        architecture_report, security_report, qa_report, performance_report = await asyncio.gather(
            self._run_agent(
                self.architect_agent.run(
                    repository_context,
                    focused_context=repository_context.agent_contexts.architecture.model_dump(),
                ),
                progress_callback,
                "architect",
                "Architecture review finished.",
            ),
            self._run_agent(
                self.security_agent.run(
                    repository_context,
                    focused_context=repository_context.agent_contexts.security.model_dump(),
                ),
                progress_callback,
                "security",
                "Security review finished.",
            ),
            self._run_agent(
                self.qa_agent.run(
                    repository_context,
                    focused_context=repository_context.agent_contexts.qa.model_dump(),
                ),
                progress_callback,
                "qa",
                "QA review finished.",
            ),
            self._run_agent(
                self.performance_agent.run(
                    repository_context,
                    focused_context=repository_context.agent_contexts.performance.model_dump(),
                ),
                progress_callback,
                "performance",
                "Performance review finished.",
            ),
        )
        progress = [
            AgentProgress(agent="context_builder", status="completed", detail="Repository context condensed for AI analysis."),
            AgentProgress(agent="architect", status="completed", detail="Architecture report generated."),
            AgentProgress(agent="security", status="completed", detail="Security report generated."),
            AgentProgress(agent="qa", status="completed", detail="QA report generated."),
            AgentProgress(agent="performance", status="completed", detail="Performance report generated."),
            AgentProgress(agent="staff_engineer", status="running", detail="Validating and prioritizing findings."),
        ]
        await self._emit(progress_callback, progress[-1])
        findings: list[Finding] = [
            *security_report.findings,
            *qa_report.findings,
            *performance_report.findings,
        ]
        supplemental_context = str(
            {
                "architecture_report": architecture_report.model_dump(),
                "aggregated_findings": [finding.model_dump() for finding in findings],
                "specialist_inputs": repository_context.agent_contexts.model_dump(),
            }
        )
        staff_review = await self.staff_engineer_agent.run(
            repository_context,
            focused_context={
                "approved_review_scope": "Staff Engineer should validate findings using specialist outputs rather than re-reading the full repository.",
                "optimization": repository_context.optimization.model_dump(),
            },
            supplemental_context=supplemental_context,
        )
        progress[-1] = AgentProgress(agent="staff_engineer", status="completed", detail="Approved, rejected, and prioritized findings.")
        await self._emit(progress_callback, progress[-1])
        return progress, architecture_report, security_report, qa_report, performance_report, staff_review

    async def _run_agent(
        self,
        coroutine,
        progress_callback: ProgressCallback | None,
        agent: str,
        completed_detail: str,
    ):
        result = await coroutine
        await self._emit(progress_callback, AgentProgress(agent=agent, status="completed", detail=completed_detail))
        return result

    async def _emit_initial_progress(
        self,
        progress_callback: ProgressCallback | None,
        progress_items: list[AgentProgress],
    ) -> None:
        for progress in progress_items:
            await self._emit(progress_callback, progress)

    @staticmethod
    async def _emit(progress_callback: ProgressCallback | None, progress: AgentProgress) -> None:
        if progress_callback is None:
            return
        maybe_coroutine = progress_callback(progress)
        if maybe_coroutine is not None:
            await maybe_coroutine
