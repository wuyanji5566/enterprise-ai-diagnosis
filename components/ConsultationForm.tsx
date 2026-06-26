"use client";

import { useState } from "react";
import { CheckCircle, SpinnerGap } from "@phosphor-icons/react";
import type { DiagnosisReport } from "@/types/diagnosis";

export function ConsultationForm({ report }: { report: DiagnosisReport }) {
  const [contactName, setContactName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit() {
    if (!contactName.trim() || !contactMethod.trim()) return;
    setSubmitting(true);
    const diagnosisType =
      report.reportType === "paid99"
        ? "99元深度诊断"
        : report.reportType === "manual999"
          ? "999元人工诊断"
          : "免费初筛";
    const submission = {
      companyName: report.companyName,
      industry: report.salesInsight.clientType,
      employees: 0,
      maturityScore: report.maturityScore,
      clientFitLevel: report.clientFitLevel as
        | "A类客户"
        | "B类客户"
        | "C类客户"
        | "D类客户",
      budgetSignal: (["低", "中", "高"].includes(report.salesInsight.budgetSignal)
        ? report.salesInsight.budgetSignal
        : "未知") as "低" | "中" | "高" | "未知",
      urgency: (["低", "中", "高"].includes(report.salesInsight.urgency)
        ? report.salesInsight.urgency
        : "中") as "低" | "中" | "高",
      dataReadiness: (["弱", "中", "强"].includes(report.salesInsight.dataReadiness)
        ? report.salesInsight.dataReadiness
        : "弱") as "弱" | "中" | "强",
      recommendedService: report.recommendedServicePackage.name,
      recommendedNextStep: ([
        "免费沟通",
        "深度诊断",
        "样品验证",
        "正式报价",
        "暂不跟进"
      ].includes(report.salesInsight.nextAction)
        ? report.salesInsight.nextAction
        : "免费沟通") as
        | "免费沟通"
        | "深度诊断"
        | "样品验证"
        | "正式报价"
        | "暂不跟进",
      diagnosisType: diagnosisType as
        | "免费初筛"
        | "99元深度诊断"
        | "999元人工诊断",
      wechatAdded: "是" as const,
      paid99: (report.reportType === "paid99" ? "是" : "未知") as
        | "是"
        | "未知",
      referralSource: "自然访问" as const,
      referrer: "",
      collectionNextAction: "人工解读" as const,
      contactName,
      contactMethod,
      note: note || report.salesInsight.bestConversionPath,
      source: "预约沟通" as const
    };
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
    } finally {
      setSubmitting(false);
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle size={34} className="mx-auto text-emerald-600" weight="fill" />
        <p className="mt-3 font-black text-emerald-950">预约线索已保存</p>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          当前MVP已保存到本地线索后台，可前往“线索后台”查看。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="field-label text-white">联系人 *</span>
        <input
          className="field border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white focus:ring-white/10"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          placeholder="请输入姓名"
        />
      </label>
      <label>
        <span className="field-label text-white">手机号 / 微信 *</span>
        <input
          className="field border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white focus:ring-white/10"
          value={contactMethod}
          onChange={(event) => setContactMethod(event.target.value)}
          placeholder="请输入联系方式"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="field-label text-white">补充说明</span>
        <textarea
          className="field min-h-24 resize-y border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white focus:ring-white/10"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="希望优先沟通的问题、时间或项目背景"
        />
      </label>
      <button
        type="button"
        disabled={submitting || !contactName.trim() || !contactMethod.trim()}
        onClick={submit}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-brand transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
      >
        {submitting && <SpinnerGap className="animate-spin" size={18} />}
        提交预约线索
      </button>
    </div>
  );
}
