import { describe, expect, it } from "vitest";
import { diagnosisJsonSchema } from "@/lib/diagnosis-schema";

describe("enterprise-owner report contract", () => {
  it("requires executive summary and project acceptance criteria", () => {
    expect(diagnosisJsonSchema.required).toContain("executiveSummary");
    expect(diagnosisJsonSchema.properties.topProjects.items.required).toContain("acceptanceMetrics");
    expect(diagnosisJsonSchema.properties.topProjects.items.required).toContain("suggestedOwner");
  });
});
