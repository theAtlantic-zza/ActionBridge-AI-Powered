import type { AnalysisResult } from "./types";

export function exportAsMarkdown(result: AnalysisResult): string {
  const lines: string[] = [
    "# 会后跟进清单",
    "",
    `_由 ActionBridge 提取 · ${new Date(result.meta.analyzedAt).toLocaleString("zh-CN")}_`,
    "",
    "---",
    "",
  ];

  if (result.tasks.length > 0) {
    lines.push("## Action Items", "");
    for (const t of result.tasks) {
      const status = t.confirmed ? "- [x]" : "- [ ]";
      const owner = t.owner ?? "⚠ 负责人待指定";
      const deadline = t.deadline ?? "⚠ 截止时间待定";
      lines.push(`${status} **${t.description}**`);
      lines.push(`  - 负责人：${owner}`);
      lines.push(`  - 截止：${deadline}`);
      if (t.confidence !== "high") lines.push(`  - ⚠ 置信度：${t.confidence}，建议确认`);
    }
    lines.push("");
  }

  if (result.pendingConfirmations.length > 0) {
    lines.push("## Open Questions（待确认）", "");
    for (const c of result.pendingConfirmations) {
      const status = c.confirmed ? "- [x]" : "- [ ]";
      lines.push(`${status} ${c.description}`);
      if (c.relatedTo) lines.push(`  - 关联：${c.relatedTo}`);
    }
    lines.push("");
  }

  if (result.risks.length > 0) {
    lines.push("## Risks（风险）", "");
    for (const r of result.risks) {
      lines.push(`- ⚠ **${r.description}**`);
      lines.push(`  - 潜在影响：${r.impact}`);
    }
    lines.push("");
  }

  if (result.nextSteps.length > 0) {
    lines.push("## Next Steps", "");
    for (const n of result.nextSteps) {
      const owner = n.owner ?? "待定";
      lines.push(`- ${n.description}（${owner}，${n.priority} priority）`);
    }
    lines.push("");
  }

  lines.push("---", "", "_此清单由 AI 辅助提取，请逐项确认后再推进。_");

  return lines.join("\n");
}

export function exportTasksAsCsv(result: AnalysisResult): string {
  const header = "描述,负责人,截止时间,置信度,已确认";
  const rows = result.tasks.map((t) => {
    const cells = [
      `"${t.description.replace(/"/g, '""')}"`,
      t.owner ?? "待指定",
      t.deadline ?? "待定",
      t.confidence,
      t.confirmed ? "是" : "否",
    ];
    return cells.join(",");
  });
  return [header, ...rows].join("\n");
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
