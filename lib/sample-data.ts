import type { SampleItem } from "@/types/sample";

const coverImage = "/sample-cover-ai.svg";

export const SAMPLE_DATA: SampleItem[] = [
  {
    id: "wood-coating-video",
    title: "木地板涂层15秒AI营销视频",
    category: "AI营销增长",
    clientType: "木地板、涂料、建材、家居供应链和招商销售团队",
    originalProblem:
      "产品卖点偏技术，客户很难在短时间内理解涂层优势，销售缺少可发给客户和渠道商的短视频素材。",
    diagnosisJudgment:
      "第一步不适合做大规模内容矩阵，应先用一个15秒卖点视频验证客户是否能理解“耐磨、防水、环保”等核心价值。",
    productionLine: "AI营销增长生产线",
    deliverables: ["15秒AI营销视频", "产品卖点脚本", "分镜表", "封面图", "销售转发话术"],
    businessValue:
      "把技术参数转成客户能看懂的视觉卖点，用于朋友圈、展会跟进、渠道招商和短视频测试。",
    extendableServices: ["系列短视频", "产品详情页视觉", "招商资料包"],
    status: "已完成样品",
    assetStatus: "mock",
    mediaType: "video",
    mediaPlaceholder: "演示封面：15秒AI营销视频",
    realAssetNote: "基于脱敏业务场景展示交付形态，正式合作时会按客户产品与素材定制。",
    referenceBudget: "¥999 - ¥2999",
    coverImage
  },
  {
    id: "product-visual-upgrade",
    title: "企业产品图/详情页视觉升级",
    category: "AI营销增长",
    clientType: "制造业产品、设备企业、品牌商、电商和招商型企业",
    originalProblem:
      "现有产品图风格不统一，详情页只堆参数，客户看不出差异化价值，销售资料显得不专业。",
    diagnosisJudgment:
      "先做一组核心产品视觉模板，比直接做全站改版更低风险，也更容易验证客户是否愿意继续沟通。",
    productionLine: "产品视觉样品生产线",
    deliverables: ["产品主视觉", "场景图", "卖点信息图", "详情页模块", "视觉规范建议"],
    businessValue:
      "提升产品展示专业度，让官网、招商资料、电商页面和销售PPT有统一的视觉基础。",
    extendableServices: ["官网落地页", "产品视频", "招商手册"],
    status: "可定制",
    assetStatus: "mock",
    mediaType: "image",
    mediaPlaceholder: "演示封面：产品图/详情页视觉升级",
    realAssetNote: "基于脱敏业务场景展示交付形态，正式合作时会按客户产品与素材定制。",
    referenceBudget: "¥1999 - ¥6000",
    coverImage
  },
  {
    id: "founder-codex-coaching",
    title: "企业创始人Codex实战陪跑",
    category: "员工培训",
    clientType: "企业主、创始人、数字化负责人、想亲自推进AI项目的管理者",
    originalProblem:
      "知道Codex和AI编程有价值，但不会把业务需求拆成页面、数据、接口和验收标准，容易停留在试工具阶段。",
    diagnosisJudgment:
      "更适合用真实业务小项目陪跑，而不是只讲工具功能。目标是让负责人理解如何把想法推进成可演示MVP。",
    productionLine: "企业AI陪跑生产线",
    deliverables: ["业务需求拆解", "Codex实操陪跑", "MVP验收清单", "项目复盘", "下一阶段开发建议"],
    businessValue:
      "让企业主掌握从需求到可演示产品的基本方法，后续更容易判断外包、内部开发和AI工具的投入边界。",
    extendableServices: ["老板AI认知课", "内部AI教练", "团队项目陪跑"],
    status: "可定制",
    assetStatus: "mock",
    mediaType: "document",
    mediaPlaceholder: "演示截图：企业创始人Codex实战陪跑",
    realAssetNote: "基于脱敏业务场景展示交付形态，正式合作时会围绕客户真实任务陪跑。",
    referenceBudget: "¥3000起",
    coverImage
  },
  {
    id: "quote-project-mvp",
    title: "企业报价与项目管理系统MVP",
    category: "业务系统MVP",
    clientType: "工程服务、定制制造、项目制服务、设备安装和咨询交付企业",
    originalProblem:
      "报价、合同、项目进度和回款信息分散在多个表格，老板很难快速看到项目状态和经营风险。",
    diagnosisJudgment:
      "不建议直接做完整ERP，应先验证报价到项目交付的核心链路，做一个能演示、能复盘的轻量MVP。",
    productionLine: "业务系统MVP生产线",
    deliverables: ["报价工作台", "客户档案", "项目看板", "回款状态", "经营概览"],
    businessValue:
      "用MVP统一关键流程，让老板和团队先看见系统价值，再决定是否进入完整开发。",
    extendableServices: ["CRM集成", "审批流", "财务接口", "多角色权限"],
    status: "可演示MVP",
    assetStatus: "mock",
    mediaType: "system",
    mediaPlaceholder: "演示界面：报价与项目管理系统MVP",
    realAssetNote: "基于脱敏业务场景展示交付形态，正式合作时会按客户流程和字段定制。",
    referenceBudget: "¥8000起",
    coverImage
  },
  {
    id: "sports-mini-program-admin",
    title: "体育培训小程序管理后台MVP",
    category: "业务系统MVP",
    clientType: "体育培训机构、青少年运动馆、教练团队、连锁门店",
    originalProblem:
      "排课、学员、教练、消课和续费记录分散在微信群和表格，管理靠人工提醒，难以支撑多门店扩张。",
    diagnosisJudgment:
      "第一步应先跑通管理后台核心流程，再评估家长端小程序、支付、通知和多门店能力。",
    productionLine: "小程序管理后台MVP生产线",
    deliverables: ["学员管理", "课程排期", "教练管理", "消课记录", "运营数据看板"],
    businessValue:
      "先把机构内部管理流程标准化，为后续小程序、支付和多门店系统建设提供依据。",
    extendableServices: ["微信小程序", "支付接入", "家长端", "多门店权限"],
    status: "可演示MVP",
    assetStatus: "mock",
    mediaType: "system",
    mediaPlaceholder: "演示界面：体育培训小程序管理后台MVP",
    realAssetNote: "基于脱敏业务场景展示交付形态，正式合作时会按课程、学员和门店流程定制。",
    referenceBudget: "¥8000起",
    coverImage
  },
  {
    id: "knowledge-demo",
    title: "企业知识库问答Demo",
    category: "知识库 / 客服Agent",
    clientType: "产品资料多、客服问答重复、销售口径不统一的企业",
    originalProblem:
      "产品手册、案例、报价说明和常见问题分散在不同文档里，新员工和销售经常找不到准确答案。",
    diagnosisJudgment:
      "先整理高频资料并验证回答命中率，不建议一开始接入全量资料、复杂权限和所有客服渠道。",
    productionLine: "企业知识库生产线",
    deliverables: ["资料清洗", "FAQ结构", "问答Demo", "引用来源", "命中率复盘"],
    businessValue:
      "缩短资料查找和新员工培训时间，减少错误回答，提高销售和客服口径一致性。",
    extendableServices: ["客服Agent", "销售助手", "权限知识库", "企业内训助手"],
    status: "可演示MVP",
    assetStatus: "mock",
    mediaType: "system",
    mediaPlaceholder: "演示截图：知识库问答Demo",
    realAssetNote: "基于脱敏业务场景展示交付形态，正式合作时会按客户资料与高频问答定制。",
    referenceBudget: "¥1999 - ¥8000",
    coverImage
  }
];
