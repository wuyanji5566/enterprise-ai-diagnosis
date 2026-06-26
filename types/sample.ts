export type SampleStatus = "已完成样品" | "可演示MVP" | "可定制";
export type SampleAssetStatus = "mock" | "ready" | "needs-replacement";
export type SampleMediaType = "image" | "video" | "system" | "document";

export interface SampleItem {
  id: string;
  title: string;
  category: string;
  clientType: string;
  originalProblem: string;
  diagnosisJudgment: string;
  productionLine: string;
  deliverables: string[];
  businessValue: string;
  extendableServices: string[];
  status: SampleStatus;
  assetStatus: SampleAssetStatus;
  mediaType: SampleMediaType;
  mediaPlaceholder: string;
  realAssetNote: string;
}
