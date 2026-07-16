import { describe, expect, it } from "vitest";
import { isTerminalDiagnosisRequestStatus } from "@/types/diagnosis-request";
import { canStartDiagnosisGeneration } from "@/lib/diagnosis-request-storage";

describe("diagnosis request status", () => {
  it("marks only unlocked and failed requests as terminal", () => {
    expect(isTerminalDiagnosisRequestStatus("pending_contact")).toBe(false);
    expect(isTerminalDiagnosisRequestStatus("generating")).toBe(false);
    expect(isTerminalDiagnosisRequestStatus("unlocked")).toBe(true);
    expect(isTerminalDiagnosisRequestStatus("failed")).toBe(true);
  });
});

describe("diagnosis request confirmation", () => {
  it("allows pending and failed requests to be generated, but blocks duplicate work", () => {
    expect(canStartDiagnosisGeneration("pending_contact")).toBe(true);
    expect(canStartDiagnosisGeneration("failed")).toBe(true);
    expect(canStartDiagnosisGeneration("generating")).toBe(false);
    expect(canStartDiagnosisGeneration("unlocked")).toBe(false);
  });
});
