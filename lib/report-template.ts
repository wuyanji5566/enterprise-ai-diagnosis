import type { DiagnosisReport } from "@/types/diagnosis";
import { reportTypeLabels, siteConfig } from "@/lib/site-config";

export function buildReportMarkdown(report: Omit<DiagnosisReport, "reportMarkdown">) {
  const matrix = report.opportunityMatrix
    .map(
      (item) =>
        `- ${item.area}：总分 ${item.totalScore}/100（重复性 ${item.repeatability}、标准化 ${item.standardization}、数据基础 ${item.dataReadiness}、ROI潜力 ${item.roiPotential}）\n  ${item.explanation}`
    )
    .join("\n");

  const projects = report.topProjects
    .map(
      (item, index) =>
        `### TOP ${index + 1} · ${item.name}\n- 类别：${item.category}\n- 推荐理由：${item.reason}\n- 执行步骤：${item.steps.join(" → ")}\n- 预期结果：${item.expectedOutcome}\n- 难度：${item.difficulty}\n- 周期：${item.estimatedCycle}\n- 建议预算：${item.recommendedBudget}\n- 风险：${item.risk}\n- 样品验证：${item.sampleValidationSuggestion}`
    )
    .join("\n\n");

  return `# ${report.companyName} 企业AI诊断报告

报告类型：${reportTypeLabels[report.reportType]}

出品方：${siteConfig.brandName}

## AI成熟度
${report.maturityScore}/100 · ${report.maturityLevel}

## 商业结论
${report.businessConclusion}

## 客户适配判断
${report.clientFitLevel} · ${report.clientFitReason}

## 业务流程分析
- 获客：${report.workflowAnalysis.acquisition}
- 转化：${report.workflowAnalysis.conversion}
- 交付：${report.workflowAnalysis.delivery}
- 管理：${report.workflowAnalysis.management}

## AI机会评分矩阵
${matrix}

## TOP3 AI项目建议
${projects}

## 落地路线
- 7天：${report.implementationRoadmap.sevenDays.join("；")}
- 30天：${report.implementationRoadmap.thirtyDays.join("；")}
- 90天：${report.implementationRoadmap.ninetyDays.join("；")}
- 暂不建议：${report.implementationRoadmap.notRecommended.join("；")}

## ROI分析
- 成本下降：${report.roiAnalysis.costReduction}
- 人效提升：${report.roiAnalysis.efficiencyGain}
- 回本周期：${report.roiAnalysis.paybackPeriod}
- ROI总结：${report.roiAnalysis.roiSummary}
- 测算假设：${report.roiAnalysis.assumptions.join("；")}

## 推荐服务包
${report.recommendedServicePackage.name}

${report.recommendedServicePackage.reason}

交付内容：${report.recommendedServicePackage.deliverables.join("、")}

下一步：${report.recommendedServicePackage.suggestedNextStep}

参考预算：${report.recommendedServicePackage.referenceBudget}

## 报价前补充资料
${report.preQuoteRequiredMaterials.map((item) => `- ${item.materialName}：${item.reason}`).join("\n")}

报告生成时间：${new Date(report.generatedAt).toLocaleString("zh-CN")}`;
}
