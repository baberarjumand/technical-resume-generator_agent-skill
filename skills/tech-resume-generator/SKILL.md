---
name: tech-resume-generator
description: >-
  Use this skill when the user wants to create, rewrite, optimize, or tailor a
  technical / SWE / engineering resume or CV from career materials (old resumes,
  LinkedIn exports, PDFs, images, Markdown, certs, or notes)—including casual
  asks like "make my resume better," "ATS-friendly," "one-pager for internships,"
  or "customize this for a job posting." Workspace I/O lives under
  tech-resume-generator_files/{user_professional_data,job_description_data,output}/
  (not user_data/). Produces a one-page ATS-safe tech resume as JSON + PDF
  named general_generated_resume.pdf or tailored_generated_resume.pdf. Do not use
  for cover letters alone, LinkedIn profile rewrites, recruiter cold emails,
  interview prep, or non-tech CVs unless the user also wants a tech resume.
license: MIT
compatibility: >-
  Requires Node.js 18+ and `npm install` inside this skill directory (pdf-lib).
  Optional: Python 3, poppler-utils (pdftotext/pdfinfo/pdftoppm), Pillow for PDF
  text extraction. Works in any Agent Skills–compatible client.
metadata:
  author: Baber Arjumand
  version: "1.5.0"
  open-standard: agentskills.io
---

# Tech Resume Generator

## Detect environment (required first)

There is no automatic browser/repo flag. **Probe once**, then follow the matching workflow.

1. Try to bootstrap the workspace (repo probe):

```bash
node scripts/init_workspace.mjs --workspace <workspace-root>
# After project install (from the user's project root):
node .agents/skills/tech-resume-generator/scripts/init_workspace.mjs
# or:
node .cursor/skills/tech-resume-generator/scripts/init_workspace.mjs
```

2. **If that succeeds** (folder `tech-resume-generator_files/` exists with the three subfolders) → use the **Repo workflow** below.
3. **If it fails** (no shell, no writable project root, sandbox blocked, or similar) → use the **Browser workflow** below. Do **not** keep retrying init.

Also treat as **browser** when the user only has chat uploads and no project filesystem.

---

## Repo workflow

### Workspace layout

At the **project / workspace root** (not inside this skill folder):

```
tech-resume-generator_files/
  user_professional_data/   # career materials (input)
  job_description_data/     # job postings (JD-tailored mode)
  output/                   # generated JSON + PDF + professional_data.md
```

`init_workspace.mjs` creates these folders and a `README.md` in each (does not overwrite existing READMEs).  
**Do not use a legacy `user_data/` folder** — inputs and outputs belong under `tech-resume-generator_files/` only.

### Interaction order (required — do not skip or reorder)

Follow these gates **in order**. Do not extract, compile, or generate until the user confirms the relevant file list(s). Do not invent a target role or JD.

#### 1. Collect career materials

Ask the user to add their career files into:

`tech-resume-generator_files/user_professional_data/`

Tell them what belongs there (old resumes, LinkedIn exports, certs, notes, PDFs, images, etc.). Wait until they say they have uploaded / added the files (or that files are already there).

#### 2. Confirm career file list

List every file found under `user_professional_data/` (relative paths; skip `README.md` / `.gitkeep` / `_extracted/` unless the user put sources there). Ask:

> Here are the career files I found. Are these the correct files to use?

Do **not** continue until the user confirms. If they say no, wait for them to add/remove files and re-list until they confirm.

#### 3. Choose mode

Only after career-file confirmation, ask:

> Do you want a **general** optimized tech resume, or a resume **tailored to a job description**?

#### 4. If JD-tailored — collect and confirm JD files

Instruct the user to add job description file(s) into:

`tech-resume-generator_files/job_description_data/`

Wait for upload. Then list every file under `job_description_data/` (skip `README.md` / `.gitkeep`) and ask:

> Here are the job description files I found. Are these the correct files to use?

Do **not** generate until they confirm. If they decline, wait for changes and re-list.

(If they already pasted a JD in chat, save it under `job_description_data/` as a file, include it in the list, and still get confirmation.)

#### 5. Generate

After confirmations (and mode choice), run extract → compile → author JSON → render PDF (steps below).

#### 6. Deliver

Tell the user exactly where the artifacts are:

| Mode | PDF path | JSON path |
| --- | --- | --- |
| General | `tech-resume-generator_files/output/general_generated_resume.pdf` | `…/output/general_generated_resume.json` |
| JD-tailored | `tech-resume-generator_files/output/tailored_generated_resume.pdf` | `…/output/tailored_generated_resume.json` |

Also mention `tech-resume-generator_files/output/professional_data.md`.

### Checklist

```
Resume generation (repo):
- [ ] init_workspace succeeded → tech-resume-generator_files/ present
- [ ] User asked to place files in user_professional_data/
- [ ] Career file list shown + user confirmed
- [ ] Mode chosen (general | JD-tailored)
- [ ] If tailored: user asked to place JD in job_description_data/
- [ ] If tailored: JD file list shown + user confirmed
- [ ] Extraction complete (or new extractors written)
- [ ] output/professional_data.md compiled
- [ ] Resume JSON written (general_generated_resume.json or tailored_generated_resume.json)
- [ ] PDF rendered with matching name; overflow fixed
- [ ] Output paths delivered to user
```

### Input contract

- Career files: `tech-resume-generator_files/user_professional_data/` (any mix of `.md`, `.txt`, `.pdf`, images, `.docx`, `.json`, `.ts`, LinkedIn exports, certs, notes). Subfolders OK. **Do not skip unknown files.**
- Job postings: `tech-resume-generator_files/job_description_data/`
- Details: [references/user_data_contract.md](references/user_data_contract.md). Examples: [references/usage_examples.md](references/usage_examples.md).

