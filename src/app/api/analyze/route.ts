import { NextRequest, NextResponse } from "next/server";
import { MOCK_RESULT_EN, MOCK_RESULT_CN } from "@/lib/mock-result";
import { SAMPLE_INPUT_EN, SAMPLE_INPUT_CN } from "@/lib/sample-data";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function buildErrorMessage(status: number, body: string): string {
  if (status === 401 || status === 403) {
    return "API Key 无效或无调用权限，请检查密钥和模型权限";
  }
  if (status === 404) {
    return "模型接口地址不可用，请检查 Base URL 是否正确";
  }
  if (status === 429) {
    return "调用频率过高或额度不足，请稍后重试";
  }
  if (status === 400 && /model/i.test(body)) {
    return "模型名无效，请检查 Model 配置（例如 qwen-plus / qwen-max）";
  }
  return "AI 服务调用失败，请稍后重试";
}

async function callChatCompletions(params: {
  baseUrl: string;
  apiKey: string;
  model: string;
  text: string;
  withResponseFormat: boolean;
}) {
  const body: Record<string, unknown> = {
    model: params.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(params.text) },
    ],
    temperature: 0.3,
  };
  if (params.withResponseFormat) {
    body.response_format = { type: "json_object" };
  }

  return fetch(`${params.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { text, userApiKey, userBaseUrl, userModel } = (await req.json()) as {
      text?: string;
      userApiKey?: string;
      userBaseUrl?: string;
      userModel?: string;
    };

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "请输入至少 20 个字符的讨论内容" },
        { status: 400 }
      );
    }

    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    const baseUrl = normalizeBaseUrl(
      userBaseUrl ||
        process.env.OPENAI_BASE_URL ||
        "https://api.openai.com/v1"
    );
    const model = userModel || process.env.OPENAI_MODEL || "gpt-4o-mini";

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

    // Real LLM mode: first try JSON response_format; fallback without it for compatibility providers.
    let response = await callChatCompletions({
      baseUrl,
      apiKey,
      model,
      text,
      withResponseFormat: true,
    });

    if (!response.ok) {
      const firstErr = await response.text();
      const canRetryWithoutResponseFormat =
        response.status === 400 &&
        /response_format|json_object|unsupported|invalid_parameter/i.test(
          firstErr
        );

      if (canRetryWithoutResponseFormat) {
        response = await callChatCompletions({
          baseUrl,
          apiKey,
          model,
          text,
          withResponseFormat: false,
        });
      }

      if (!response.ok) {
        const finalErr = await response.text();
        console.error("LLM API error:", {
          status: response.status,
          baseUrl,
          model,
          body: finalErr,
        });
        return NextResponse.json(
          {
            error: buildErrorMessage(response.status, finalErr),
            detail:
              process.env.NODE_ENV === "development"
                ? `status=${response.status} baseUrl=${baseUrl} model=${model}`
                : undefined,
          },
          { status: 502 }
        );
      }
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
