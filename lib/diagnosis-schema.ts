export const diagnosisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "maturityScore",
    "maturityLevel",
    "businessConclusion",
    "clientFitLevel",
    "clientFitReason",
    "workflowAnalysis",
    "opportunityMatrix",
    "implementationRoadmap",
    "topProjects",
    "roiAnalysis",
    "recommendedServicePackage",
    "preQuoteRequiredMaterials",
    "salesInsight",
    "reportMarkdown"
  ],
  properties: {
    maturityScore: { type: "integer", minimum: 0, maximum: 100 },
    maturityLevel: { type: "string" },
    businessConclusion: { type: "string" },
    clientFitLevel: { type: "string" },
    clientFitReason: { type: "string" },
    workflowAnalysis: {
      type: "object",
      additionalProperties: false,
      required: ["acquisition", "conversion", "delivery", "management"],
      properties: {
        acquisition: { type: "string" },
        conversion: { type: "string" },
        delivery: { type: "string" },
        management: { type: "string" }
      }
    },
    opportunityMatrix: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "area",
          "repeatability",
          "standardization",
          "dataReadiness",
          "roiPotential",
          "totalScore",
          "explanation"
        ],
        properties: {
          area: { type: "string" },
          repeatability: { type: "integer", minimum: 0, maximum: 100 },
          standardization: { type: "integer", minimum: 0, maximum: 100 },
          dataReadiness: { type: "integer", minimum: 0, maximum: 100 },
          roiPotential: { type: "integer", minimum: 0, maximum: 100 },
          totalScore: { type: "integer", minimum: 0, maximum: 100 },
          explanation: { type: "string" }
        }
      }
    },
    implementationRoadmap: {
      type: "object",
      additionalProperties: false,
      required: ["sevenDays", "thirtyDays", "ninetyDays", "notRecommended"],
      properties: {
        sevenDays: { type: "array", minItems: 1, items: { type: "string" } },
        thirtyDays: { type: "array", minItems: 1, items: { type: "string" } },
        ninetyDays: { type: "array", minItems: 1, items: { type: "string" } },
        notRecommended: { type: "array", minItems: 1, items: { type: "string" } }
      }
    },
    topProjects: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "category",
          "reason",
          "steps",
          "expectedOutcome",
          "difficulty",
          "estimatedCycle",
          "recommendedBudget",
          "risk",
          "sampleValidationSuggestion"
        ],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          reason: { type: "string" },
          steps: {
            type: "array",
            minItems: 3,
            maxItems: 6,
            items: { type: "string" }
          },
          expectedOutcome: { type: "string" },
          difficulty: { type: "string" },
          estimatedCycle: { type: "string" },
          recommendedBudget: { type: "string" },
          risk: { type: "string" },
          sampleValidationSuggestion: { type: "string" }
        }
      }
    },
    roiAnalysis: {
      type: "object",
      additionalProperties: false,
      required: [
        "costReduction",
        "efficiencyGain",
        "paybackPeriod",
        "roiSummary",
        "assumptions"
      ],
      properties: {
        costReduction: { type: "string" },
        efficiencyGain: { type: "string" },
        paybackPeriod: { type: "string" },
        roiSummary: { type: "string" },
        assumptions: {
          type: "array",
          minItems: 2,
          items: { type: "string" }
        }
      }
    },
    recommendedServicePackage: {
      type: "object",
      additionalProperties: false,
      required: ["name", "reason", "deliverables", "suggestedNextStep", "referenceBudget", "requiresPrivateQuote"],
      properties: {
        name: { type: "string" },
        reason: { type: "string" },
        deliverables: {
          type: "array",
          minItems: 3,
          items: { type: "string" }
        },
        suggestedNextStep: { type: "string" },
        referenceBudget: { type: "string" },
        requiresPrivateQuote: { type: "boolean" }
      }
    },
    preQuoteRequiredMaterials: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["materialName", "reason"],
        properties: {
          materialName: { type: "string" },
          reason: { type: "string" }
        }
      }
    },
    salesInsight: {
      type: "object",
      additionalProperties: false,
      required: ["clientType", "urgency", "budgetSignal", "dataReadiness", "bestConversionPath", "nextAction"],
      properties: {
        clientType: { type: "string" },
        urgency: { type: "string" },
        budgetSignal: { type: "string" },
        dataReadiness: { type: "string" },
        bestConversionPath: { type: "string" },
        nextAction: { type: "string" }
      }
    },
    reportMarkdown: { type: "string" }
  }
} as const;
