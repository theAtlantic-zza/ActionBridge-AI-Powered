"use client";

import { useState } from "react";
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
  const [showOriginal, setShowOriginal] = useState(false);

  const allItems = [
    ...result.tasks,
    ...result.pendingConfirmations,
    ...result.risks,
    ...result.nextSteps,
  ];
  const confirmedCount = allItems.filter((i) => i.confirmed).length;
  const unconfirmedCount = allItems.length - confirmedCount;
  const needsReviewCount = allItems.filter((i) => i.confidence !== "high").length;
  const missingOwnerCount = result.tasks.filter((t: TaskItem) => !t.owner).length +
    result.nextSteps.filter((n) => !n.owner).length;

  const updateItem = <K extends keyof AnalysisResult>(
    section: K,
    index: number,
    updates: Record<string, unknown>
  ) => {
    const arr = [...(result[section] as unknown[])];
    arr[index] = { ...arr[index], ...updates };
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

  // Review hints for export area
  const reviewHints: string[] = [];
  if (unconfirmedCount > 0) reviewHints.push(`${unconfirmedCount} 项未确认`);
  if (missingOwnerCount > 0) reviewHints.push(`${missingOwnerCount} 项缺负责人`);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10 sm:py-14">
      <div className="w-full max-w-3xl" style={{ animation: "fadeIn 0.4s ease-out" }}>

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
          <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 text-sm text-amber-700" style={{ animation: "fadeIn 0.3s ease-out" }}>
            当前为演示模式，展示的是预设示例结果。使用「中文示例」或「English Sample」可查看匹配效果。
          </div>
        )}

        {/* Summary stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Action Items" value={result.tasks.length} accent="text-[#4a6cf7]" />
          <SummaryCard label="Open Questions" value={result.pendingConfirmations.length} accent="text-violet-600" />
          <SummaryCard label="Risks" value={result.risks.length} accent="text-amber-600" />
          <SummaryCard label="Needs Review" value={needsReviewCount} accent="text-red-500" />
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-3 text-sm text-stone-500">
          <div className="h-1.5 flex-1 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: allItems.length > 0 ? `${(confirmedCount / allItems.length) * 100}%` : "0%" }}
            />
          </div>
          <span className="shrink-0 text-xs">{confirmedCount}/{allItems.length} 已确认</span>
        </div>

        {/* Sections */}
        <ResultSection title="任务项" count={result.tasks.length} variant="tasks">
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

        <ResultSection title="待确认事项" count={result.pendingConfirmations.length} variant="confirmations">
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

        <ResultSection title="风险点" count={result.risks.length} variant="risks">
          {result.risks.map((r, i) => (
            <ResultItem
              key={r.id}
              description={r.description}
              sourceExcerpt={r.sourceExcerpt}
              confidence={r.confidence}
              confirmed={r.confirmed}
              fields={[{ label: "潜在影响", value: r.impact, key: "impact" }]}
              onUpdate={(u) => updateItem("risks", i, u)}
            />
          ))}
        </ResultSection>

        <ResultSection title="下一步动作" count={result.nextSteps.length} variant="nextSteps">
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

        {/* Export toolbar */}
        <div className="mt-4 rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-[#1a1a2e]">导出跟进清单</p>
          {reviewHints.length > 0 ? (
            <p className="mb-4 text-xs text-amber-600">
              还有{reviewHints.join("、")}，建议确认后再导出
            </p>
          ) : (
            <p className="mb-4 text-xs text-emerald-600">
              所有项目已确认，可以导出发给团队了
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyForSync}
              className="rounded-xl bg-[#4a6cf7] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3b5de7] active:scale-[0.98]"
            >
              复制为会后同步
            </button>
            <button
              onClick={handleExportMd}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.98]"
            >
              下载 .md
            </button>
            <button
              onClick={handleExportCsv}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.98]"
            >
              下载任务 .csv
            </button>
          </div>
        </div>

        {/* Original discussion (collapsible) */}
        <div className="mt-6">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform ${showOriginal ? "rotate-90" : ""}`}
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showOriginal ? "收起原始讨论" : "查看原始讨论"}
          </button>
          {showOriginal && (
            <div
              className="mt-3 rounded-xl border border-stone-200/60 bg-white p-4 shadow-sm"
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-stone-600 font-sans">
                {originalInput}
              </pre>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs leading-relaxed text-stone-400">
          以上内容由 AI 从讨论原文中提取，每条结果附有依据原文。请逐项确认后再推进——AI 负责提取，你负责拍板。
        </p>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-stone-200/60 bg-white px-4 py-3 shadow-sm">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-xs text-stone-500">{label}</p>
    </div>
  );
}
