import type {
  ApplyApprovedPatchesResponse,
  AnalysisJobStartResponse,
  AnalysisJobStatusResponse,
  AnalyzeRepositoryResponse,
  GenerateFixesResponse,
  GeneratePRResponse,
  PatchProposal,
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

export function analyzeRepository(repositoryUrl: string) {
  return request<AnalyzeRepositoryResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify({ repository_url: repositoryUrl }),
  });
}

export function createAnalysisJob(repositoryUrl: string) {
  return request<AnalysisJobStartResponse>("/analyze-jobs", {
    method: "POST",
    body: JSON.stringify({ repository_url: repositoryUrl }),
  });
}

export function getAnalysisJob(jobId: string) {
  return request<AnalysisJobStatusResponse>(`/analyze-jobs/${jobId}`, {
    method: "GET",
  });
}

export function generateFixes(repositoryContext: RepositoryContext, review: StaffEngineerReview) {
  return request<GenerateFixesResponse>("/generate-fixes", {
    method: "POST",
    body: JSON.stringify({ repository_context: repositoryContext, review }),
  });
}

export function generatePR(
  repositoryContext: RepositoryContext,
  review: StaffEngineerReview,
  patches: PatchProposal[],
  validationReport: PatchValidationReport,
) {
  return request<GeneratePRResponse>("/generate-pr", {
    method: "POST",
    body: JSON.stringify({
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
