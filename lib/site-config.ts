export const siteConfig = {
  brandName: "企业AI数字工厂",
  brandSubtitle: "从AI诊断到样品验证，再到系统交付",
  founderName: "小伍",
  contact: {
    wechatId: "wuyanji",
    phone: "",
    email: "",
    qrCodeUrl: "/wechat-qr.jpg",
    consultationText: "添加微信，获取企业AI诊断与样品验证方案"
  },
  diagnosisProducts: {
    free: {
      name: "免费AI初筛",
      price: "免费",
      description: "适合初步判断企业是否适合AI落地"
    },
    manual999: {
      name: "999元人工深度诊断",
      price: "999元起",
      description: "人工访谈、资料分析和正式落地方案建议"
    }
  },
  /** 诊断报告解锁价格 */
  unlockPrice: 99
} as const;

export type ReportType = "free" | "paid99" | "manual999";

export const reportTypeLabels: Record<ReportType, string> = {
  free: "免费AI初筛报告（需付费解锁完整内容）",
  paid99: "99元解锁完整诊断报告",
  manual999: "999元人工深度诊断报告"
};
