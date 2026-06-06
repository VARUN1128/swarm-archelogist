import shutil
import subprocess
import tempfile
from pathlib import Path

from app.schemas.patching import ExecutionCommandResult, PatchExecutionValidationReport, PatchProposal
from app.services.apply_service import ApplyService


class ValidationService:
    def __init__(self, apply_service: ApplyService) -> None:
        self.apply_service = apply_service

    def validate_with_execution(
        self,
        local_root_path: str,
        patches: list[PatchProposal],
        lint_command: str | None = None,
        test_command: str | None = None,
    ) -> PatchExecutionValidationReport:
        source_root = Path(local_root_path).expanduser().resolve()
        with tempfile.TemporaryDirectory(prefix="swarm-validate-") as tmp_dir:
            temp_root = Path(tmp_dir) / source_root.name
            shutil.copytree(source_root, temp_root)
            apply_report = self.apply_service.apply_patches(
                local_root_path=str(temp_root),
                patches=patches,
                create_backup=False,
                force_overwrite=True,
            )
            lint_result = self._run_command(temp_root, lint_command) if lint_command else None
            test_result = self._run_command(temp_root, test_command) if test_command else None
            valid = apply_report.skipped_count == 0 and all(
                result is None or result.success for result in (lint_result, test_result)
            )
            return PatchExecutionValidationReport(
                temp_root_path=str(temp_root),
                apply_report=apply_report,
                lint_result=lint_result,
                test_result=test_result,
                valid=valid,
            )

    @staticmethod
    def _run_command(cwd: Path, command: str) -> ExecutionCommandResult:
        completed = subprocess.run(
            command,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            shell=True,
            timeout=600,
        )
        return ExecutionCommandResult(
            command=command,
            success=completed.returncode == 0,
            exit_code=completed.returncode,
            stdout=completed.stdout[-12000:],
            stderr=completed.stderr[-12000:],
        )
