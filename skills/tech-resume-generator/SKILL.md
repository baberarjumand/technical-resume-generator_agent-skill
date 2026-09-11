---
name: tech-resume-generator
description: >-
  Use this skill when the user wants to create, rewrite, optimize, or tailor a
  technical / SWE / engineering resume or CV from career materials (old resumes,
  LinkedIn exports, PDFs, images, Markdown, certs, or notes)—including casual
  asks like "make my resume better," "ATS-friendly," "one-pager for internships,"
  or "customize this for a job posting." Produces a one-page ATS-safe tech resume
  as JSON + PDF (general or JD-tailored). Do not use for cover letters alone,
  LinkedIn profile rewrites, recruiter cold emails, interview prep, or non-tech
  CVs unless the user also wants a tech resume.
license: MIT
compatibility: >-
  Requires Node.js 18+ and `npm install` inside this skill directory (pdf-lib).
  Optional: Python 3, poppler-utils (pdftotext/pdfinfo/pdftoppm), Pillow for PDF
  text extraction. Works in any Agent Skills–compatible client.
metadata:
  author: Baber Arjumand
  version: "1.2.0"
  open-standard: agentskills.io
---

# Tech Resume Generator

## Ask first (required)

Before reading files, ask:

> Do you want a **general** optimized tech resume, or a resume **tailored to a job description**?

Then confirm the input folder (default: **`user_data/`** at the **workspace root**, sibling to where this skill is installed—not inside the skill folder).

If **JD-tailored** and no JD is present yet, ask how they will provide it:

- paste into chat, or
- `user_data/job_description.md` / `.txt` / `.pdf`, or
- one or more files under `user_data/jobs/<slug>.*`

Do not invent a target role or JD.

## Checklist

```
Resume generation:
- [ ] Mode chosen (general | JD-tailored)
- [ ] JD obtained if tailored
- [ ] user_data/ inventoried
- [ ] Extraction complete (or new extractors written)
- [ ] output/professional_data.md compiled
- [ ] Resume JSON written
- [ ] PDF rendered; overflow fixed
- [ ] Paths delivered to user
```

## Input contract

Accept any mix under `user_data/`: `.md`, `.txt`, `.pdf`, images (`.png`/`.jpg`/`.jpeg`/`.webp`), `.docx`, `.json`, `.ts`, LinkedIn exports, old resumes, certificates, notes. Subfolders OK. **Do not skip unknown files.**

Details: [references/user_data_contract.md](references/user_data_contract.md). Examples: [references/usage_examples.md](references/usage_examples.md).

## Available scripts

Paths are relative to this skill directory. Prefer running them with an absolute path to the skill root, or `cd` into the skill directory first. `user_data/` and `output/` live on the **workspace root**.

| Script | When to run |
| --- | --- |
| `scripts/extract_user_data.py` | After confirming `user_data/` — inventory + extract known formats |
| `scripts/generate_resume_pdf.mjs` | After writing resume JSON — render sibling `.pdf` (needs skill-local `npm install`) |
| `scripts/eval_grade.py` | **Required** after producing eval outputs — grade assertions |
| `scripts/eval_aggregate.py` | After grading an iteration — write `benchmark.json` |
| `scripts/download_sample_resumes.py` | **Optional** — only if sample layout assets are missing |
| `scripts/extractors/<format>_extract.py` | When `manifest.json` lists `unsupported` files — **write then run** |

Run `python3 scripts/<name>.py --help` or `node scripts/generate_resume_pdf.mjs --help` for flags and examples.

## Workflow

### 1. Inventory and extract

```bash
python3 scripts/extract_user_data.py --input <workspace>/user_data --output <workspace>/user_data/_extracted
```

**Defaults:** PDF text via poppler; copy plaintext/Markdown/JSON/TS; list images for vision/OCR.

**Unknown formats:** Write `scripts/extractors/<format>_extract.py` (document usage in the file header), run it, fold results into `_extracted/`. Never drop a file because the format was unexpected.

Read images and low-text PDFs with vision/OCR when the host allows it.

### 2. Compile professional data

Write `<workspace>/output/professional_data.md` using [references/professional_data_template.md](references/professional_data_template.md).

- Facts only — never invent employers, titles, dates, tools, metrics, or credentials.
- Reconcile conflicts: official docs > LinkedIn timeline > old resume wording.
- Identity (name, location, phone, email, links, education) comes **only** from the user’s files.
- Omit street address, photo, DOB from the résumé even if present in sources.

### 3. Optimize (load references on demand)

**Always** read [references/resume_guidelines/99_cross-source-rules.md](references/resume_guidelines/99_cross-source-rules.md) before authoring.

