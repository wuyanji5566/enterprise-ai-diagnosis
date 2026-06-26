import type { DiagnosisReport } from "@/types/diagnosis";
import { buildReportMarkdown } from "@/lib/report-template";

export function reportToMarkdown(report: DiagnosisReport) {
  return report.reportMarkdown?.trim() || buildReportMarkdown(report);
}

