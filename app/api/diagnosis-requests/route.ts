import { NextResponse } from "next/server";
import { createDiagnosisRequest } from "@/lib/diagnosis-request-storage";
import { getUserSession } from "@/lib/user-auth";
import type { QuestionnaireData } from "@/types/diagnosis";

export const runtime = "nodejs";

function isQuestionnaire(value: unknown): value is QuestionnaireData {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<QuestionnaireData>;
  return (
    typeof item.companyName === "string" && item.companyName.trim().length >= 2 &&
    typeof item.industry === "string" && item.industry.trim().length >= 1 &&
    typeof item.employees === "number" && item.employees > 0 &&
    typeof item.revenue === "string" && Boolean(item.workflow) &&
    Boolean(item.salesSystem) && Boolean(item.marketingCapability) &&
    Boolean(item.costStructure) && Boolean(item.aiPlan)
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!isQuestionnaire(payload)) {
      return NextResponse.json(
        { error: "问卷信息不完整，请返回对应模块补充后再提交。" },
        { status: 400 }
      );
    }
    const user = await getUserSession(request);
    const created = await createDiagnosisRequest(payload, user?.userId);
    return NextResponse.json({ ...created, status: "pending_contact" }, { status: 201 });
  } catch (error) {
    console.error("Diagnosis request creation error:", error);
    return NextResponse.json(
      { error: "诊断提交失败，请检查网络后重试。" },
      { status: 500 }
    );
  }
}