Then load **only** what the case needs (do **not** preload all guidelines):

- Student / &lt;~3 YoE → education-first notes in `01_`, `08_`, `10_`, `18_` (skip experienced density packs)
- Experienced SWE → keep skills→experience→education; density refs in `06_`, `07_`, `11_`, `21_`
- Optional visual density after samples are downloaded → `assets/sample_resumes/` (see that folder’s README); never copy sample content
- Bullet formulas stuck → `16_` (What/Why/How), `12_` (SCO), `15_` (verb+tech+metric)
- Source index only if you need another guideline → [references/resume_guidelines/00_README.md](references/resume_guidelines/00_README.md)
- JSON fields → [references/json_schema.md](references/json_schema.md) + [assets/templates/resume_example.json](assets/templates/resume_example.json)

**Defaults (experienced industry SWE):**

- One page, ≥0.5" margins, single column, Helvetica/Arial/Calibri; no tables/columns/graphics/icons/headers/footers
- Order: short headline → contact + links → 2–3 skill categories → reverse-chrono experience → education
- Bullets: ownership verb + tech + measurable outcome; 3–4 × 1–2 lines; ban *helped / assisted / responsible for*
- JD mode: true keywords and reordered emphasis only — still only real facts

### 4. Author resume JSON

- General: `<workspace>/output/general/<slug>_resume.json`
- Tailored: `<workspace>/output/tailored/<job-slug>/<slug>_resume.json`

Schema: `meta`, `header`, `links`, `skills`, `experience`, `education`. Use clickable `tel:`, `mailto:`, `https://` hrefs.

### 5. Render PDF (validate loop)

If `pdf-lib` is missing, install once inside **this skill directory**:

```bash
npm install
```

Then:

```bash
node scripts/generate_resume_pdf.mjs <path-to-resume.json>
```

If the script warns about **layout overflow**, cut the weakest bullets or oldest roles and regenerate until it fits. Only deliver when there is no overflow warning (or remaining space ≥ 0).

If Node is unavailable, deliver validated JSON + a Markdown résumé fallback and tell the user to run the commands above after installing Node 18+.

### 6. Deliver

Report paths to `output/professional_data.md`, the `.json`/`.pdf`, and any new extractors under `scripts/extractors/`.

## Evaluation (core — not optional)

Follow [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills). When the user asks to evaluate/test/benchmark this skill, **or** when you change `SKILL.md`/scripts before shipping, run the eval loop:

1. Read [evals/evals.json](evals/evals.json) and fixtures under [evals/files/](evals/files/).
2. For each eval, use a clean context; activate this skill; run the prompt; write artifacts to `evals-workspace/iteration-N/eval-<slug>/with_skill/outputs/` (same shape as workspace `output/`).
3. Grade each run:

```bash
python3 scripts/eval_grade.py \
  --evals evals/evals.json \
  --eval-id <id> \
  --outputs <...>/with_skill/outputs \
  --workspace <...>/with_skill
```

4. Aggregate: `python3 scripts/eval_aggregate.py --iteration <...>/iteration-N`
5. Fix failures by editing skill instructions/scripts (generalize — do not overfit one fixture). Re-run in `iteration-N+1`.
6. Description triggering: use [evals/trigger_queries.json](evals/trigger_queries.json) when changing the frontmatter `description`.

Details: [evals/README.md](evals/README.md).

## Gotchas

- **Do not invent metrics or tools.** If a source lacks a number, write a strong qualitative bullet or omit — never fabricate “improved performance 40%.”
- **Sample resumes are optional references, not content.** Download only if needed; never copy names, schools, or bullets into the user’s résumé.
- **Section order depends on seniority.** Students / early career may put education first; experienced industry SWE uses skills → experience → education (TIH/Jachja). See `99` rule 4 and 16.
- **Guideline “tensions” sections** apply to the **end user’s** seniority and goals — not a fixed persona.
- **`user_data/` is outside the skill folder** so installs under `~/.claude/skills/` (etc.) stay read-only-friendly. Always write outputs under the workspace `output/`.
- **Script paths are skill-relative** (`scripts/...`). Workspace paths for data are absolute or cwd-relative to the user’s project root.
- **`.docx` is not auto-extracted** by the bundled script — write `scripts/extractors/docx_extract.py` (or equivalent) when needed.
- Prefer a few role-family variants over one unique file per posting unless the user asks.
- After `npx skills add`, run `npm install` inside the installed skill directory before PDF rendering.

## Hard constraints

- No invented certifications, tools, metrics, or employers
- No street address, photo, DOB, or Expert/Beginner proficiency labels on the résumé
- One page for industry SWE unless the user explicitly needs an academic CV / AU 2-page CV
