export const siteConfig = {
  brandName: "星宇AI数字工厂",
  brandSubtitle: "从AI诊断到样品验证，再到系统交付",
  founderName: "伍老师",
  contact: {
    wechatId: "wuyanji",
    phone: "",
    email: "",
    qrCodeUrl: "/wechat-qr.jpg",
    consultationText:
      "添加微信后，请发送你的行业、公司规模和当前最想解决的问题。我会先判断适合从诊断、样品验证还是正式项目切入。"
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
  unlockPrice: 99
} as const;

export type ReportType = "free" | "paid99" | "manual999";

export const reportTypeLabels: Record<ReportType, string> = {
  free: "免费AI初筛报告（需付费解锁完整内容）",
  paid99: "99元解锁完整诊断报告",
  manual999: "999元人工深度诊断报告"
};
