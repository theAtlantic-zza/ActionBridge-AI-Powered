# ActionBridge

**Turn messy team discussions into executable follow-up.**

ActionBridge is an AI-powered execution closure assistant designed for small team collaboration. It takes raw meeting notes, chat logs, or discussion transcripts and extracts what actually matters: tasks, owners, deadlines, pending confirmations, risks, and next steps.

> This is not a meeting summarizer. It's not a note-taking tool.  
> It's the step between "we talked about it" and "we're actually doing it."

## The Problem

After every team meeting or group discussion, everyone *thinks* they know what was agreed. But in reality:

- Tasks go unassigned
- Deadlines stay vague
- Risks get mentioned and then forgotten
- "I thought you were doing that" happens a week later

ActionBridge closes this gap by turning unstructured conversation into a structured, reviewable, editable action checklist.

## How It Works

1. **Paste** any discussion text — meeting notes, Slack threads, Zoom transcripts, or even rough bullet points
2. **Analyze** — AI extracts structured items from the discussion
3. **Review & Edit** — every item shows its source excerpt, confidence level, and is fully editable
4. **Confirm & Export** — check off items you agree with, then export as Markdown or CSV

## Key Design Decisions

- **Source attribution on every item** — each extracted item links back to the original text, so you can verify it's not hallucinated
- **Confidence marking** — high / medium / low indicators help you quickly spot items that need human judgment
- **Human-in-the-loop editing** — AI proposes, humans decide. Every field is editable because execution decisions shouldn't be fully automated
- **Mock mode** — works without any API key for demo and testing purposes
- **Single-page flow** — no complex navigation, no account system. Paste, analyze, export. Done.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Try Sample** to see it in action.

### Optional: Connect a Real LLM

Create a `.env.local` file:

```
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Any OpenAI-compatible API works (OpenAI, DeepSeek, etc.). Without a key, the app runs in mock mode with realistic demo data.

## Tech Stack

Next.js (App Router) · TypeScript · Tailwind CSS · React 19

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts   — analysis endpoint (LLM + mock fallback)
│   ├── page.tsx               — single-page phase orchestrator
│   └── layout.tsx             — root layout and metadata
├── components/
│   ├── input-view.tsx         — input phase UI
│   ├── analyzing-view.tsx     — loading state
│   ├── result-view.tsx        — result display + export toolbar
│   ├── result-section.tsx     — section container
│   └── result-item.tsx        — editable item card
└── lib/
    ├── types.ts               — core data schema
    ├── prompt.ts              — LLM prompt design
    ├── mock-result.ts         — demo data
    ├── sample-data.ts         — sample input text
    └── export.ts              — Markdown / CSV export
```

## License

MIT
