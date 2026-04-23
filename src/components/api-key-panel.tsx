"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "actionbridge_api_config";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  apiKey: "",
  baseUrl: DEFAULT_BASE_URL,
  model: DEFAULT_MODEL,
};

export function useApiConfig() {
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<ApiConfig>;
      setConfig({
        apiKey: parsed.apiKey?.trim() ?? "",
        baseUrl: parsed.baseUrl?.trim() || DEFAULT_BASE_URL,
        model: parsed.model?.trim() || DEFAULT_MODEL,
      });
    } catch {
      setConfig(DEFAULT_CONFIG);
    }
  }, []);

  const saveConfig = (next: ApiConfig) => {
    const normalized: ApiConfig = {
      apiKey: next.apiKey.trim(),
      baseUrl: next.baseUrl.trim() || DEFAULT_BASE_URL,
      model: next.model.trim() || DEFAULT_MODEL,
    };
    setConfig(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  return { config, saveConfig };
}

interface ApiKeyButtonProps {
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
  onToast: (msg: string) => void;
}

export function ApiKeyButton({ config, onSave, onToast }: ApiKeyButtonProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ApiConfig>(config);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

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
    onToast(draft.apiKey ? "模型配置已保存" : "已切换为演示模式");
  };

  const hasKey = !!config.apiKey;

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
          className="absolute right-0 top-9 z-50 w-[22rem] rounded-xl border border-stone-200/60 bg-white p-4 shadow-lg"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <p className="mb-1 text-sm font-semibold text-[#1a1a2e]">连接 AI 模型</p>
          <p className="mb-3 text-xs text-stone-400">
            支持 OpenAI 兼容接口。不输入 Key 则使用演示模式。
          </p>
          <label className="mb-1 block text-[11px] font-medium text-stone-500">API Key</label>
          <input
            type="password"
            placeholder="sk-..."
            value={draft.apiKey}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, apiKey: e.target.value }))
            }
            className="mb-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-[#1a1a2e] placeholder:text-stone-400 focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10"
          />
          <label className="mb-1 block text-[11px] font-medium text-stone-500">Base URL</label>
          <input
            type="text"
            placeholder="https://api.openai.com/v1"
            value={draft.baseUrl}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, baseUrl: e.target.value }))
            }
            className="mb-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-[#1a1a2e] placeholder:text-stone-400 focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10"
          />
          <label className="mb-1 block text-[11px] font-medium text-stone-500">Model</label>
          <input
            type="text"
            placeholder="gpt-4o-mini / qwen-plus / qwen-max"
            value={draft.model}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, model: e.target.value }))
            }
            className="mb-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-[#1a1a2e] placeholder:text-stone-400 focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10"
          />
          <button
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
              }))
            }
            className="mb-3 text-[11px] text-[#4a6cf7] hover:text-[#3b5de7]"
          >
            使用阿里云百炼兼容地址
          </button>
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
