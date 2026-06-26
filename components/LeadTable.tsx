"use client";

import { useMemo } from "react";
import { ChartBar, Gauge, HandCoins, Flask, UsersThree } from "@phosphor-icons/react";
import { SERVICE_PACKAGES } from "@/lib/service-matcher";
import { formatDateTime } from "@/lib/utils";
import type { LeadRecord, LeadStatus } from "@/types/lead";
import type { Icon } from "@phosphor-icons/react";

const statuses: LeadStatus[] = ["新线索", "已沟通", "已报价", "已成交", "暂不跟进"];

interface LeadTableProps {
  leads: LeadRecord[];
  onUpdateField: (id: string, field: string, value: unknown) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

export function LeadTable({ leads, onUpdateField, onUpdateStatus, onUpdateNote }: LeadTableProps) {

  const stats = useMemo(() => {
    const average = leads.length
      ? Math.round(leads.reduce((sum, item) => sum + item.maturityScore, 0) / leads.length)
      : 0;
    const distribution = SERVICE_PACKAGES.map((service) => ({
      name: service.name,
      count: leads.filter((lead) => lead.recommendedService === service.name).length
    })).filter((item) => item.count > 0);
    return {
      average,
      distribution,
      aClients: leads.filter((lead) => lead.clientFitLevel === "A类客户").length,
      validation: leads.filter((lead) => lead.recommendedNextStep === "样品验证").length,
      quote: leads.filter((lead) => lead.recommendedNextStep === "正式报价").length
    };
  }, [leads]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {([
          ["总线索数", leads.length, UsersThree],
          ["A类客户", stats.aClients, HandCoins],
          ["平均成熟度", stats.average, Gauge],
          ["推荐样品验证", stats.validation, Flask],
          ["推荐正式报价", stats.quote, ChartBar]
        ] as Array<[string, number, Icon]>).map(([label, value, StatIcon]) => (
          <div key={label as string} className="surface-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">{label as string}</p>
              <StatIcon size={20} className="text-brand" weight="duotone" />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight text-ink">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2200px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  {[
                    "企业",
                    "诊断类型",
                    "微信 / 99元",
                    "推荐来源",
                    "行业 / 规模",
                    "成熟度",
                    "客户等级",
                    "预算 / 紧急",
                    "资料完整度",
                    "推荐服务",
                    "下一步",
                    "私域动作",
                    "提交时间",
                    "跟进状态",
                    "备注"
                  ].map((item) => (
                    <th key={item} className="px-5 py-4">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-5">
                      <p className="font-bold text-ink">{lead.companyName}</p>
                      <p className="mt-1 text-xs text-slate-400">{lead.source}</p>
                    </td>
                    <td className="px-5 py-5">
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold"
                        value={lead.diagnosisType}
                        onChange={(event) =>
                          onUpdateField(lead.id, "diagnosisType", event.target.value)
                        }
                      >
                        {["免费初筛", "99元深度诊断", "999元人工诊断"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-5 text-xs leading-7 text-slate-600">
                      <label className="flex items-center gap-2">
                        微信
                        <select
                          value={lead.wechatAdded}
                          className="rounded border border-slate-200 bg-white p-1"
                          onChange={(event) =>
                            onUpdateField(lead.id, "wechatAdded", event.target.value)
                          }
                        >
                          {["是", "否", "未知"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                      <label className="mt-1 flex items-center gap-2">
                        99元
                        <select
                          value={lead.paid99}
                          className="rounded border border-slate-200 bg-white p-1"
                          onChange={(event) =>
                            onUpdateField(lead.id, "paid99", event.target.value)
                          }
                        >
                          {["是", "否", "未知"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                    </td>
                    <td className="px-5 py-5 text-xs leading-6 text-slate-600">
                      <select
                        value={lead.referralSource}
                        className="rounded border border-slate-200 bg-white p-1.5"
                        onChange={(event) =>
                          onUpdateField(lead.id, "referralSource", event.target.value)
                        }
                      >
                        {["自然访问", "朋友推荐", "内容引流", "手动录入"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                      <input
                        value={lead.referrer}
                        className="mt-2 w-32 rounded border border-slate-200 px-2 py-1.5"
                        placeholder="推荐人"
                        onChange={(event) =>
                          onUpdateField(lead.id, "referrer", event.target.value)
                        }
                      />
                    </td>
                    <td className="px-5 py-5">
                      {lead.industry}
                      <br />
                      <span className="text-xs text-slate-400">{lead.employees}人</span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="font-black text-brand">{lead.maturityScore}</span>
                      <span className="text-slate-400"> / 100</span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="tag">{lead.clientFitLevel}</span>
                    </td>
                    <td className="px-5 py-5 text-xs leading-6 text-slate-600">
                      预算：{lead.budgetSignal}<br />紧急：{lead.urgency}
                    </td>
                    <td className="px-5 py-5 font-bold text-slate-700">
                      {lead.dataReadiness}
                    </td>
                    <td className="max-w-[180px] px-5 py-5 font-semibold text-slate-700">
                      {lead.recommendedService}
                    </td>
                    <td className="px-5 py-5">
                      <span className="tag bg-slate-100 text-slate-700">
                        {lead.recommendedNextStep}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <select
                        value={lead.collectionNextAction}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold"
                        onChange={(event) =>
                          onUpdateField(lead.id, "collectionNextAction", event.target.value)
                        }
                      >
                        {["发诊断链接", "生成PDF", "人工解读", "推荐样品验证", "正式报价"].map(
                          (item) => <option key={item}>{item}</option>
                        )}
                      </select>
                    </td>
                    <td className="px-5 py-5 text-xs leading-5 text-slate-500">
                      {formatDateTime(lead.submittedAt)}
                    </td>
                    <td className="px-5 py-5">
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand"
                        value={lead.status}
                        onChange={(event) =>
                          onUpdateStatus(lead.id, event.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="max-w-[260px] px-5 py-5">
                      <textarea
                        className="min-h-20 w-full resize-y rounded-lg border border-slate-200 p-2 text-xs leading-5 text-slate-600 outline-none focus:border-brand"
                        value={lead.note}
                        placeholder="添加跟进备注"
                        onChange={(event) =>
                          onUpdateNote(lead.id, event.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="surface-card h-fit p-6">
          <h2 className="font-black text-ink">推荐服务分布</h2>
          <div className="mt-6 space-y-5">
            {stats.distribution.map((item) => {
              const percent = Math.round((item.count / leads.length) * 100);
              return (
                <div key={item.name}>
                  <div className="flex justify-between gap-4 text-xs">
                    <span className="font-semibold text-slate-600">{item.name}</span>
                    <span className="font-bold text-brand">{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
