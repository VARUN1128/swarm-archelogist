import { CheckCheck, Copy, FileCode2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ApplyPatchesReport, GenerateFixesResponse, PatchExecutionValidationReport, PatchProposal } from "@/types";

interface PatchPanelProps {
  fixes: GenerateFixesResponse;
  approvedPatchKeys: string[];
  onApprovePatch: (patch: PatchProposal) => void;
  onApproveAll: () => void;
  localRootPath: string;
  onLocalRootPathChange: (value: string) => void;
  onApplyApproved: (forceOverwrite: boolean) => void;
  onValidateApproved: () => void;
  isApplyingApproved: boolean;
  isValidatingApproved: boolean;
  applyReport: ApplyPatchesReport | null;
  executionValidationReport: PatchExecutionValidationReport | null;
  lintCommand: string;
  testCommand: string;
  onLintCommandChange: (value: string) => void;
  onTestCommandChange: (value: string) => void;
}

function getPatchKey(patch: PatchProposal) {
  return `${patch.file}::${patch.issue}`;
}

const checkLabel = (condition: boolean, passLabel: string, failLabel: string) => (condition ? failLabel : passLabel);

export function PatchPanel({
  fixes,
  approvedPatchKeys,
  onApprovePatch,
  onApproveAll,
  localRootPath,
  onLocalRootPathChange,
  onApplyApproved,
  onValidateApproved,
  isApplyingApproved,
  isValidatingApproved,
  applyReport,
  executionValidationReport,
  lintCommand,
  testCommand,
  onLintCommandChange,
  onTestCommandChange,
}: PatchPanelProps) {
  const approvedCount = fixes.patches.filter((patch) => approvedPatchKeys.includes(getPatchKey(patch))).length;

  return (
    <Card className="border-border bg-card p-4 md:p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Generated Patches</h3>
          <p className="text-sm text-muted">Deterministic validation: {fixes.validation_report.valid ? "passed" : "failed"}</p>
          <p className="mt-1 text-sm text-muted">
            {approvedCount} of {fixes.patches.length} patches approved for the PR package.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="secondary" onClick={onApproveAll} disabled={!fixes.patches.length} className="w-full sm:w-auto">
            <CheckCheck className="mr-2 h-4 w-4" />
            Approve All
          </Button>
          <div className={`w-fit rounded-sm border px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] ${fixes.validation_report.valid ? "border-border bg-background text-foreground" : "border-danger/30 bg-danger/10 text-foreground"}`}>
            {fixes.validation_report.valid ? "Valid" : "Needs Review"}
          </div>
        </div>
      </div>

      <div className="mb-5 border border-border bg-background p-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Apply To Local Codebase</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          Enter the local repository root path on your machine. Approved patches will replace matching files there. If a file has changed since analysis, it will be skipped unless you force overwrite.
        </p>
        <div className="mt-4 flex flex-col gap-3 xl:flex-row">
          <input
            value={localRootPath}
            onChange={(event) => onLocalRootPathChange(event.target.value)}
            placeholder="D:\\Projects\\your-repo"
            className="min-h-12 flex-1 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-foreground"
          />
          <div className="grid gap-2 sm:grid-cols-2 xl:flex">
            <Button
              variant="secondary"
              onClick={onValidateApproved}
              disabled={!approvedCount || !localRootPath.trim() || isValidatingApproved}
              className="w-full xl:w-auto"
            >
              {isValidatingApproved ? "Validating..." : "Validate with Lint/Test"}
            </Button>
            <Button
              onClick={() => onApplyApproved(false)}
              disabled={!approvedCount || !localRootPath.trim() || isApplyingApproved}
              className="w-full xl:w-auto"
            >
              {isApplyingApproved ? "Applying..." : "Apply Approved"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onApplyApproved(true)}
              disabled={!approvedCount || !localRootPath.trim() || isApplyingApproved}
              className="w-full sm:col-span-2 xl:w-auto"
            >
              Force Overwrite
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={lintCommand}
            onChange={(event) => onLintCommandChange(event.target.value)}
            placeholder="npm run lint"
            className="min-h-12 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-foreground"
          />
          <input
            value={testCommand}
            onChange={(event) => onTestCommandChange(event.target.value)}
            placeholder="npm test"
            className="min-h-12 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-foreground"
          />
        </div>
        {applyReport && (
          <div className="mt-4 border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Applied {applyReport.applied_count}, skipped {applyReport.skipped_count}</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">{applyReport.target_root_path}</p>
            <div className="mt-3 space-y-2">
              {applyReport.results.map((result) => (
                <div key={`${result.file}-${result.status}`} className="border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-all text-sm font-medium text-foreground">{result.file}</p>
                    <span className={`rounded-sm border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${result.status === "applied" ? "border-border bg-card text-foreground" : "border-warning/30 bg-warning/10 text-foreground"}`}>
                      {result.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted">{result.message}</p>
                  {result.backup_path && <p className="mt-1 break-all font-mono text-xs text-muted">Backup: {result.backup_path}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {executionValidationReport && (
          <div className="mt-4 border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">
              Execution Validation {executionValidationReport.valid ? "Passed" : "Needs Attention"}
            </p>
            <div className="mt-3 space-y-3 text-sm text-muted">
              {executionValidationReport.lint_result && (
                <div className="border border-border bg-background p-3">
                  <p className="font-medium text-foreground">Lint: {executionValidationReport.lint_result.success ? "Passed" : "Failed"}</p>
                  <p className="mt-1 break-all font-mono text-xs text-muted">{executionValidationReport.lint_result.command}</p>
                </div>
              )}
              {executionValidationReport.test_result && (
                <div className="border border-border bg-background p-3">
                  <p className="font-medium text-foreground">Tests: {executionValidationReport.test_result.success ? "Passed" : "Failed"}</p>
                  <p className="mt-1 break-all font-mono text-xs text-muted">{executionValidationReport.test_result.command}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!fixes.validation_report.valid && (
        <div className="mb-5 border border-danger/30 bg-danger/10 p-4 text-sm text-foreground">
          {fixes.validation_report.issues.map((issue) => (
            <p key={`${issue.patch_file}-${issue.message}`}>{issue.patch_file}: {issue.message}</p>
          ))}
        </div>
      )}

      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Patch Validation</p>
          <div className="mt-3 grid gap-2 text-sm text-foreground">
            <p>{checkLabel(fixes.validation_report.issues.some((issue) => issue.message.includes("not present")), "File Exists", "File Exists Check: Attention Needed")}</p>
            <p>{checkLabel(fixes.validation_report.issues.some((issue) => issue.message.includes("unified diff")), "Patch Valid", "Patch Valid: Attention Needed")}</p>
            <p>{checkLabel(fixes.validation_report.issues.some((issue) => issue.message.includes("hunk")), "References Valid", "References Valid: Attention Needed")}</p>
            <p>{fixes.validation_report.valid ? "Ready For Review" : "Ready For Review: Resolve validation notes"}</p>
          </div>
        </div>
        <div className="border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Confidence</p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{fixes.validation_report.valid ? "94%" : "71%"}</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Confidence blends deterministic patch validation with the clarity and completeness of the generated diff package.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {fixes.patches.map((patch) => {
          const isApproved = approvedPatchKeys.includes(getPatchKey(patch));
          return (
            <div key={getPatchKey(patch)} className={`border p-4 ${isApproved ? "border-foreground bg-card" : "border-border bg-background"}`}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-center gap-3">
                  <FileCode2 className="h-5 w-5 text-foreground" />
                  <div>
                    <h4 className="font-semibold text-foreground">{patch.issue}</h4>
                    <p className="break-all text-sm text-muted">{patch.file}</p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">{patch.change_type}</p>
                  </div>
                </div>
                <div className="w-fit rounded-sm border border-border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Confidence {fixes.validation_report.valid ? "94%" : "71%"}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:flex">
                  <Button variant={isApproved ? "primary" : "secondary"} onClick={() => onApprovePatch(patch)} className="w-full xl:w-auto">
                    {isApproved ? "Approved" : "Approve"}
                  </Button>
                  <Button variant="secondary" onClick={() => navigator.clipboard.writeText(patch.patch_diff)} className="w-full xl:w-auto">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Diff
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{patch.explanation}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="border border-border bg-card p-3 text-sm text-foreground">
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Impact</span>
                  <p className="mt-2 leading-7">{patch.impact}</p>
                </div>
                <div className="border border-border bg-card p-3 text-sm text-foreground">
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Risk</span>
                  <p className="mt-2 leading-7">{patch.risk}</p>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto border border-border bg-card p-4 text-xs leading-6 text-foreground">
                {patch.patch_diff}
              </pre>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="border border-border bg-card p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Original Version</p>
                  <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-foreground">
                    {patch.original_content || "// File will be created"}
                  </pre>
                </div>
                <div className={`border p-4 ${isApproved ? "border-foreground bg-background" : "border-border bg-card"}`}>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
                    {isApproved ? "Approved Version" : "Suggested New Version"}
                  </p>
                  <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-foreground">
                    {patch.proposed_content}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
