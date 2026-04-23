"use client";

import { useState, useCallback } from "react";
import type { AnalysisResult } from "@/lib/types";
import { InputView } from "@/components/input-view";
import { AnalyzingView } from "@/components/analyzing-view";
import { ResultView } from "@/components/result-view";
import { ApiKeyButton, useApiKey } from "@/components/api-key-panel";

type AppPhase = "input" | "analyzing" | "result";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [mockMatchesSample, setMockMatchesSample] = useState(false);
  const [originalInput, setOriginalInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { apiKey, saveKey } = useApiKey();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleAnalyze = async (text: string) => {
    setOriginalInput(text);
    setPhase("analyzing");
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userApiKey: apiKey || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "分析失败");
      }

      setResult(data.result);
      setIsMock(data.mock ?? false);
      setMockMatchesSample(data.mockMatchesSample ?? false);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析过程中出现错误");
      setPhase("input");
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setIsMock(false);
    setMockMatchesSample(false);
    setError(null);
    setPhase("input");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="border-b border-stone-200/60 px-6 py-4 backdrop-blur-sm bg-[#f8f8f6]/80 sticky top-0 z-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1a2e] text-[11px] font-bold text-white">
              A
            </div>
            <h1 className="text-base font-semibold tracking-tight text-[#1a1a2e]">
              ActionBridge
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {phase === "result" && (
              <button
                onClick={handleNewAnalysis}
                className="text-sm text-stone-500 hover:text-[#1a1a2e] transition-colors"
              >
                新建分析
              </button>
            )}
            <ApiKeyButton apiKey={apiKey} onSave={saveKey} onToast={showToast} />
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && phase === "input" && (
        <div className="mx-auto mt-4 w-full max-w-3xl px-6" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-400 hover:text-red-600"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Phase rendering */}
      {phase === "input" && <InputView onAnalyze={handleAnalyze} />}
      {phase === "analyzing" && <AnalyzingView />}
      {phase === "result" && result && (
        <ResultView
          result={result}
          originalInput={originalInput}
          isMock={isMock}
          mockMatchesSample={mockMatchesSample}
          onUpdateResult={setResult}
          onNewAnalysis={handleNewAnalysis}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#1a1a2e] px-5 py-2.5 text-sm text-white shadow-lg"
          style={{ animation: "toastIn 0.25s ease-out" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
