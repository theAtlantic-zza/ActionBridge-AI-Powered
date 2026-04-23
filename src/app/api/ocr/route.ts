import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function extractJsonFromMixedText(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return JSON.parse(trimmed);
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    const candidate = fenced[1].trim();
    if (candidate.startsWith("{") && candidate.endsWith("}")) return JSON.parse(candidate);
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(trimmed.slice(first, last + 1));
  return null;
}

function normalizeContent(rawContent: unknown): string {
  if (typeof rawContent === "string") return rawContent;
  if (Array.isArray(rawContent)) {
    return rawContent
      .map((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object" && "text" in p) {
          const text = (p as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, apiKey, baseUrl } = (await req.json()) as {
      imageDataUrl?: string;
      apiKey?: string;
      baseUrl?: string;
    };

    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 OCR Key，请先在右上角填写 API Key" },
        { status: 400 }
      );
    }
    if (!baseUrl) {
      return NextResponse.json(
        { error: "未配置 Base URL" },
        { status: 400 }
      );
    }
    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "未收到图片数据" },
        { status: 400 }
      );
    }

    const endpoint = `${normalizeBaseUrl(baseUrl)}/chat/completions`;

    // Qwen OCR model via DashScope OpenAI-compatible endpoint
    const model = "qwen-vl-ocr-latest";
    const messages = [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageDataUrl } },
          {
            type: "text",
            text:
              "Extract ALL text from the image. Return ONLY valid JSON: {\"text\": \"...\"}. Keep line breaks if possible.",
          },
        ],
      },
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OCR API error:", {
        status: response.status,
        endpoint,
        body: errText,
      });
      return NextResponse.json(
        {
          error: "OCR 服务调用失败，请检查 Key/权限/额度",
          detail:
            process.env.NODE_ENV === "development"
              ? `status=${response.status}`
              : undefined,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = normalizeContent(data?.choices?.[0]?.message?.content);
    if (!content) {
      return NextResponse.json({ error: "OCR 返回内容为空" }, { status: 502 });
    }

    // Try to parse strict JSON { text: "..." }
    try {
      const parsed = extractJsonFromMixedText(content) as { text?: unknown } | null;
      const text = parsed && typeof parsed.text === "string" ? parsed.text.trim() : "";
      if (!text) throw new Error("empty text");
      return NextResponse.json({ text });
    } catch {
      // Fallback: treat content as raw text
      const raw = content.trim();
      if (!raw) {
        return NextResponse.json({ error: "OCR 未识别到文本" }, { status: 422 });
      }
      return NextResponse.json({ text: raw });
    }
  } catch (e) {
    console.error("OCR route error:", e);
    return NextResponse.json(
      {
        error: "OCR 过程中出现错误，请重试",
        detail:
          process.env.NODE_ENV === "development"
            ? e instanceof Error
              ? e.message
              : String(e)
            : undefined,
      },
      { status: 500 }
    );
  }
}