### Available scripts

Paths are relative to this skill directory. Data folders live under workspace `tech-resume-generator_files/`.

| Script | When to run |
| --- | --- |
| `scripts/init_workspace.mjs` | **First** — create `tech-resume-generator_files/{user_professional_data,job_description_data,output}/` |
| `scripts/extract_user_data.py` | After career-file confirmation — inventory + extract `user_professional_data/` |
| `scripts/generate_resume_pdf.mjs` | After writing resume JSON — render sibling `.pdf` |
| `scripts/eval_grade.py` / `eval_aggregate.py` | Eval suite |
| `scripts/download_sample_resumes.py` | Optional samples |
| `scripts/extractors/<format>_extract.py` | Unsupported formats |

### Generation steps (after confirmations)

#### 1. Inventory and extract

```bash
python3 scripts/extract_user_data.py \
  --input <workspace>/tech-resume-generator_files/user_professional_data \
  --output <workspace>/tech-resume-generator_files/user_professional_data/_extracted
```

**Unknown formats:** write `scripts/extractors/<format>_extract.py`, run it, continue. Never drop a file.

#### 2. Compile professional data

Write `<workspace>/tech-resume-generator_files/output/professional_data.md` using [references/professional_data_template.md](references/professional_data_template.md).

- Facts only — never invent employers, titles, dates, tools, metrics, or credentials.
- Reconcile conflicts: official docs > LinkedIn timeline > old resume wording.
- Identity comes **only** from the user’s files.
- Omit street address, photo, DOB from the résumé even if present in sources.

#### 3. Optimize (load references on demand)

**Always** read [references/resume_guidelines/99_cross-source-rules.md](references/resume_guidelines/99_cross-source-rules.md) before authoring.

Then load **only** what the case needs:

- Student / &lt;~3 YoE → `01_`, `08_`, `10_`, `18_`
- Experienced SWE → `06_`, `07_`, `11_`, `21_`
- Optional samples → `assets/sample_resumes/` (never copy content)
- Bullet formulas → `16_`, `12_`, `15_`
- JSON → [references/json_schema.md](references/json_schema.md) + [assets/templates/resume_example.json](assets/templates/resume_example.json)

**Defaults (experienced industry SWE):** one page, ≥0.5" margins, single column, Helvetica/Arial/Calibri; skills → experience → education; ownership verb + tech + metric; JD mode = true keywords only.

#### 4. Author resume JSON (fixed names)

Write exactly one of:

- General: `tech-resume-generator_files/output/general_generated_resume.json`
- Tailored: `tech-resume-generator_files/output/tailored_generated_resume.json`

If multiple JD files were confirmed, produce **one** tailored résumé that reflects the confirmed posting set (ask which posting is primary if they conflict). Do not invent employers from the JD.

#### 5. Render PDF

```bash
npm install   # once, in this skill directory
node scripts/generate_resume_pdf.mjs <path-to-resume.json>
```

The renderer writes a sibling PDF with the same basename, so you get:

- `general_generated_resume.pdf` or
- `tailored_generated_resume.pdf`

Fix layout overflow until the page fits.

#### 6. Deliver

Report the full paths to the PDF, JSON, and `professional_data.md`.

---

## Browser workflow

Use when `init_workspace.mjs` fails or there is no project filesystem. Same **interaction order**, adapted for chat uploads:

1. Ask the user to **upload/attach** career files in chat.
2. List the uploaded career files and ask for confirmation before continuing.
3. Ask **general vs JD-tailored**.
4. If tailored: ask them to upload JD file(s) (or paste the JD); list what you received; wait for confirmation.
5. Compile facts and produce résumé **JSON** + **PDF** when possible.
   - Prefer downloadable filenames: `general_generated_resume.pdf` or `tailored_generated_resume.pdf`.
   - If the host cannot render PDF, provide the JSON as `general_generated_resume.json` / `tailored_generated_resume.json` and a Markdown draft, then tell them to run locally:

```bash
node scripts/generate_resume_pdf.mjs path/to/general_generated_resume.json
# or
node scripts/generate_resume_pdf.mjs path/to/tailored_generated_resume.json
```

6. Still never invent metrics/employers; still one-page ATS rules.

---

## Evaluation (core — not optional)

Follow [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills). When evaluating this skill:

1. Read [evals/evals.json](evals/evals.json) and fixtures under [evals/files/](evals/files/).
2. Write artifacts to `evals-workspace/iteration-N/eval-<slug>/with_skill/outputs/` (same filenames as `tech-resume-generator_files/output/`).
3. Grade with `scripts/eval_grade.py`; aggregate with `scripts/eval_aggregate.py`.
4. Description triggers: [evals/trigger_queries.json](evals/trigger_queries.json).

Details: [evals/README.md](evals/README.md).

## Gotchas

- **Do not invent metrics or tools.**
- **Sample resumes are optional references, not content.**
- **Section order depends on seniority** (students may put education first).
- **`tech-resume-generator_files/` is outside the skill folder** so installs stay read-only-friendly.
- **Script paths are skill-relative**; workspace paths are under the project root.
- **`.docx` is not auto-extracted** — write an extractor when needed.
- After `npx skills add`, run `npm install` inside the skill directory before PDF rendering.
- **Fixed output names:** always `general_generated_resume.pdf` or `tailored_generated_resume.pdf` (plus matching `.json`).

## Hard constraints

- No invented certifications, tools, metrics, or employers
- No street address, photo, DOB, or Expert/Beginner proficiency labels on the résumé
- One page for industry SWE unless the user explicitly needs an academic CV / AU 2-page CV
- Career files confirmed before mode question; JD files confirmed before tailored generation
