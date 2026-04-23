<div align="center">

# ActionBridge

**Turn messy team discussions into executable follow-up.**

An AI-powered execution closure assistant for small teams.

[Live Demo](https://actionbridge-ai-powered-production.up.railway.app) · [How It Works](#how-it-works) · [Design Decisions](#design-decisions)

---

</div>

## The Problem

After every meeting or group discussion, everyone *thinks* they know what was agreed.

But in reality — tasks go unassigned, deadlines stay vague, risks get mentioned and forgotten, and a week later someone says *"I thought you were handling that."*

**ActionBridge closes this gap.**

It's not a meeting summarizer. Not a note-taking tool. Not a collaboration platform.

It's the step between *"we talked about it"* and *"we're actually doing it."*

## How It Works

```
Paste discussion → AI extracts structured items → Human reviews & edits → Export follow-up checklist
```

1. **Paste** any discussion text — meeting notes, Slack threads, Zoom transcripts, rough bullet points
2. **Analyze** — AI extracts tasks, owners, deadlines, risks, open questions, and next steps
3. **Review** — every item shows its source excerpt and confidence level; low-confidence items are flagged for human review
4. **Edit** — every field is editable because execution decisions shouldn't be fully automated
5. **Export** — copy as team sync message, download as Markdown or CSV

## Design Decisions

These are intentional product choices, not shortcuts:

| Decision | Why |
|---|---|
| **Evidence on every item** | Each extracted item cites the original discussion text. Users can verify — not blindly trust. |
| **Confidence marking** | High / Medium / Low indicators surface what the AI is uncertain about. Low-confidence items show "需人工确认". |
| **Human-in-the-loop editing** | AI proposes, humans decide. The checkbox isn't decoration — it's the core interaction: *"I've reviewed this and agree."* |
| **"待指定" for missing fields** | When AI can't determine an owner or deadline, it says so explicitly instead of guessing. |
| **Review hints before export** | The export area shows how many items are unconfirmed or missing owners, nudging completion before sharing. |
| **No history, no accounts** | This is a single-use tool by design. Paste, analyze, export, done. Complexity serves no one here. |
| **Mock mode** | Works without any API key. The demo flow is identical to the real flow — same UI, same interactions, same export. |

## Quick Start

```bash
git clone https://github.com/theAtlantic-zza/ActionBridge-AI-Powered.git
cd ActionBridge-AI-Powered
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **中文示例** or **English Sample** to try it.

### Connecting an AI Model

**Option A:** Click the **API Key** button in the top-right corner and enter your key directly in the browser. It's stored in localStorage only.

**Option B:** Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Any OpenAI-compatible API works (OpenAI, DeepSeek, etc.).

## Architecture

```
src/
├── app/
│   ├── api/analyze/route.ts   → Analysis endpoint (LLM + mock fallback)
│   ├── page.tsx               → Single-page phase orchestrator
│   └── layout.tsx             → Root layout
├── components/
│   ├── input-view.tsx         → Input phase
│   ├── analyzing-view.tsx     → Loading state with rotating messages
│   ├── result-view.tsx        → Execution closure dashboard
│   ├── result-section.tsx     → Color-coded section containers
│   ├── result-item.tsx        → Editable item card with evidence
│   └── api-key-panel.tsx      → BYOK API key management
└── lib/
    ├── types.ts               → Core data schema (TaskItem, RiskItem, etc.)
    ├── prompt.ts              → LLM system prompt + user prompt builder
    ├── mock-result.ts         → Demo data (Chinese + English)
    ├── sample-data.ts         → Sample discussion inputs
    └── export.ts              → Markdown / CSV export utilities
```

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4

## License

MIT
