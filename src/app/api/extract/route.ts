import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "node:module";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  dataBuffer: Buffer,
  options?: Record<string, unknown>
) => Promise<{ text: string }>;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "未收到文件" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "文件超过 5 MB 限制" },
      { status: 413 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!["pdf"].includes(ext)) {
    return NextResponse.json(
      { error: "此接口仅处理 PDF，txt/md 由客户端直接提取" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);

    const text = (result.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { error: "PDF 中未提取到文本（可能是扫描件或纯图片 PDF）" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, filename: file.name });
  } catch (e) {
    return NextResponse.json(
      {
        error: "PDF 解析失败",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
