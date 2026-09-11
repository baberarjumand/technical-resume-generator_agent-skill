# tech-resume-generator

[![skills.sh](https://skills.sh/b/baberarjumand/technical-resume-generator_agent-skill)](https://skills.sh/baberarjumand/technical-resume-generator_agent-skill)

An [Agent Skills](https://agentskills.io/) package that turns your career files into an optimized **one-page tech resume** (JSON + highlightable PDF).

Drop resumes, LinkedIn exports, certs, and notes into `tech-resume-generator_files/user_professional_data/` (or **upload them in a browser chat**). The agent asks whether you want a **general** or **JD-tailored** résumé, compiles facts (never invents metrics), and renders an ATS-safe one-pager from research distilled across 21 public tech-resume sources.

**Recommended for full capabilities:** Cursor or Claude Code with this repo cloned — see [Recommended environment](#recommended-environment). Browser chats are fine for drafts; see [Browser chat limitations](#browser-chat-limitations). Review [Security](#security) before installing scripts.

**Install into your agents (skills.sh / `npx skills`):**

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill
# Prefer copy on Windows if symlinks fail:
npx skills add baberarjumand/technical-resume-generator_agent-skill --copy -g -y
```

After install, PDF rendering needs deps inside the skill folder:

```bash
cd "$(npx skills list 2>/dev/null | true)"  # or open the installed skill path
# Typical global paths:
#   ~/.cursor/skills/tech-resume-generator
#   ~/.claude/skills/tech-resume-generator
#   ~/.agents/skills/tech-resume-generator
cd ~/.cursor/skills/tech-resume-generator   # example
npm install
```

Preview without installing: `npx skills add baberarjumand/technical-resume-generator_agent-skill --list`

**Claude Code marketplace:**

```text
/plugin marketplace add baberarjumand/technical-resume-generator_agent-skill
/plugin install tech-resume-generator@tech-resume-generator
```

---

## Table of Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Recommended environment](#recommended-environment)
- [(Optional) Download sample corpus](#optional-download-sample-corpus)
- [Browser chat limitations](#browser-chat-limitations)
- [Use with Claude](#use-with-claude)
- [Use with ChatGPT](#use-with-chatgpt)
- [Use with Gemini](#use-with-gemini)
- [Use with Cursor](#use-with-cursor)
- [Use with Grok](#use-with-grok)
- [Use with DeepSeek](#use-with-deepseek)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Evaluation (core)](#evaluation-core)
- [Security](#security)
- [FAQ](#faq)
- [License](#license)
- [About the Author](#about-the-author)

---

## Features

| Feature | Description |
| --- | --- |
| **Multi-format intake** | Accepts Markdown, text, PDF, images (PNG/JPG/WEBP), DOCX, JSON, TypeScript dumps, LinkedIn exports, certificates, and notes under `tech-resume-generator_files/user_professional_data/` |
| **General + JD-tailored modes** | One optimized general résumé, or variants keyed to a pasted JD or files under `tech-resume-generator_files/job_description_data/` |
| **Fact compilation** | Builds `tech-resume-generator_files/output/professional_data.md` from your sources with reconciliation rules — no invented employers, tools, or metrics |
| **ATS one-pager PDF** | Letter PDF via skill-local `pdf-lib`: ≥0.5" margins, Helvetica, clickable `tel:` / `mailto:` / https links, skills → experience → education |
| **Editable JSON source** | Resume content lives in JSON you can tweak; re-run the renderer without rewriting from scratch |
| **Research-backed rules** | Verbose guidelines from 21 sources + `99_cross-source-rules.md` (TIH, Jachja, Yale WHO, Penn SCO, UT What/Why/How, and more) |
| **Optional sample corpus** | Download ~120 sample resumes for density/layout reference (`npm run download-samples`) — not shipped in the default clone |
| **Extensible extractors** | Bundled PDF/text extraction; unknown formats → agent writes `scripts/extractors/<format>_extract.py` and continues |
| **Core eval suite** | 5 evals in `evals/evals.json` + grading/aggregation scripts per [evaluating-skills](https://agentskills.io/skill-creation/evaluating-skills) |
| **Skills client** | Local discover → catalog → activate CLI per [adding-skills-support](https://agentskills.io/client-implementation/adding-skills-support) |
| **Cross-client install** | `npx skills add …` ([skills.sh](https://skills.sh)), Claude Code marketplace, and Agent Skills folders for Claude / Cursor / ChatGPT/Codex / Gemini / Grok / DeepSeek |
| **Privacy-friendly layout** | Career files stay under gitignored `tech-resume-generator_files/`; skill package is separate and zip-uploadable |

[↑ Back to top](#table-of-contents)

---

## Quick start

### Option A — Install via `npx skills` (recommended for local agents)

Works with Cursor, Claude Code, Codex, Gemini CLI, Grok Build, and [many more](https://github.com/vercel-labs/skills#supported-agents). Discoverable on [skills.sh](https://skills.sh) after installs are reported (see [FAQ](#faq)).

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill

# Or from a full URL / local clone:
npx skills add https://github.com/baberarjumand/technical-resume-generator_agent-skill
npx skills add /path/to/technical-resume-generator_agent-skill

# Windows / no-symlink environments:
npx skills add baberarjumand/technical-resume-generator_agent-skill --copy -g -y
```

Useful flags:

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill --list          # preview
npx skills add baberarjumand/technical-resume-generator_agent-skill -g -y           # global, non-interactive
npx skills add baberarjumand/technical-resume-generator_agent-skill -a cursor -a claude-code
npx skills add baberarjumand/technical-resume-generator_agent-skill --skill tech-resume-generator
```

Then open your agent and ask it to use **tech-resume-generator**. For PDF rendering after a skills-only install:

```bash
cd ~/.cursor/skills/tech-resume-generator   # or ~/.claude/skills/... / ~/.agents/skills/...
npm install
node scripts/generate_resume_pdf.mjs /path/to/your_resume.json
```

**After a project install** (`npx skills add` **without** `-g`), create the workspace folders at that repo’s root:

```bash
# from the project root where you ran npx skills add
node .agents/skills/tech-resume-generator/scripts/init_workspace.mjs
# or:
node .cursor/skills/tech-resume-generator/scripts/init_workspace.mjs
```

This creates `tech-resume-generator_files/{user_professional_data,job_description_data,output}/`. Put career files in `user_professional_data/`, then ask the agent to run the skill. If `init_workspace` cannot run (browser chat), upload files in chat instead — see [Browser chat limitations](#browser-chat-limitations).

### Option B — Clone the repo (full PDF + evals workflow)

```bash
git clone https://github.com/baberarjumand/technical-resume-generator_agent-skill.git
cd technical-resume-generator_agent-skill
npm install   # also installs pdf-lib inside skills/tech-resume-generator via postinstall
```

1. Run `npm run init-workspace` (creates [`tech-resume-generator_files/`](tech-resume-generator_files/README.md)). Put career materials in `tech-resume-generator_files/user_professional_data/`.
2. The skill is already linked under `.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`, and `.grok/skills/`.
3. Ask: *Use the tech-resume-generator skill to generate my tech resume.*
4. Choose **general** or **JD-tailored**.
5. Find results under `tech-resume-generator_files/output/`.

Optional for PDF text extraction:

```bash
sudo apt install poppler-utils   # Debian/Ubuntu
pip install Pillow               # optional page renders
```

[↑ Back to top](#table-of-contents)

---

## Recommended environment

**Best experience (full capabilities):** a **local AI coding agent** with filesystem + terminal access — especially **Cursor (Agent mode)** or **Claude Code**, with this repo cloned and `npm install` completed. **OpenAI Codex CLI** is a strong alternative when skills are enabled.

In that setup you get the complete loop:

| Capability | Local coding CLI |
| --- | --- |
| Drop files in `tech-resume-generator_files/user_professional_data/` (and `job_description_data/`) | Yes |
| Auto-discover / activate the skill from disk | Yes |
| Run `extract_user_data.py` and write new extractors | Yes |
| Compile `tech-resume-generator_files/output/professional_data.md` | Yes |
| Author resume JSON and iterate on overflow | Yes |
| Render highlightable PDF via `generate_resume_pdf.mjs` | Yes |
| Run the core **evals** suite | Yes |

**Also good:** any Agent Skills–compatible CLI that can read the project tree and run Node/Python (Grok Build CLI, Gemini/Antigravity-style coding CLIs when pointed at this repo).

**Acceptable for drafts only:** browser chat products (Claude.ai, ChatGPT, Gemini web, DeepSeek chat, Grok web). Use them when you need a quick draft; finish PDF generation locally if the chat host cannot run scripts. See below.

[↑ Back to top](#table-of-contents)

---

## (Optional) Download sample corpus

The default clone stays small: sample PDFs/images are **not** included. You can still generate a full résumé using only the written guidelines under `skills/tech-resume-generator/references/`.

**Why download the samples?** They give the agent real layout/density references (~120 resumes from public university and industry sources) so it can better judge bullet length, section balance, and one-page fit—especially for edge cases (student vs staff, long careers). They are **references only**: never copy names, schools, employers, or bullets into your résumé.

**When to skip:** Most users can skip this. Download only if you want richer visual examples while iterating, or you are developing/evaluating the skill.

### Download all samples

Requires network access and `curl`. Expect ~100MB+ on disk. Files land under `skills/tech-resume-generator/assets/sample_resumes/` and are gitignored.

**From a cloned repo (recommended):**

```bash
cd technical-resume-generator_agent-skill
npm run download-samples
```

**From the skill directory** (clone or after `npx skills add`):

```bash
cd skills/tech-resume-generator          # or ~/.cursor/skills/tech-resume-generator, etc.
python3 scripts/download_sample_resumes.py
# equivalent:
npm run download-samples
```

Index of URLs and paths: [`skills/tech-resume-generator/assets/sample_resumes/download_manifest.json`](skills/tech-resume-generator/assets/sample_resumes/download_manifest.json). More detail: [`assets/sample_resumes/README.md`](skills/tech-resume-generator/assets/sample_resumes/README.md).

After download, ask your agent to use density examples from `assets/sample_resumes/` when optimizing layout—still facts-only from your `user_professional_data/`.

[↑ Back to top](#table-of-contents)

---

## Browser chat limitations

Browser agents (Claude.ai, ChatGPT web, Gemini web, DeepSeek chat, Grok web, etc.) can still follow this skill’s **writing rules** and produce a strong résumé **draft**, but they do **not** match the local CLI experience.

### How to provide documents in a browser

There is **no** `tech-resume-generator_files/` folder inside a web chat. Provide career materials by:

1. **Uploading / attaching files** in the chat window (resumes, PDFs, images, notes), and/or  
2. Adding files to **Project / Custom GPT knowledge** when the product supports it, and/or  
3. **Pasting** a job description (or uploading a JD file) for tailored mode  

Then ask the agent to follow `tech-resume-generator` (after installing/uploading the skill, or after attaching `SKILL.md`).

### What usually works in browser chat

- Asking **general vs JD-tailored**
- Reading uploaded PDFs/images/text (within each product’s upload limits)
- Compiling facts and writing optimized résumé **JSON** and/or **Markdown**
- Applying the research guidelines (one page, quantified bullets, ATS-safe structure)

### What often does *not* work (or is unreliable)

| Limitation | Why |
| --- | --- |
| No `tech-resume-generator_files/` on disk | Browser chats have no project filesystem like Cursor/Claude Code |
| No automatic skill folder discovery | `.agents/skills/` and symlinks are local; web apps need zip upload, Project knowledge, or pasted `SKILL.md` |
| PDF rendering via `pdf-lib` | Needs Node + `npm install`; many chats cannot run that script |
| `extract_user_data.py` / poppler extractors | Needs a real shell and optional system packages |
| Writing new `scripts/extractors/*` and executing them | Needs filesystem + terminal |
| Large optional sample corpus | Samples are not shipped by default; download only if needed (`npm run download-samples`) |
| Eval suite | Designed for local `evals-workspace/` iterations |
| Upload size / file-type caps | Each vendor limits how many/which files you can attach per chat |

### Practical browser workflow

1. Upload career files (and JD if needed) in chat.  
2. Ensure the model has `SKILL.md` (Skills install or attach).  
3. Get **JSON + Markdown** résumé content.  
4. Save the JSON on your machine and run:

```bash
npm run generate-resume -- path/to/your_resume.json
```

Treat browser output as a **draft** until you have rendered and proofread the PDF locally (or confirmed the host’s code-execution sandbox actually produced a valid PDF).

[↑ Back to top](#table-of-contents)

---

## Use with Claude

### Claude Code — marketplace install (recommended)

This repo is a Claude Code plugin marketplace (`.claude-plugin/marketplace.json`). After the repo is on GitHub:

```text
/plugin marketplace add baberarjumand/technical-resume-generator_agent-skill
/plugin install tech-resume-generator@tech-resume-generator
```

Or from the CLI:

```bash
claude plugin marketplace add baberarjumand/technical-resume-generator_agent-skill
claude plugin install tech-resume-generator@tech-resume-generator
```

Grok Build also reads Claude Code marketplaces automatically once added.

### Claude Code — `npx skills` or clone

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -a claude-code -g -y
```

Or clone for the full PDF workflow:

```bash
cd technical-resume-generator_agent-skill
npm install

# Project skill is already linked at .claude/skills/tech-resume-generator
# Optional user-global:
mkdir -p ~/.claude/skills
ln -sfn "$(pwd)/skills/tech-resume-generator" ~/.claude/skills/tech-resume-generator

claude
```

Then ask:

> Use tech-resume-generator to generate my tech resume from tech-resume-generator_files/.

Or activate explicitly if your CLI supports slash/skills:

> /tech-resume-generator

### Claude.ai (web — Skills upload)

> **Note:** Browser use is draft-oriented — see [Browser chat limitations](#browser-chat-limitations).

```bash
zip -r tech-resume-generator.zip skills/tech-resume-generator \
  -x "*.DS_Store" -x "*/__pycache__/*"
```

1. Open Claude.ai → **Settings → Capabilities / Skills**.
2. Upload `tech-resume-generator.zip` (skill folder must be the **top level** of the zip — the zip should contain `SKILL.md` at its root folder).
3. Enable the skill; ensure code execution is available if you want PDF generation in-product.
4. Attach or paste career files / JD text and ask for a general or tailored tech resume.

[↑ Back to top](#table-of-contents)

---

## Use with ChatGPT

### ChatGPT (Skills / custom GPT knowledge)

> **Note:** Browser / ChatGPT web use is draft-oriented — see [Browser chat limitations](#browser-chat-limitations).

Agent Skills support in ChatGPT depends on your plan and rollout. Prefer one of:

**A — Upload the skill zip** (when Skills are available in your workspace):

```bash
zip -r tech-resume-generator.zip skills/tech-resume-generator \
  -x "*.DS_Store" -x "*/__pycache__/*"
```

Upload via ChatGPT Skills / Capabilities settings (same zip structure as Claude).

**B — Project / Custom GPT knowledge**

1. Add the contents of `skills/tech-resume-generator/` (at least `SKILL.md`, `references/`, and `scripts/` docs) to a Project or Custom GPT knowledge.
2. Tell the GPT: *Follow tech-resume-generator/SKILL.md. Ask general vs JD-tailored. Do not invent facts.*
3. Upload your career files in chat.
4. For PDF rendering: run locally after the model writes JSON:

```bash
npm run generate-resume -- output/general/your_name_resume.json
```

### OpenAI Codex CLI

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -a codex -g -y
# Or symlink from a clone:
mkdir -p ~/.codex/skills
ln -sfn "$(pwd)/skills/tech-resume-generator" ~/.codex/skills/tech-resume-generator
# Project skill is also linked at .codex/skills/tech-resume-generator
cd technical-resume-generator_agent-skill
codex
```

Ask in plain language (slash commands are not always available):

> Run tech-resume-generator on tech-resume-generator_files/ and produce a general one-page tech resume.

```bash
codex exec "Use tech-resume-generator: generate a JD-tailored resume using tech-resume-generator_files/job_description_data/"
```

[↑ Back to top](#table-of-contents)

---

## Use with Gemini

Native Agent Skills discovery varies by Gemini surface. Practical options:

### Gemini CLI / Antigravity-style coding CLI

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -a gemini-cli -g -y
# Or from a clone (already wired):
cd technical-resume-generator_agent-skill
ls -la .agents/skills/tech-resume-generator
```

> Activate tech-resume-generator and generate my resume from tech-resume-generator_files/.

Or symlink:

```bash
mkdir -p ~/.gemini/skills
ln -sfn "$(pwd)/skills/tech-resume-generator" ~/.gemini/skills/tech-resume-generator
```

Gemini CLI can also install from git:

```bash
gemini skills install https://github.com/baberarjumand/technical-resume-generator_agent-skill.git --path skills/tech-resume-generator --consent
```

### Gemini web / AI Studio

> **Note:** Browser use is draft-oriented — see [Browser chat limitations](#browser-chat-limitations).

1. Start a chat with file upload enabled.
2. Upload `skills/tech-resume-generator/SKILL.md` plus key references (`references/resume_guidelines/99_cross-source-rules.md`, `references/json_schema.md`).
3. Upload your career files.
4. Instruct: *Follow SKILL.md. Ask general vs JD-tailored. Facts only. Output resume JSON matching the schema.*
5. Render PDF locally with `npm run generate-resume` when Node is available.

[↑ Back to top](#table-of-contents)

---

## Use with Cursor

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -a cursor -y
# then from that project root:
node .agents/skills/tech-resume-generator/scripts/init_workspace.mjs
# or: node .cursor/skills/tech-resume-generator/scripts/init_workspace.mjs
```

Or global:

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -a cursor -g -y
```

Or clone:

```bash
cd technical-resume-generator_agent-skill
npm install

# Project skill is already linked at .cursor/skills/tech-resume-generator
# Optional personal:
mkdir -p ~/.cursor/skills
ln -sfn "$(pwd)/skills/tech-resume-generator" ~/.cursor/skills/tech-resume-generator
```

This repo also exposes `.agents/skills/tech-resume-generator` for cross-client discovery ([quickstart](https://agentskills.io/skill-creation/quickstart)).

1. Open the project in Cursor.
2. Use **Agent** mode.
3. Ask: *Use the tech-resume-generator skill to generate my tech resume.* (The skill first runs `init_workspace.mjs` if needed; if that works → repo workflow with `tech-resume-generator_files/`; otherwise → browser/upload workflow.)
4. Put career files in `tech-resume-generator_files/user_professional_data/` (and JDs in `job_description_data/` if tailored).

```bash
npm run skills:discover
npm run skills:activate -- tech-resume-generator
```

[↑ Back to top](#table-of-contents)

---

## Use with Grok

### Grok coding / Build CLI (when Agent Skills are supported)

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -a grok -g -y
```

Or clone / Claude marketplace (Grok reads Claude marketplaces):

```bash
cd technical-resume-generator_agent-skill
# Project skill is already linked at .grok/skills/tech-resume-generator
# Optional user-global:
mkdir -p ~/.grok/skills
ln -sfn "$(pwd)/skills/tech-resume-generator" ~/.grok/skills/tech-resume-generator
grok
```

> Use tech-resume-generator on tech-resume-generator_files/. Ask me general vs JD-tailored first.

### Grok web / xAI chat

> **Note:** Browser use is draft-oriented — see [Browser chat limitations](#browser-chat-limitations).

1. Upload or paste `SKILL.md` and your career materials.
2. Instruct the model to follow the skill workflow (mode question → extract → compile → JSON → PDF instructions).
3. Generate PDF locally if the chat environment cannot run Node:

```bash
npm run generate-resume -- path/to/resume.json
```

[↑ Back to top](#table-of-contents)

---

## Use with DeepSeek

DeepSeek Harness expects **kebab-case** skill names — this skill is `tech-resume-generator`, which matches.

DeepSeek chat/API surfaces typically do **not** auto-discover Agent Skills folders. Use an explicit attach/paste workflow:

> **Note:** DeepSeek Chat (browser) is draft-oriented — see [Browser chat limitations](#browser-chat-limitations).

1. Clone this repo and `npm install` if you want local PDF generation.
2. In DeepSeek Chat (or your DeepSeek-powered agent), upload:
   - `skills/tech-resume-generator/SKILL.md`
   - `skills/tech-resume-generator/references/json_schema.md`
   - `skills/tech-resume-generator/references/resume_guidelines/99_cross-source-rules.md`
   - Your career files (or upload them in chat)
3. Prompt:

> Follow SKILL.md exactly. First ask whether I want a general or JD-tailored tech resume. Never invent metrics. Output professional_data.md and resume JSON matching the schema.

4. Save the JSON into `tech-resume-generator_files/output/general/` (or `.../tailored/<slug>/`) and render:

```bash
npm run generate-resume -- tech-resume-generator_files/output/general/your_name_resume.json
```

If you use DeepSeek Harness / a coding CLI that scans `.agents/skills/` or `.dsh/skills/`, install with:

```bash
npx skills add baberarjumand/technical-resume-generator_agent-skill -g -y
# or open this repo (symlink already at .agents/skills/tech-resume-generator)
```

[↑ Back to top](#table-of-contents)

---

## Usage

### Provide your data

| Step | Action |
| --- | --- |
| 1 | Run `init_workspace.mjs` if needed; drop materials into `tech-resume-generator_files/user_professional_data/` |
| 2 | Invoke the skill in your agent |
| 3 | Answer **general** or **JD-tailored** |
| 4 | If tailored: paste the JD, or add files under `tech-resume-generator_files/job_description_data/` |
| 5 | Review `tech-resume-generator_files/output/professional_data.md` and the JSON/PDF |

Details: [`tech-resume-generator_files/README.md`](tech-resume-generator_files/README.md), [`skills/tech-resume-generator/references/user_data_contract.md`](skills/tech-resume-generator/references/user_data_contract.md).

### Ways to use the skill

| Mode | What you do | What you get |
| --- | --- | --- |
| **General résumé** | Put career files in `user_professional_data/`; choose general | `tech-resume-generator_files/output/general/*_resume.json` + `.pdf` |
| **Single JD tailor** | Paste JD or add files under `job_description_data/` | `tech-resume-generator_files/output/tailored/<slug>/` |
| **Batch JD tailor** | Drop multiple postings under `job_description_data/` | One tailored folder per posting |
| **Iterate wording** | Edit the JSON; re-run the renderer | Updated PDF without re-extracting |
| **Evaluate the skill** | Run fixtures in `evals/` | `grading.json` + `benchmark.json` |
| **Discover/activate locally** | `npm run skills:*` | Catalog / `<skill_content>` wrap for harnesses |

### Example prompts

```text
Use tech-resume-generator to generate my tech resume from tech-resume-generator_files/.
```

```text
Generate a JD-tailored resume. The posting is in tech-resume-generator_files/job_description_data/.
```

```text
Tailor resumes for everything in tech-resume-generator_files/job_description_data/.
```

```text
I added an .odt file — extract it (write an extractor if needed) and regenerate.
```

```text
Run the tech-resume-generator eval suite for eval id 1 and grade the outputs.
```

### Render a PDF yourself

```bash
npm run generate-resume -- tech-resume-generator_files/output/general/your_name_resume.json
```

[↑ Back to top](#table-of-contents)

---

## How it works

```
tech-resume-generator_files/user_professional_data/  (PDF, images, md, LinkedIn exports, certs, …)
        │
        ▼
┌──────────────────┐
│  Mode question   │  General  or  JD-tailored (+ obtain JD)
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Extract         │  extract_user_data.py + vision/OCR;
│                  │  new scripts/extractors/* for unknown formats
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Compile facts   │  tech-resume-generator_files/output/professional_data.md
│                  │  (never invent metrics / employers)
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Optimize        │  99_cross-source-rules + samples on demand
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Author JSON     │  schema → generate_resume_pdf.mjs
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Validate loop   │  trim on overflow until 1 page fits
└────────┬─────────┘
         │
         ▼
   tech-resume-generator_files/output/general/  or  .../output/tailored/<slug>/
        .json + .pdf
```

Progressive disclosure: agents load `name` + `description` first, then `SKILL.md`, then references/scripts/assets only as needed ([specification](https://agentskills.io/specification)).

[↑ Back to top](#table-of-contents)

---

## Tech stack

| Technology | Role |
| --- | --- |
| **Agent Skills (`SKILL.md`)** | Portable instructions + metadata ([agentskills.io](https://agentskills.io/)) |
| **Node.js 18+ / npm** | PDF generation runtime |
| **pdf-lib** | One-page Letter PDF with URI link annotations |
| **Python 3** | `extract_user_data.py`, eval grade/aggregate |
| **poppler-utils** (optional) | `pdftotext` / `pdfinfo` / `pdftoppm` for PDF text and renders |
| **Pillow** (optional) | Image handling when slicing tall PDF pages |
| **Markdown research corpus** | `references/resume_guidelines/` (21 sources + cross-rules) |
| **Sample resume assets** | Optional layout/density references — download via `npm run download-samples` |
| **skills_client (Node ESM)** | Discover / catalog / activate / slash for local harnesses |
| **evals JSON + graders** | Regression suite per agentskills evaluating-skills guide |

[↑ Back to top](#table-of-contents)

---

## Repository layout

```
technical-resume-generator_agent-skill/
├── README.md
├── LICENSE
├── package.json                   # npm scripts: generate-resume, extract, evals, skills client
├── .gitignore
├── .claude-plugin/
│   └── marketplace.json           # Claude Code marketplace catalog
├── plugins/
│   └── tech-resume-generator/     # Claude plugin package
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── skills/
│           └── tech-resume-generator -> ../../../skills/tech-resume-generator
├── skills/
│   └── tech-resume-generator/     # canonical skill (skills.sh / npx skills / zip upload)
│       ├── SKILL.md
│       ├── scripts/               # PDF render, extractors, evals, sample download
│       ├── evals/                 # evals.json + fixtures
│       ├── references/            # guidelines, schema, templates, usage
│       └── assets/
│           ├── sample_resumes/    # manifest + README; PDFs/images optional download
│           └── templates/
├── tech-resume-generator -> skills/tech-resume-generator   # convenience symlink
├── .agents/skills/tech-resume-generator -> ../../skills/...   # Amp / Copilot / universal
├── .claude/skills/tech-resume-generator  -> ../../skills/...   # Claude Code
├── .cursor/skills/tech-resume-generator  -> ../../skills/...   # Cursor
├── .codex/skills/tech-resume-generator   -> ../../skills/...   # OpenAI Codex
├── .grok/skills/tech-resume-generator    -> ../../skills/...   # Grok Build
├── skills_client/                 # local discover / catalog / activate / slash CLI
├── SECURITY.md
├── tech-resume-generator_files/   # workspace I/O (created by init_workspace.mjs)
│   ├── user_professional_data/    # YOUR career files
│   ├── job_description_data/      # job postings
│   └── output/                    # generated resumes
└── evals-workspace/               # eval run artifacts (gitignored)
```

Zip **`skills/tech-resume-generator/`** for Claude.ai / ChatGPT skill upload (after `npm install` inside it if you need PDF in-product).

Repo: [github.com/baberarjumand/technical-resume-generator_agent-skill](https://github.com/baberarjumand/technical-resume-generator_agent-skill)

Suggested GitHub topics when publishing: `agent-skills`, `skills-sh`, `claude-code`, `cursor`, `resume`, `ats`.

[↑ Back to top](#table-of-contents)

---

## Evaluation (core)

```bash
npm run eval:grade -- --eval-id 1 \
  --outputs evals-workspace/iteration-1/eval-general-experienced/with_skill/outputs \
  --workspace evals-workspace/iteration-1/eval-general-experienced/with_skill
npm run eval:aggregate -- --iteration evals-workspace/iteration-1
```

See [`skills/tech-resume-generator/evals/README.md`](skills/tech-resume-generator/evals/README.md) and [evaluating-skills](https://agentskills.io/skill-creation/evaluating-skills).

[↑ Back to top](#table-of-contents)

---

## Security

Scripts run on your machine. See [`SECURITY.md`](SECURITY.md) for what each script touches, which one uses the network (`download_sample_resumes.py`), and how to report issues. Prefer `npx skills add … --list` before installing.

[↑ Back to top](#table-of-contents)

---

## FAQ

**How do I install this with `npx skills` / skills.sh?**  
`npx skills add baberarjumand/technical-resume-generator_agent-skill`. On Windows, add `--copy` if symlinks fail. Then `npm install` inside the installed skill directory before generating PDFs.
**Do I need to submit anything for the skill to appear on skills.sh?**  
No registry form. skills.sh indexes skills from **install telemetry** when people run `npx skills add owner/repo`. Push the repo publicly, share that install command, and after enough installs it can show up in search/leaderboards. GitHub topics alone do **not** list you.

**What is tech-resume-generator?**  
An Agent Skill that compiles your career materials into an optimized one-page ATS-safe tech résumé (JSON + PDF), with optional job-description tailoring.

**Which AI products can I use it with?**
Any host that supports Agent Skills or can follow an attached `SKILL.md` — Claude, Cursor, ChatGPT/Codex, Gemini, Grok, DeepSeek, and similar tools. Support depth varies; see the per-product sections above. For the **full** extract → JSON → PDF loop, prefer a local coding CLI ([Recommended environment](#recommended-environment)).

**Can I use this fully inside Claude.ai / ChatGPT / Gemini / DeepSeek in the browser?**  
Partially. You can upload docs in chat and get a strong JSON/Markdown draft if the skill (or `SKILL.md`) is in context. Browser chats usually **cannot** use `tech-resume-generator_files/` on disk or reliably run `generate_resume_pdf.mjs`. See [Browser chat limitations](#browser-chat-limitations). Optimal setup: **Cursor** or **Claude Code** with this repo cloned.

**Do I need to know how to code?**  
You need a terminal for `git clone` / `npm install` / optional PDF render. The agent does the resume writing. Chat-only users can follow `SKILL.md` in-product and render PDF later on a machine with Node.

**What files should I put in user_professional_data/?**  
Old resumes, LinkedIn exports/PDFs, certificates, portfolio dumps, notes — any mix. See [`tech-resume-generator_files/user_professional_data/README.md`](tech-resume-generator_files/user_professional_data/README.md). In a **browser** chat, upload those same files in the chat window instead.

**General vs JD-tailored — which should I pick?**  
General for a website / default résumé. JD-tailored when applying to a specific posting so keywords and emphasis match (still only true facts).

**How do I provide a job description?**  
Paste it in chat, or put files under `tech-resume-generator_files/job_description_data/`.

**Will it invent metrics or employers?**  
It must not. The skill instructs the agent to use only facts from your files. Always proofread before you submit.

**Can it write a cover letter or rewrite LinkedIn?**  
Not the primary goal. The skill description explicitly excludes cover-letters-alone and LinkedIn-only rewrites. You can still ask your agent separately.

**Does it auto-apply to jobs?**  
No. It only generates documents. You submit applications yourself.

**Why one page?**  
Industry SWE guidance across the researched sources defaults to a hard one-pager for most US tech roles. Academic CVs / some AU processes can differ — say so if you need a different length.

**What if my file format isn’t supported?**  
The agent should write `scripts/extractors/<format>_extract.py`, run it, and continue — not skip the file.

**What if PDF generation fails in the chat product?**  
Ask for valid resume JSON anyway, save it locally, then `npm run generate-resume -- path/to/file.json`. This is the expected fallback for most browser chats.

**Where do outputs go?**  
`tech-resume-generator_files/output/` (`general/` or `tailored/<slug>/`), plus `professional_data.md` there. Not inside the skill package.

**Is my data uploaded to you?**  
No hosted service. Files stay on your machine / in the AI provider you chose. Do not commit personal files under `tech-resume-generator_files/` to a public repo.

**Can I customize the PDF layout?**  
Edit `scripts/generate_resume_pdf.mjs` or adjust JSON content/density. Layout is intentionally ATS-simple (single column, Helvetica).

**What are the sample resumes for?**  
Optional visual/density references for the agent. They are **not** in the default clone (keeps the repo small). Run `npm run download-samples` if you want them. Never copy their personal details into your résumé.

**How do evals work?**  
See `skills/tech-resume-generator/evals/` (5 core cases). Run the skill on fixtures, then `eval_grade.py` / `eval_aggregate.py`.

**Why does the skill ask so many questions first?**  
Mode and JD must be explicit so the agent doesn’t invent a target role or skip your intent.

**Does it work offline?**  
Skill instructions and local scripts work offline. Sample re-download and some agent hosts need network. PDF generation needs local Node + skill-local `npm install` (`pdf-lib`).

**Windows?**  
Prefer `npx skills add … --copy -g -y` (copies instead of symlinks). Or use Git Bash/WSL, or copy `skills/tech-resume-generator` into your client’s skills directory. Then run `npm install` inside that folder.

**Is it free / open source?**  
Yes — MIT. See [LICENSE](LICENSE). Optional third-party sample resumes remain under their publishers’ terms.

**Who maintains this?**  
See [About the Author](#about-the-author) below.

[↑ Back to top](#table-of-contents)

---

## License

MIT — see [LICENSE](LICENSE). Optional sample resumes (downloaded into `skills/tech-resume-generator/assets/sample_resumes/`) remain subject to their original publishers’ terms; they are research references only and are not required to use the skill.

[↑ Back to top](#table-of-contents)

---

## About the Author

I am Baber Arjumand and I built **tech-resume-generator** after researching how strong technical résumés are written and packaging that workflow as a shareable Agent Skill so others can generate optimized one-pagers from their own career files.

- Repo: [github.com/baberarjumand/technical-resume-generator_agent-skill](https://github.com/baberarjumand/technical-resume-generator_agent-skill)
- Website: [baberarjumand.com](https://baberarjumand.com)
- Website (Personal): [baber.dev](https://baber.dev)
- GitHub: [github.com/baberarjumand](https://github.com/baberarjumand)
- LinkedIn: [linkedin.com/in/baberarjumand](https://www.linkedin.com/in/baberarjumand/)

[↑ Back to top](#table-of-contents)
