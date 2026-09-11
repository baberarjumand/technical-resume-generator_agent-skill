# Usage examples

## Example 1 — General resume

**User**

> I put my old resumes, LinkedIn PDFs, and certs in `user_data/`. Please use tech-resume-generator to make my resume.

**Agent**

1. Asks: general vs JD-tailored → user picks **general**.
2. Runs `scripts/extract_user_data.py` on the workspace `user_data/` (skill-relative script path).
3. Reads PDFs/images; writes `output/professional_data.md`.
4. Applies `99_cross-source-rules.md`; writes `output/general/jane_doe_resume.json`.
5. Runs `node scripts/generate_resume_pdf.mjs` on that JSON (or `npm run generate-resume` from the workspace).
6. If overflow, trims oldest bullets and regenerates.
7. Replies with paths to the JSON and PDF.

## Example 2 — JD-tailored (paste)

**User**

> Generate a tailored tech resume for this posting: [pastes JD for Staff Frontend Engineer at Acme].

**Agent**

1. Confirms mode = **JD-tailored** (JD already in chat).
2. Ensures `user_data/` is populated; extracts and compiles facts.
3. Authors `output/tailored/acme-staff-frontend/jane_doe_resume.json` with Acme keywords only where true.
4. Renders PDF; delivers paths.

## Example 3 — JD file on disk

**User**

> I added `user_data/job_description.md`. Make a tailored resume.

**Agent**

1. Confirms tailored mode.
2. Reads `user_data/job_description.md` as the JD.
3. Same extract → compile → JSON → PDF flow into `output/tailored/<slug>/`.

## Example 4 — Multiple jobs

**User**

> Tailor resumes for everything in `user_data/jobs/`.

**Agent**

1. Lists each file under `user_data/jobs/`.
2. Compiles `professional_data.md` once.
3. Produces one JSON+PDF pair per JD under `output/tailored/<slug>/`.

## Example 5 — Unsupported file format

**User**

> I dropped an `.odt` resume and a Notion HTML export into `user_data/`.

**Agent**

1. Runs `extract_user_data.py`; sees them listed under `unsupported` in `manifest.json`.
2. Writes `scripts/extractors/odt_extract.py` (and/or `html_extract.py`), runs them, merges text into `_extracted/`.
3. Continues compilation and résumé generation.
