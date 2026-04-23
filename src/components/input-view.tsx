"use client";

import { useState } from "react";
import { SAMPLE_INPUT_EN, SAMPLE_INPUT_CN } from "@/lib/sample-data";

interface InputViewProps {
  onAnalyze: (text: string) => void;
}

export function InputView({ onAnalyze }: InputViewProps) {
  const [text, setText] = useState("");

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-14 sm:py-20">
      <div className="w-full max-w-3xl" style={{ animation: "fadeIn 0.4s ease-out" }}>
        {/* Hero */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a2e] sm:text-4xl leading-tight">
            讨论结束了，<br className="sm:hidden" />
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
              <span className="text-xs font-semibold text-[#4a6cf7]/70">{item.icon}</span>
              <p className="mt-2 text-sm font-semibold text-[#1a1a2e]">
                {item.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Input Area */}
        <section>
          <label
            htmlFor="discussion-input"
            className="mb-2 block text-sm font-medium text-stone-600"
          >
            粘贴讨论内容
          </label>
          <textarea
            id="discussion-input"
            className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm leading-relaxed text-[#1a1a2e] shadow-sm placeholder:text-stone-400 focus:border-[#4a6cf7]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6cf7]/10 transition-shadow"
            rows={8}
            placeholder={"支持任意格式：会议记录、Slack 对话、Zoom transcript、随手记的要点……\n\n内容越完整，提取越准确。"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

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
                onClick={() => setText("")}
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
