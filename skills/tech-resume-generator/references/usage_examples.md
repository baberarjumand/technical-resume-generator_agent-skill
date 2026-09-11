# Usage examples

## Example 1 — General resume

**User**

> Please use tech-resume-generator to make my resume.

**Agent**

1. Runs `init_workspace.mjs` if needed (repo probe); on success continues with **repo workflow**.
2. Asks the user to put career files in `tech-resume-generator_files/user_professional_data/`.
3. Lists files found there; waits for confirmation.
4. Asks: general vs JD-tailored → user picks **general**.
5. Extracts, compiles `output/professional_data.md`, writes `output/general_generated_resume.json`, renders `output/general_generated_resume.pdf`.
6. Delivers those paths.

## Example 2 — JD-tailored

**User**

> Make me a job-tailored tech resume.

**Agent**

1. Collects + confirms career files under `user_professional_data/` first.
2. Asks mode → user picks **JD-tailored**.
3. Instructs upload to `job_description_data/`; lists files; waits for confirmation.
4. Authors `output/tailored_generated_resume.json` (keywords only where true); renders `output/tailored_generated_resume.pdf`.
5. Delivers paths.

## Example 3 — Files already on disk

**User**

> I already dropped resumes into user_professional_data/.

**Agent**

1. Lists those files and asks for confirmation (does not skip this step).
2. Continues with mode question, then generation with fixed output names.

## Example 4 — Unsupported format

**User**

> I dropped an `.odt` resume into `user_professional_data/`.

**Agent**

1. After file-list confirmation, runs `extract_user_data.py`; sees it under `unsupported` in `manifest.json`.
2. Writes extractors under `scripts/extractors/`, runs them, continues.

## Example 5 — Browser chat

**User** (Claude.ai / ChatGPT web)

> [uploads PDFs] Make my tech resume ATS-friendly.

**Agent**

1. `init_workspace.mjs` fails or is unavailable → **browser workflow**.
2. Lists uploaded career files; waits for confirmation.
3. Asks general vs JD-tailored; if tailored, collects JD uploads and confirms.
4. Presents `general_generated_resume.pdf` or `tailored_generated_resume.pdf` for download when possible (else JSON + local render instructions).
