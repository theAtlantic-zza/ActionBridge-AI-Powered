"use client";

import { useState } from "react";
import type { Confidence } from "@/lib/types";

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-red-50 text-red-600",
};

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "高置信",
  medium: "中置信",
  low: "需人工确认",
};

interface Field {
  label: string;
  value: string | null;
  key: string;
}

interface ResultItemProps {
  description: string;
  sourceExcerpt: string;
  confidence: Confidence;
  confirmed: boolean;
  fields?: Field[];
  onUpdate: (updates: Record<string, unknown>) => void;
}

export function ResultItem({
  description,
  sourceExcerpt,
  confidence,
  confirmed,
  fields,
  onUpdate,
}: ResultItemProps) {
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(description);
  const [editFields, setEditFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields?.forEach((f) => {
      init[f.key] = f.value ?? "";
    });
    return init;
  });

  const handleSave = () => {
    const updates: Record<string, unknown> = { description: editDesc };
    fields?.forEach((f) => {
      updates[f.key] = editFields[f.key] || null;
    });
    onUpdate(updates);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditDesc(description);
    const init: Record<string, string> = {};
    fields?.forEach((f) => {
      init[f.key] = f.value ?? "";
    });
    setEditFields(init);
    setEditing(false);
  };

  const needsReview = confidence === "low";

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
        confirmed
          ? "border-emerald-200/60 bg-emerald-50/20"
          : needsReview
            ? "border-red-200/60"
            : "border-stone-200/60"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Confirm checkbox */}
        <button
          onClick={() => onUpdate({ confirmed: !confirmed })}
          className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all ${
            confirmed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-stone-300 hover:border-stone-400"
          }`}
          aria-label={confirmed ? "取消确认" : "确认此项"}
        >
          {confirmed && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Description */}
          {editing ? (
            <textarea
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-[#1a1a2e] focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
            />
          ) : (
            <p className={`text-sm leading-relaxed ${confirmed ? "text-stone-400 line-through" : "text-[#1a1a2e]"}`}>
              {description}
            </p>
          )}

          {/* Metadata fields — show "待指定" for null values */}
          {fields && fields.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {fields.map((f) =>
                editing ? (
                  <label key={f.key} className="flex items-center gap-1 text-xs text-stone-500">
                    {f.label}：
                    <input
                      className="rounded-md border border-stone-200 px-2 py-0.5 text-xs text-stone-700 focus:border-[#4a6cf7]/40 focus:outline-none"
                      value={editFields[f.key] ?? ""}
                      onChange={(e) =>
                        setEditFields((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                    />
                  </label>
                ) : (
                  <span key={f.key} className="text-xs text-stone-500">
                    {f.label}：
                    {f.value ? (
                      <span className="text-stone-700">{f.value}</span>
                    ) : (
                      <span className="inline-block rounded border border-dashed border-stone-300 px-1.5 py-0.5 text-[11px] text-stone-400">
                        待指定
                      </span>
                    )}
                  </span>
                )
              )}
            </div>
          )}

          {/* Badges + actions row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${CONFIDENCE_STYLES[confidence]}`}>
              {CONFIDENCE_LABEL[confidence]}
            </span>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                编辑
              </button>
            )}

            {editing && (
              <>
                <button onClick={handleSave} className="text-[11px] font-medium text-[#4a6cf7] hover:text-[#3b5de7]">
                  保存
                </button>
                <button onClick={handleCancel} className="text-[11px] text-stone-400 hover:text-stone-600">
                  取消
                </button>
              </>
            )}
          </div>

          {/* Evidence — always visible */}
          <div className="mt-3 border-t border-stone-100 pt-2.5 text-xs leading-relaxed text-stone-400">
            <span className="font-medium text-stone-500">依据：</span>
            &ldquo;{sourceExcerpt}&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
}
