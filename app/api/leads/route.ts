import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/auth";
import { createLeadRecord } from "@/lib/lead-storage";
import { saveLead, readLeads } from "@/lib/lead-storage";
import { checkRateLimit } from "@/lib/rate-limit";

const leadSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(1).max(80),
  employees: z.number().int().nonnegative().max(1000000),
  maturityScore: z.number().int().min(0).max(100),
  clientFitLevel: z.enum(["A类客户", "B类客户", "C类客户", "D类客户"]).optional(),
  budgetSignal: z.enum(["低", "中", "高", "未知"]).optional(),
  urgency: z.enum(["低", "中", "高"]).optional(),
  dataReadiness: z.enum(["弱", "中", "强"]).optional(),
  recommendedService: z.string().trim().min(1).max(120),
  recommendedNextStep: z
    .enum(["免费沟通", "深度诊断", "样品验证", "正式报价", "暂不跟进"])
    .optional(),
  diagnosisType: z.enum(["免费初筛", "99元深度诊断", "999元人工诊断"]).optional(),
  wechatAdded: z.enum(["是", "否", "未知"]).optional(),
  paid99: z.enum(["是", "否", "未知"]).optional(),
  referralSource: z.enum(["自然访问", "朋友推荐", "内容引流", "手动录入"]).optional(),
  referrer: z.string().trim().max(120).optional(),
  collectionNextAction: z
    .enum(["发诊断链接", "生成PDF", "人工解读", "推荐样品验证", "正式报价"])
    .optional(),
  note: z.string().trim().max(1000).optional(),
  contactName: z.string().trim().max(80).optional(),
  contactMethod: z.string().trim().max(120).optional(),
  source: z.enum(["AI诊断", "预约沟通", "示例数据"]).optional()
});

// POST：提交新线索（公开接口）
export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit(request, "lead-submit", 20, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "提交次数过多，请稍后再试。" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) }
        }
      );
    }

    const parsed = leadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "线索数据格式错误。" }, { status: 400 });
    }

    const record = createLeadRecord(parsed.data);
    await saveLead(record);

    return NextResponse.json({
      accepted: true,
      lead: record,
      storage: "turso"
    });
  } catch (error) {
    console.error("Leads POST error:", error);
    return NextResponse.json({ error: "线索保存失败，请稍后重试。" }, { status: 500 });
  }
}

// GET：读取所有线索（需管理员权限）
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const leads = await readLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: "读取线索失败。" }, { status: 500 });
  }
}
