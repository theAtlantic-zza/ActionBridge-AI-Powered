import { NextRequest, NextResponse } from "next/server";
import { MOCK_RESULT_EN, MOCK_RESULT_CN } from "@/lib/mock-result";
import { SAMPLE_INPUT_EN, SAMPLE_INPUT_CN } from "@/lib/sample-data";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "请输入至少 20 个字符的讨论内容" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl =
      process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1500));
      const trimmed = text.trim();
      const isCnSample = trimmed === SAMPLE_INPUT_CN.trim();
      const isEnSample = trimmed === SAMPLE_INPUT_EN.trim();
      const mockData = isCnSample ? MOCK_RESULT_CN : MOCK_RESULT_EN;
      const result: AnalysisResult = {
        ...mockData,
        meta: {
          inputWordCount: trimmed.split(/\s+/).length,
          analyzedAt: new Date().toISOString(),
        },
      };
      return NextResponse.json({
        result,
        mock: true,
        mockMatchesSample: isCnSample || isEnSample,
      });
    }

    // Real LLM mode
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(text) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("LLM API error:", err);
      return NextResponse.json(
        { error: "AI 服务调用失败，请稍后重试" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI 返回内容为空" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content);

    // Add confirmed: false to all items & ensure meta
    const addConfirmed = <T extends object>(items: T[]): (T & { confirmed: boolean })[] =>
      (items || []).map((item) => ({ ...item, confirmed: false }));

    const result: AnalysisResult = {
      tasks: addConfirmed(parsed.tasks || []),
      pendingConfirmations: addConfirmed(parsed.pendingConfirmations || []),
      risks: addConfirmed(parsed.risks || []),
      nextSteps: addConfirmed(parsed.nextSteps || []),
      meta: {
        inputWordCount: text.trim().split(/\s+/).length,
        analyzedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json({ result, mock: false });
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: "分析过程中出现错误，请重试" },
      { status: 500 }
    );
  }
}
