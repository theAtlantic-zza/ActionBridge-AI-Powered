export type SectionVariant = "tasks" | "confirmations" | "risks" | "nextSteps";

import { useState } from "react";

const VARIANT_STYLES: Record<SectionVariant, { border: string; badge: string; label: string }> = {
  tasks: { border: "border-l-[#4a6cf7]", badge: "bg-[#4a6cf7]/10 text-[#4a6cf7]", label: "Action Items" },
  confirmations: { border: "border-l-violet-400", badge: "bg-violet-50 text-violet-600", label: "Open Questions" },
  risks: { border: "border-l-amber-400", badge: "bg-amber-50 text-amber-600", label: "Risks" },
  nextSteps: { border: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700", label: "Next Steps" },
};

interface ResultSectionProps {
  title: string;
  count: number;
  variant: SectionVariant;
  children: React.ReactNode;
}

export function ResultSection({ title, count, variant, children }: ResultSectionProps) {
  const styles = VARIANT_STYLES[variant];
  const [collapsed, setCollapsed] = useState(false);

  if (count === 0) {
    return (
      <section className={`mb-8 border-l-2 ${styles.border} pl-5`}>
        <div className="flex items-center gap-2.5 mb-3">
          <h3 className="text-sm font-semibold text-[#1a1a2e]">{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles.badge}`}>
            {styles.label}
          </span>
        </div>
        <p className="text-sm text-stone-400">未从讨论中识别到此类项目</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 border-l-2 ${styles.border} pl-5`}>
      <div className="flex items-center gap-2.5 mb-4">
        <h3 className="text-sm font-semibold text-[#1a1a2e]">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles.badge}`}>
          {styles.label}
        </span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
          {count}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-1 inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          aria-expanded={!collapsed}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform ${collapsed ? "" : "rotate-90"}`}
          >
            <path
              d="M4 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {collapsed ? "展开" : "收起"}
        </button>
      </div>
      {!collapsed && <div className="flex flex-col gap-3">{children}</div>}
    </section>
  );
}
