import type {
  ApplyApprovedPatchesResponse,
  IncrementalAnalysisOptions,
  AnalysisJobStartResponse,
  AnalysisJobStatusResponse,
  AnalyzeRepositoryResponse,
  GenerateFixesResponse,
  GeneratePRResponse,
  PatchProposal,
  SessionListResponse,
  SessionResponse,
  ValidateApprovedPatchesResponse,
  PatchValidationReport,
  RepositoryContext,
  StaffEngineerReview,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function analyzeRepository(repositoryUrl?: string, localRootPath?: string) {
  return request<AnalyzeRepositoryResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify({
      repository_url: repositoryUrl || null,
      local_root_path: localRootPath || null,
    }),
  });
}

export function createAnalysisJob(
  repositoryUrl?: string,
  localRootPath?: string,
  incremental?: IncrementalAnalysisOptions,
) {
  return request<AnalysisJobStartResponse>("/analyze-jobs", {
    method: "POST",
    body: JSON.stringify({
      repository_url: repositoryUrl || null,
      local_root_path: localRootPath || null,
      incremental,
    }),
  });
}

export function getAnalysisJob(jobId: string) {
  return request<AnalysisJobStatusResponse>(`/analyze-jobs/${jobId}`, {
    method: "GET",
  });
}

export function generateFixes(
  repositoryContext: RepositoryContext,
  review: StaffEngineerReview,
  sessionId?: string,
  selectedFindingIds: string[] = [],
) {
  return request<GenerateFixesResponse>("/generate-fixes", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, repository_context: repositoryContext, review, selected_finding_ids: selectedFindingIds }),
  });
}

export function generatePR(
  repositoryContext: RepositoryContext,
  review: StaffEngineerReview,
  patches: PatchProposal[],
  validationReport: PatchValidationReport,
  sessionId?: string,
) {
  return request<GeneratePRResponse>("/generate-pr", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      repository_context: repositoryContext,
      review,
      patches,
      validation_report: validationReport,
    }),
  });
}

export function applyApprovedPatches(
  localRootPath: string,
  patches: PatchProposal[],
  createBackup = true,
  forceOverwrite = false,
) {
  return request<ApplyApprovedPatchesResponse>("/apply-approved-patches", {
    method: "POST",
    body: JSON.stringify({
      local_root_path: localRootPath,
      patches,
      create_backup: createBackup,
      force_overwrite: forceOverwrite,
    }),
  });
}

export function validateApprovedPatches(
  localRootPath: string,
  patches: PatchProposal[],
  lintCommand?: string,
  testCommand?: string,
) {
  return request<ValidateApprovedPatchesResponse>("/validate-approved-patches", {
    method: "POST",
    body: JSON.stringify({
      local_root_path: localRootPath,
      patches,
      lint_command: lintCommand ?? null,
      test_command: testCommand ?? null,
    }),
  });
}

export function listSessions() {
  return request<SessionListResponse>("/sessions", { method: "GET" });
}

export function getSession(sessionId: string) {
  return request<SessionResponse>(`/sessions/${sessionId}`, { method: "GET" });
}

export function getSharedSession(shareId: string) {
  return request<SessionResponse>(`/shared/${shareId}`, { method: "GET" });
}
