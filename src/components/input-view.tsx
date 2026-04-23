"use client";

import { useState, useRef } from "react";
import { SAMPLE_INPUT_EN, SAMPLE_INPUT_CN } from "@/lib/sample-data";
import { MOCK_RESULT_CN } from "@/lib/mock-result";

const PREVIEW_TASKS = MOCK_RESULT_CN.tasks.slice(0, 2);
const PREVIEW_TOTAL =
  MOCK_RESULT_CN.tasks.length +
  MOCK_RESULT_CN.pendingConfirmations.length +
  MOCK_RESULT_CN.risks.length +
  MOCK_RESULT_CN.nextSteps.length;

const ALLOWED_EXTENSIONS = ["txt", "md", "pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type UploadStatus = {
  type: "loading" | "success" | "error";
  message: string;
} | null;

function normalizeExtractedText(raw: string): string {
  // pdf-parse sometimes returns page markers like "-- 1 of 3 --" without actual content.
  // We treat those as non-content and avoid filling the editor with noise.
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function renderPdfFirstPageToDataUrl(file: File): Promise<string> {
  // Dynamic import to avoid SSR/prerender errors (DOMMatrix not defined).
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const getDocument = (pdfjs as any).getDocument as (args: any) => any;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布上下文");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png");
}

interface InputViewProps {
  onAnalyze: (text: string) => void;
}

