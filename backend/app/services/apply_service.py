from datetime import datetime, timezone
from pathlib import Path

from fastapi import status

from app.core.exceptions import ApplicationError
from app.schemas.patching import AppliedPatchResult, ApplyPatchesReport, PatchProposal


class ApplyService:
    def apply_patches(
        self,
        local_root_path: str,
        patches: list[PatchProposal],
        create_backup: bool = True,
        force_overwrite: bool = False,
    ) -> ApplyPatchesReport:
        root = Path(local_root_path).expanduser().resolve()
        if not root.exists() or not root.is_dir():
            raise ApplicationError(
                "The target local repository path does not exist or is not a directory.",
                "invalid_local_root_path",
                status.HTTP_400_BAD_REQUEST,
            )

        backup_root = root / ".swarm-archaeologist-backups" / datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        results: list[AppliedPatchResult] = []
        applied_count = 0
        skipped_count = 0

        for patch in patches:
            target_path = (root / patch.file).resolve()
            try:
                target_path.relative_to(root)
            except ValueError as exc:
                raise ApplicationError(
                    f"Patch file '{patch.file}' escapes the selected local root path.",
                    "invalid_patch_target",
                    status.HTTP_400_BAD_REQUEST,
                ) from exc

            target_exists = target_path.exists()
            current_content = target_path.read_text(encoding="utf-8") if target_exists else ""
            if target_exists and not force_overwrite and current_content != patch.original_content:
                skipped_count += 1
                results.append(
                    AppliedPatchResult(
                        file=patch.file,
                        status="skipped",
                        action=patch.change_type,
                        message="Local file content differs from the analyzed original version. Patch was not applied.",
                    )
                )
                continue

            backup_path: str | None = None
            if create_backup and target_exists:
                backup_file = backup_root / patch.file
                backup_file.parent.mkdir(parents=True, exist_ok=True)
                backup_file.write_text(current_content, encoding="utf-8")
                backup_path = str(backup_file)

            target_path.parent.mkdir(parents=True, exist_ok=True)
            target_path.write_text(patch.proposed_content, encoding="utf-8")
            applied_count += 1
            results.append(
                AppliedPatchResult(
                    file=patch.file,
                    status="applied",
                    action=patch.change_type,
                    message="Approved patch applied successfully.",
                    backup_path=backup_path,
                )
            )

        return ApplyPatchesReport(
            target_root_path=str(root),
            applied_count=applied_count,
            skipped_count=skipped_count,
            results=results,
        )
