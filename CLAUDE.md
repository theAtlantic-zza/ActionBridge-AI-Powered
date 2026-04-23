# ActionBridge — 项目上下文

## 产品定位
- 面向小团队协作的 AI 执行收口助手
- 核心价值：把混乱的团队讨论转化为可执行的下一步（任务、负责人、截止、风险、待确认）
- **不是**会议摘要、纪要工具、通用聊天助手、协同平台

## 项目背景
- 求职作品：面向 AI PM 暑期实习申请
- 需要体现：痛点识别、问题抽象、AI 产品定义、AI 边界意识、MVP 收敛能力
- 必须与 DocDigest（文档理解/摘要工具）明确区分

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- 单页面状态机架构（input → analyzing → result）
- AI：OpenAI-compatible API + mock fallback（无 key 时用预设数据演示）

## 关键约束
- 10 天 MVP，优先完成度而非功能数量
- 不做：登录、历史记录、文件上传、多页面系统、实时语音、复杂后端、多人协作
- 不加多余依赖
- 遵循根目录 CLAUDE.md 的编码规范（简洁优先、外科手术式改动、不过度设计）

## 当前文件结构
```
src/
├── app/
│   ├── api/analyze/route.ts   — 分析 API（LLM + mock）
│   ├── page.tsx               — 状态编排器
│   ├── layout.tsx             — 根 layout
│   └── globals.css            — 全局样式 + 动画
├── components/
│   ├── input-view.tsx         — 输入页
│   ├── analyzing-view.tsx     — 加载态
│   ├── result-view.tsx        — 结果页 + 导出
│   ├── result-section.tsx     — 结果分区
│   └── result-item.tsx        — 可编辑结果卡片
└── lib/
    ├── types.ts               — 数据 schema
    ├── prompt.ts              — LLM prompt
    ├── mock-result.ts         — mock 数据（英文 + 中文）
    ├── sample-data.ts         — 示例输入（英文 + 中文）
    └── export.ts              — 导出工具
```

## 视觉风格
- 暖白背景 #f8f8f6，深蓝黑文字 #1a1a2e，品牌蓝 #4a6cf7
- 圆角卡片 rounded-2xl + 微阴影，产品感而非技术感
- 中文为主界面语言，产品名和 tagline 保持英文

## Mock 模式行为
- 无 OPENAI_API_KEY 时自动进入 mock 模式
- 提供英文和中文两组示例，各有对应的 mock 结果
- 用户输入非示例文本时，mock 仍返回数据但明确标注"演示数据"
