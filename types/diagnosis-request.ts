export type DiagnosisRequestStatus =
  | "pending_contact"
  | "generating"
  | "unlocked"
  | "failed";

export interface DiagnosisRequestPublicStatus {
  id: string;
  companyName: string;
  status: DiagnosisRequestStatus;
  submittedAt: string;
  failureMessage?: string;
  reportId?: string;
  reportAccessToken?: string;
}

export function isTerminalDiagnosisRequestStatus(status: DiagnosisRequestStatus) {
  return status === "unlocked" || status === "failed";
}