export function InputView({ onAnalyze }: InputViewProps) {
  const [text, setText] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(null);
  const [ocrCandidate, setOcrCandidate] = useState<{ file: File; reason: string } | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadStatus({
        type: "error",
        message: `不支持 .${ext} 文件，请上传 .txt、.md 或 .pdf`,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus({ type: "error", message: "文件超过 5 MB 限制" });
      return;
    }

    setUploadStatus({ type: "loading", message: `正在提取：${file.name}…` });

    try {
      let extractedText = "";

      if (ext === "txt" || ext === "md") {
        extractedText = await file.text();
      } else if (ext === "pdf") {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/extract", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          const detail =
            typeof data.detail === "string" && data.detail ? `（${data.detail}）` : "";
          throw new Error((data.error || "PDF 解析失败") + detail);
        }
        extractedText = data.text;
      }

      const normalized = normalizeExtractedText(extractedText);
      const looksLikeNoTextLayer = normalized.length < 30;

      if (!normalized || looksLikeNoTextLayer) {
        if (ext === "pdf") {
          setOcrCandidate({
            file,
            reason: "这份 PDF 看起来是截图/扫描件（无可提取文本层），可尝试 OCR 识别。",
          });
        } else {
          setOcrCandidate(null);
        }
        setUploadStatus({
          type: "error",
          message:
            ext === "pdf"
              ? "未提取到可编辑文本（可能是图片/扫描型 PDF）。建议换 txt/md，或从原文复制聊天内容后再分析。"
              : "文件中未提取到有效文本内容",
        });
        return;
      }

      setText(normalized);
      setOcrCandidate(null);
      const charCount = normalized.length;
      setUploadStatus({
        type: "success",
        message: `已从 ${file.name} 提取 ${charCount} 字，请检查后点击「开始分析」`,
      });

      setTimeout(() => setUploadStatus(null), 8000);
    } catch (e) {
      setUploadStatus({
        type: "error",
        message: e instanceof Error ? e.message : "文件解析失败",
      });
    }
  };

  const handleTryOcr = async () => {
    if (!ocrCandidate) return;
    setOcrBusy(true);
    setUploadStatus({ type: "loading", message: "正在进行 OCR 识别（第 1 页）…" });
    try {
      const imageDataUrl = await renderPdfFirstPageToDataUrl(ocrCandidate.file);
      const saved = localStorage.getItem("actionbridge_api_config");
      const cfg = saved ? (JSON.parse(saved) as { apiKey?: string; baseUrl?: string }) : {};
      const apiKey = (cfg.apiKey || "").trim();
      const baseUrl = (cfg.baseUrl || "").trim() || "https://dashscope.aliyuncs.com/compatible-mode/v1";

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, apiKey, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data.detail === "string" && data.detail ? `（${data.detail}）` : "";
        throw new Error((data.error || "OCR 失败") + detail);
      }

      const normalized = normalizeExtractedText(String(data.text || ""));
      if (!normalized || normalized.length < 20) {
        throw new Error("OCR 未识别到有效文本");
      }

      setText(normalized);
      setOcrCandidate(null);
      setUploadStatus({
        type: "success",
        message: "OCR 已提取文本并回填，请检查后点击「开始分析」",
      });
      setTimeout(() => setUploadStatus(null), 8000);
    } catch (e) {
      setUploadStatus({
        type: "error",
        message: e instanceof Error ? e.message : "OCR 过程中出现错误",
      });
    } finally {
      setOcrBusy(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-8 sm:py-12">
      <div
        className="w-full max-w-3xl"
        style={{ animation: "fadeIn 0.4s ease-out" }}
      >
        {/* Hero */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a2e] sm:text-4xl leading-tight">
            讨论结束了，
            <br className="sm:hidden" />
            然后呢？
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-500">
            把会议记录、群聊讨论粘贴进来，自动提取任务、负责人、截止时间、风险和待确认事项。不是摘要，是可执行的下一步。
          </p>
        </section>

        {/* Value Props */}
        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "01",
              title: "任务与负责人",
              desc: "从对话中识别具体的 action item，归属到人",
            },
            {
              icon: "02",
              title: "风险与依赖",
              desc: "标记可能阻塞或延期的隐患",
            },
            {
              icon: "03",
              title: "待确认事项",
              desc: "模糊的口头共识变成明确的确认清单",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-stone-200/60 bg-white px-5 py-4 shadow-sm"
            >
              <span className="text-xs font-semibold text-[#4a6cf7]/70">
                {item.icon}
              </span>
              <p className="mt-2 text-sm font-semibold text-[#1a1a2e]">
                {item.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Sample Output Preview — non-interactive, visually distinct */}
        <section className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            分析结果示例 ↓
          </p>
          <div className="relative rounded-2xl border border-dashed border-stone-300/70 bg-stone-50/60 p-5 select-none">
            <span className="absolute top-3 right-3 rounded-full bg-stone-200/70 px-2 py-0.5 text-[10px] font-semibold text-stone-500 tracking-wide">
              PREVIEW
            </span>

            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-4">
              <span className="text-xs text-stone-400">
                <strong className="text-sm text-[#4a6cf7]/70">
                  {MOCK_RESULT_CN.tasks.length}
                </strong>{" "}
                项任务
              </span>
              <span className="text-xs text-stone-400">
                <strong className="text-sm text-violet-500/70">
                  {MOCK_RESULT_CN.pendingConfirmations.length}
                </strong>{" "}
                项待确认
              </span>
              <span className="text-xs text-stone-400">
                <strong className="text-sm text-amber-500/70">
                  {MOCK_RESULT_CN.risks.length}
                </strong>{" "}
                个风险
              </span>
              <span className="text-xs text-stone-400">
                <strong className="text-sm text-emerald-500/70">
                  {MOCK_RESULT_CN.nextSteps.length}
                </strong>{" "}
                个下一步
              </span>
            </div>

            <div className="space-y-3 border-l-2 border-[#4a6cf7]/30 pl-4 opacity-80">
              {PREVIEW_TASKS.map((t) => (
                <div key={t.id}>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 flex h-4 w-4 shrink-0 rounded border border-stone-300/80" />
                    <div className="min-w-0">
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {t.description}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400">
                        {t.owner && (
                          <span>
                            负责人：
                            <span className="text-stone-600">{t.owner}</span>
                          </span>
                        )}
                        {t.deadline && (
                          <span>
                            截止：
                            <span className="text-stone-600">
                              {t.deadline}
                            </span>
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-100/60 px-2 py-0.5 text-emerald-600/80">
                          高置信
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-stone-400/80">
                        依据：&ldquo;
                        {t.sourceExcerpt.length > 45
                          ? t.sourceExcerpt.slice(0, 45) + "…"
                          : t.sourceExcerpt}
                        &rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-stone-400">
              + 还有 {PREVIEW_TOTAL - 2} 项 · 每条可确认、可编辑、可导出
            </p>
          </div>
        </section>

        {/* Input Area */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="discussion-input"
              className="text-sm font-medium text-stone-600"
            >
              粘贴讨论内容
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus?.type === "loading"}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-[#4a6cf7] transition-colors disabled:opacity-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M8 1v10M4 5l4-4 4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 11v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {uploadStatus?.type === "loading" ? "提取中…" : "或 上传文件"}
              <span className="text-stone-300">.txt .md .pdf</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
                e.target.value = "";
              }}
            />
          </div>

          <textarea
            id="discussion-input"
            className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm leading-relaxed text-[#1a1a2e] shadow-sm placeholder:text-stone-400 focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10 transition-shadow"
            rows={8}
            placeholder={
              "支持任意格式：会议记录、Slack 对话、Zoom transcript、随手记的要点……\n\n也可以直接上传 .txt / .md / .pdf 文件，系统会自动提取文本。"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Upload status feedback */}
          {uploadStatus && (
            <p
              className={`mt-2 text-xs ${
                uploadStatus.type === "loading"
                  ? "text-[#4a6cf7]"
                  : uploadStatus.type === "success"
                    ? "text-emerald-600"
                    : "text-red-500"
              }`}
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              {uploadStatus.type === "loading" && (
                <span className="inline-block mr-1 animate-spin">⟳</span>
              )}
              {uploadStatus.message}
              {uploadStatus.type === "error" && (
                <button
                  onClick={() => setUploadStatus(null)}
                  className="ml-2 text-stone-400 hover:text-stone-600"
                >
                  关闭
                </button>
              )}
            </p>
          )}

          {/* OCR helper for scanned/screenshot PDF */}
          {ocrCandidate && (
            <div className="mt-2 rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2">
              <p className="text-xs text-amber-700">{ocrCandidate.reason}</p>
              <button
                type="button"
                onClick={handleTryOcr}
                disabled={ocrBusy}
                className="mt-2 rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#111126] disabled:opacity-50"
              >
                {ocrBusy ? "OCR 识别中…" : "尝试 OCR 提取（第 1 页）"}
              </button>
              <p className="mt-1.5 text-[11px] text-amber-700/80">
                提示：OCR 会把第 1 页截图上传到阿里云进行识别，回填后请人工检查再分析。
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onAnalyze(text)}
              disabled={!text.trim()}
              className="rounded-xl bg-[#4a6cf7] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3b5de7] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              开始分析
            </button>
            <button
              onClick={() => setText(SAMPLE_INPUT_CN)}
              className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md active:scale-[0.98]"
            >
              中文示例
            </button>
            <button
              onClick={() => setText(SAMPLE_INPUT_EN)}
              className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md active:scale-[0.98]"
            >
              English Sample
            </button>
            {text && (
              <button
                onClick={() => {
                  setText("");
                  setUploadStatus(null);
                }}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                清空
              </button>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="mt-10 text-xs leading-relaxed text-stone-400">
          结果由 AI 生成，仅作为参考起点。所有提取项均需人工确认后再推进。
        </p>
      </div>
    </main>
  );
}
