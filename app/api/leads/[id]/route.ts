import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/auth";
import { readLeadById, updateLeadField, updateLeadStatus, updateLeadNote, deleteLead } from "@/lib/lead-storage";

const editableField = z.enum([
  "companyName",
  "industry",
  "employees",
  "maturityScore",
  "clientFitLevel",
  "budgetSignal",
  "urgency",
  "dataReadiness",
  "recommendedService",
  "recommendedNextStep",
  "diagnosisType",
  "wechatAdded",
  "paid99",
  "referralSource",
  "referrer",
  "collectionNextAction",
  "contactName",
  "contactMethod"
]);
const leadStatus = z.enum(["新线索", "已沟通", "已报价", "已成交", "暂不跟进"]);

// PATCH：更新线索字段
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      field?: string;
      value?: unknown;
      status?: string;
      note?: string;
    };

    const { id } = await params;

    if (body.note !== undefined) {
      await updateLeadNote(id, String(body.note));
    } else if (body.status) {
      const status = leadStatus.safeParse(body.status);
      if (!status.success) {
        return NextResponse.json({ error: "线索状态无效。" }, { status: 400 });
      }
      await updateLeadStatus(id, status.data);
    } else if (body.field && body.value !== undefined) {
      const field = editableField.safeParse(body.field);
      if (!field.success) {
        return NextResponse.json({ error: "不允许更新该字段。" }, { status: 400 });
      }
      await updateLeadField(id, field.data, body.value as never);
    } else {
      return NextResponse.json({ error: "缺少要更新的字段。" }, { status: 400 });
    }

    const updated = await readLeadById(id);
    return NextResponse.json({ lead: updated });
  } catch (error) {
    console.error("Leads PATCH error:", error);
    return NextResponse.json({ error: "更新线索失败。" }, { status: 500 });
  }
}

// DELETE：删除线索
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads DELETE error:", error);
    return NextResponse.json({ error: "删除线索失败。" }, { status: 500 });
  }
}
