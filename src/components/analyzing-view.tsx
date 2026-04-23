"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "正在识别任务与负责人…",
  "正在匹配截止时间…",
  "正在检查风险与依赖…",
  "正在收口待确认事项…",
];

export function AnalyzingView() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md text-center" style={{ animation: "fadeIn 0.4s ease-out" }}>
        <div className="mx-auto mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2.5 w-2.5 rounded-full bg-[#4a6cf7]"
              style={{
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <h2 className="text-xl font-semibold text-[#1a1a2e]">
          {MESSAGES[msgIndex]}
        </h2>
        <p className="mt-3 text-sm text-stone-500">
          从讨论中提取可执行的下一步
        </p>
      </div>
    </main>
  );
}
