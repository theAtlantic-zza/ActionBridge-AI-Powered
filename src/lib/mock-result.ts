import type { AnalysisResult } from "./types";

export const MOCK_RESULT_EN: AnalysisResult = {
  tasks: [
    {
      id: "t1",
      description: "完成新用户 onboarding flow 的线框图初稿",
      owner: "Jamie",
      deadline: "明天 EOD",
      sourceExcerpt:
        "Jamie: Yeah I started but got pulled into the payment bug. I should have a first draft by tomorrow EOD.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t2",
      description: "负责 onboarding 的文案撰写",
      owner: "Sam",
      deadline: null,
      sourceExcerpt:
        "Sam: I can take the copy. But I need the final user segments from marketing.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t3",
      description: "联系 Priya 获取最终用户分群数据",
      owner: "Alex",
      deadline: "周四前",
      sourceExcerpt:
        "Alex: Let me ping Priya. If we don't get that by Thursday we'll just go with what we have from the last round.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t4",
      description: "与 Dev 团队协调部署，确保周五中午前上 staging",
      owner: "Jamie",
      deadline: "周四下午 check-in，周五中午前完成",
      sourceExcerpt:
        "Jamie: Sure, I'll set up a check-in with them Thursday afternoon.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t5",
      description: "准备周一内部 demo",
      owner: "Sam",
      deadline: "周五前",
      sourceExcerpt:
        "Sam: Also, are we still planning to do an internal demo next Monday? If so I need at least Friday to prep.",
      confidence: "medium",
      confirmed: false,
    },
  ],
  pendingConfirmations: [
    {
      id: "c1",
      description: "Onboarding 步骤数确定为 3 步（v1），后续可迭代",
      relatedTo: "onboarding flow 设计",
      sourceExcerpt:
        "Alex: Good point. Let's go with 3 steps for v1, keep it simple. We can always iterate.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "c2",
      description:
        "如果周四前未收到 Priya 的用户分群数据，将使用上一轮的旧数据",
      relatedTo: "文案撰写依赖",
      sourceExcerpt:
        "Alex: If we don't get that by Thursday we'll just go with what we have from the last round.",
      confidence: "medium",
      confirmed: false,
    },
  ],
  risks: [
    {
      id: "r1",
      description: "支付 bug 可能复发，导致 Jamie 再次被抽调",
      impact: "onboarding 线框图和部署协调可能延期",
      sourceExcerpt:
        "Alex: Oh one risk — if the payment bug resurfaces we might lose Jamie again.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "r2",
      description: "Priya 的用户分群数据尚未收到，可能影响文案质量",
      impact: "文案可能需要基于旧数据撰写，上线后需再次修改",
      sourceExcerpt:
        "Sam: I can take the copy. But I need the final user segments from marketing. Priya said she'd send them but I haven't seen anything.",
      confidence: "medium",
      confirmed: false,
    },
  ],
  nextSteps: [
    {
      id: "n1",
      description: "Jamie 如被阻塞需立即通知，Sam 作为布局工作的 backup",
      owner: "Jamie / Sam",
      priority: "high",
      sourceExcerpt:
        "Alex: Let's have a backup plan, maybe Sam can pick up the layout if needed. Sam: I can do that, just give me a heads up early.",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "n2",
      description: "周五中午前确保所有内容上 staging，为周一 demo 做准备",
      owner: "全员",
      priority: "high",
      sourceExcerpt:
        "Alex: Let's make sure everything's at least in staging by Friday noon.",
      confidence: "high",
      confirmed: false,
    },
  ],
  meta: {
    inputWordCount: 283,
    analyzedAt: new Date().toISOString(),
  },
};

export const MOCK_RESULT_CN: AnalysisResult = {
  tasks: [
    {
      id: "t1",
      description: "完成详情页交互动效设计，交付开发",
      owner: "张薇",
      deadline: "周一",
      sourceExcerpt:
        "张薇：UI 这边主要的页面我做完了，但详情页还差交互动效，预计还要两天。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t2",
      description: "催王浩确认后端接口文档定稿",
      owner: "李明",
      deadline: "周五前",
      sourceExcerpt:
        "李明：这个有点卡，我去催一下王浩。如果周五还没出来，咱们就先用 mock 数据做联调，别干等着。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t3",
      description: "确认详情页是否加收藏功能，今天给设计答复",
      owner: "李明",
      deadline: "今天",
      sourceExcerpt:
        "李明：这个我确认一下，今天给你答复。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t4",
      description: "按周一拿到设计稿排期，争取周二完成开发",
      owner: "赵凯",
      deadline: "周二",
      sourceExcerpt:
        "赵凯：行，那我这边按周一拿到设计稿来排，争取周二完成开发，给测试留最多时间。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "t5",
      description: "协调测试资源，确认小林能否提前介入",
      owner: "李明",
      deadline: "今天",
      sourceExcerpt:
        "李明：我跟测试负责人聊一下能不能提前安排。",
      confidence: "medium",
      confirmed: false,
    },
  ],
  pendingConfirmations: [
    {
      id: "c1",
      description: "详情页是否包含收藏功能（PRD 写了但会上说先不做）",
      relatedTo: "详情页设计范围",
      sourceExcerpt:
        "张薇：产品那边确认了吗——详情页到底要不要加收藏功能？上次开会说的是先不做，但我看 PRD 里又写了。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "c2",
      description: "如果接口文档周五未出，使用 mock 数据先行联调",
      relatedTo: "前后端联调方案",
      sourceExcerpt:
        "李明：如果周五还没出来，咱们就先用 mock 数据做联调，别干等着。",
      confidence: "medium",
      confirmed: false,
    },
    {
      id: "c3",
      description: "上线时间可能从周三推迟到周五，需确认",
      relatedTo: "项目排期",
      sourceExcerpt:
        "李明：实在不行就把上线时间推到周五，质量不能砍。",
      confidence: "medium",
      confirmed: false,
    },
  ],
  risks: [
    {
      id: "r1",
      description: "后端接口文档未定稿，阻塞前后端联调",
      impact: "开发进度可能延后，压缩测试时间",
      sourceExcerpt:
        "赵凯：后端接口文档还没定稿，王浩那边说这周才能出。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "r2",
      description: "测试人员下周一才释放，测试窗口仅两天",
      impact: "如按原计划周三上线，测试覆盖不足，质量风险高",
      sourceExcerpt:
        "赵凯：测试那边小林下周一才从另一个项目释放出来，如果我们周三上线，测试时间只有两天，挺紧的。",
      confidence: "high",
      confirmed: false,
    },
  ],
  nextSteps: [
    {
      id: "n1",
      description: "李明今天确认收藏功能和接口文档两件事，结果同步到群里",
      owner: "李明",
      priority: "high",
      sourceExcerpt:
        "李明：好，那总结一下大家各自盯好自己的部分，我今天把收藏功能和接口文档两件事确认掉。",
      confidence: "high",
      confirmed: false,
    },
    {
      id: "n2",
      description: "如收藏功能确认要做，张薇需额外一天完成设计",
      owner: "张薇",
      priority: "medium",
      sourceExcerpt:
        "张薇：加收藏的话再多一天，UI 不复杂，但动效要调。",
      confidence: "high",
      confirmed: false,
    },
  ],
  meta: {
    inputWordCount: 320,
    analyzedAt: new Date().toISOString(),
  },
};

export const MOCK_RESULT = MOCK_RESULT_EN;
