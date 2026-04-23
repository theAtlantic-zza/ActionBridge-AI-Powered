"use client";

import type { AnalysisResult, TaskItem } from "@/lib/types";
import { exportAsMarkdown, exportTasksAsCsv, downloadFile } from "@/lib/export";
import { ResultSection } from "./result-section";
import { ResultItem } from "./result-item";

interface ResultViewProps {
  result: AnalysisResult;
  originalInput: string;
  isMock: boolean;
  mockMatchesSample: boolean;
  onUpdateResult: (result: AnalysisResult) => void;
  onNewAnalysis: () => void;
  onToast: (msg: string) => void;
}

export function ResultView({
  result,
  originalInput,
  isMock,
  mockMatchesSample,
  onUpdateResult,
  onNewAnalysis,
  onToast,
}: ResultViewProps) {
  const allItems = [
    ...result.tasks,
    ...result.pendingConfirmations,
    ...result.risks,
    ...result.nextSteps,
  ];
  const confirmedCount = allItems.filter((i) => i.confirmed).length;
  const unconfirmedCount = allItems.length - confirmedCount;
  const needsReviewCount = allItems.filter((i) => i.confidence !== "high").length;
  const missingOwnerCount =
    result.tasks.filter((t: TaskItem) => !t.owner).length +
    result.nextSteps.filter((n) => !n.owner).length;

  const updateItem = (
    section: "tasks" | "pendingConfirmations" | "risks" | "nextSteps",
    index: number,
    updates: Record<string, unknown>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = (result[section] as any[]).map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onUpdateResult({ ...result, [section]: arr });
  };

  const handleCopyForSync = async () => {
    const md = exportAsMarkdown(result);
    await navigator.clipboard.writeText(md);
    onToast("已复制，可直接粘贴到群聊或邮件");
  };

  const handleExportMd = () => {
    const md = exportAsMarkdown(result);
    downloadFile(md, `follow-up-${Date.now()}.md`);
    onToast("已下载跟进清单");
  };

  const handleExportCsv = () => {
    const csv = exportTasksAsCsv(result);
    downloadFile(csv, `tasks-${Date.now()}.csv`);
    onToast("已下载任务表");
  };

  const reviewHints: string[] = [];
  if (unconfirmedCount > 0) reviewHints.push(`${unconfirmedCount} 项未确认`);
  if (missingOwnerCount > 0) reviewHints.push(`${missingOwnerCount} 项缺负责人`);

  return (
    <main className="flex flex-1 flex-col px-4 sm:px-6 py-8 sm:py-12">
      <div
        className="mx-auto w-full max-w-6xl"
        style={{ animation: "fadeIn 0.4s ease-out" }}
      >
        {/* Dashboard header */}
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 className="text-2xl font-bold text-[#1a1a2e]">执行收口面板</h2>
          {isMock && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">
              演示模式
            </span>
          )}
        </div>

        {/* Mock notice */}
        {isMock && !mockMatchesSample && (
          <div
            className="mb-6 rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 text-sm text-amber-700"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            当前为演示模式，展示的是预设示例结果。使用「中文示例」或「English
            Sample」可查看匹配效果。
          </div>
        )}

        {/* Summary stat cards — full width, always visible */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryCard
            label="Action Items"
            value={result.tasks.length}
            accent="text-[#4a6cf7]"
          />
          <SummaryCard
            label="Open Questions"
            value={result.pendingConfirmations.length}
            accent="text-violet-600"
          />
          <SummaryCard
            label="Risks"
            value={result.risks.length}
            accent="text-amber-600"
          />
          <SummaryCard
            label="Needs Review"
            value={needsReviewCount}
            accent="text-red-500"
          />
          <NewAnalysisCard onClick={onNewAnalysis} />
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Left: main content */}
          <div className="flex-1 min-w-0">
            <ResultSection
              title="任务项"
              count={result.tasks.length}
              variant="tasks"
            >
              {result.tasks.map((t, i) => (
                <ResultItem
                  key={t.id}
                  description={t.description}
                  sourceExcerpt={t.sourceExcerpt}
                  confidence={t.confidence}
                  confirmed={t.confirmed}
                  fields={[
                    { label: "负责人", value: t.owner, key: "owner" },
                    { label: "截止时间", value: t.deadline, key: "deadline" },
                  ]}
                  onUpdate={(u) => updateItem("tasks", i, u)}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="待确认事项"
              count={result.pendingConfirmations.length}
              variant="confirmations"
            >
              {result.pendingConfirmations.map((c, i) => (
                <ResultItem
                  key={c.id}
                  description={c.description}
                  sourceExcerpt={c.sourceExcerpt}
                  confidence={c.confidence}
                  confirmed={c.confirmed}
                  fields={[
                    { label: "关联", value: c.relatedTo, key: "relatedTo" },
                  ]}
                  onUpdate={(u) => updateItem("pendingConfirmations", i, u)}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="风险点"
              count={result.risks.length}
              variant="risks"
            >
              {result.risks.map((r, i) => (
                <ResultItem
                  key={r.id}
                  description={r.description}
                  sourceExcerpt={r.sourceExcerpt}
                  confidence={r.confidence}
                  confirmed={r.confirmed}
                  fields={[
                    { label: "潜在影响", value: r.impact, key: "impact" },
                  ]}
                  onUpdate={(u) => updateItem("risks", i, u)}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="下一步动作"
              count={result.nextSteps.length}
              variant="nextSteps"
            >
              {result.nextSteps.map((n, i) => (
                <ResultItem
                  key={n.id}
                  description={n.description}
                  sourceExcerpt={n.sourceExcerpt}
                  confidence={n.confidence}
                  confirmed={n.confirmed}
                  fields={[
                    { label: "负责人", value: n.owner, key: "owner" },
                    { label: "优先级", value: n.priority, key: "priority" },
                  ]}
                  onUpdate={(u) => updateItem("nextSteps", i, u)}
                />
              ))}
            </ResultSection>

            <p className="mt-2 text-xs leading-relaxed text-stone-400 lg:hidden">
              AI 负责提取，你负责拍板。每条结果附有依据原文。
            </p>
          </div>

          {/* Right: sidebar */}
          <aside className="w-full mt-8 lg:mt-0 lg:w-80 lg:shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4 sidebar-scroll">
            {/* Review progress */}
            <div className="rounded-xl border border-stone-200/60 bg-white p-4">
              <p className="text-sm font-semibold text-[#1a1a2e] mb-3">
                审核进度
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1.5 flex-1 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{
                      width:
                        allItems.length > 0
                          ? `${(confirmedCount / allItems.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="shrink-0 text-xs text-stone-500 font-medium tabular-nums">
                  {confirmedCount}/{allItems.length}
                </span>
              </div>
              {reviewHints.length > 0 ? (
                <p className="text-xs text-amber-600">
                  还有{reviewHints.join("、")}
                </p>
              ) : (
                <p className="text-xs text-emerald-600">
                  所有项目已确认 ✓
                </p>
              )}
            </div>

            {/* Export panel */}
            <div className="rounded-xl border border-stone-200/60 bg-white p-4">
              <p className="text-sm font-semibold text-[#1a1a2e] mb-3">
                导出跟进清单
              </p>
              <button
                onClick={handleCopyForSync}
                className="mb-2.5 w-full rounded-lg bg-[#4a6cf7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3b5de7] active:scale-[0.98]"
              >
                复制为会后同步
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleExportMd}
                  className="flex-1 rounded-lg border border-stone-200 bg-white py-2 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.98]"
                >
                  下载 .md
                </button>
                <button
                  onClick={handleExportCsv}
                  className="flex-1 rounded-lg border border-stone-200 bg-white py-2 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.98]"
                >
                  下载 .csv
                </button>
              </div>
              {reviewHints.length > 0 && (
                <p className="mt-2.5 text-[11px] text-amber-600/80">
                  建议确认后再导出
                </p>
              )}
            </div>

            {/* Original discussion */}
            <div className="rounded-xl border border-stone-200/60 bg-white p-4">
              <p className="text-sm font-semibold text-[#1a1a2e] mb-2">
                原始讨论
              </p>
              <div className="max-h-60 overflow-y-auto sidebar-scroll rounded-lg bg-stone-50/80 p-3">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-stone-600 font-sans">
                  {originalInput}
                </pre>
              </div>
            </div>

            <p className="hidden lg:block text-[11px] leading-relaxed text-stone-400">
              AI 负责提取，你负责拍板。每条结果附有依据原文。
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/60 bg-white px-4 py-3 shadow-sm">
      <p className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
      <p className="mt-0.5 text-xs text-stone-500">{label}</p>
    </div>
  );
}

function NewAnalysisCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-stone-200/60 bg-white px-4 py-3 text-left shadow-sm transition-all hover:bg-stone-50 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1a1a2e]">新建分析</p>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 group-hover:text-stone-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2v8M2 6h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
      <p className="mt-1 text-xs text-stone-500">重新粘贴/上传并开始</p>
    </button>
  );
}
