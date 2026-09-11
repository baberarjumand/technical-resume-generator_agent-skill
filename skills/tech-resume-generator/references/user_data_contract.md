# User data contract

Place career materials in **`user_data/` at the workspace / project root** (sibling to the installed skill, not inside `tech-resume-generator/`).

## What to put here

Any mix of:

- Old resumes (PDF, DOCX, Markdown, plain text, images)
- LinkedIn exports or full-page PDF / PNG snapshots
- Certificates and transcripts (PDF or images)
- Portfolio or personal-site dumps (Markdown, JSON, TypeScript, text)
- Notes about roles, metrics, projects, skills
- Screenshots of profiles or job history

Subfolders are fine (`certs/`, `old_resumes/`, `linkedin/`, etc.). The agent inventories everything recursively.

## Job descriptions

**General resume:** no JD required.

**JD-tailored resume:** provide the posting via one of:

1. Paste into chat when the agent asks
2. Single file: `job_description.md`, `.txt`, or `.pdf`
3. Multiple postings:
   ```
   user_data/jobs/
     acme-frontend-engineer.md
     bigco-staff-swe.pdf
   ```

## Privacy

Do not commit personal documents to a public repo. Keep `user_data/` contents gitignored locally.

## Outputs

Compiled facts and resumes are written under workspace **`output/`**, not inside the skill package.
