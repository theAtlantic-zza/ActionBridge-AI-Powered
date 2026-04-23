"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "actionbridge_api_key";

export function useApiKey() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    setApiKey(localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  const saveKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return { apiKey, saveKey };
}

interface ApiKeyButtonProps {
  apiKey: string;
  onSave: (key: string) => void;
  onToast: (msg: string) => void;
}

export function ApiKeyButton({ apiKey, onSave, onToast }: ApiKeyButtonProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(apiKey);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraft(apiKey); }, [apiKey]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSave = () => {
    onSave(draft);
    setOpen(false);
    onToast(draft ? "API Key 已保存" : "已切换为演示模式");
  };

  const hasKey = !!apiKey;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${
          hasKey
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-stone-200 bg-white text-stone-500 hover:text-stone-700"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M10.5 1.5a3.5 3.5 0 0 1 1.68 6.57l.32.43 2 2v2h-2v-1h-1v-1l-1.32-1.32A3.5 3.5 0 1 1 10.5 1.5zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="currentColor"/>
        </svg>
        {hasKey ? "已连接" : "API Key"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-50 w-80 rounded-xl border border-stone-200/60 bg-white p-4 shadow-lg"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <p className="mb-1 text-sm font-semibold text-[#1a1a2e]">连接 AI 模型</p>
          <p className="mb-3 text-xs text-stone-400">
            输入 OpenAI 兼容的 API Key，即可用你自己的讨论内容进行真实分析。不输入则使用演示数据。
          </p>
          <input
            type="password"
            placeholder="sk-..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mb-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-[#1a1a2e] placeholder:text-stone-400 focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-stone-400">Key 仅存于浏览器本地</p>
            <button
              onClick={handleSave}
              className="rounded-lg bg-[#4a6cf7] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b5de7] transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
