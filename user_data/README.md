# User data folder

Place **all** files about your professional background here before asking an agent to run the `tech-resume-generator` skill.

This folder is at the **workspace root** (outside the skill package) so the skill can be installed read-only under `~/.claude/skills/`, Cursor skills, etc.

Full contract (also bundled inside the skill for zip installs): [`skills/tech-resume-generator/references/user_data_contract.md`](../skills/tech-resume-generator/references/user_data_contract.md).

## What to put here

Any mix of:

- Old resumes (PDF, DOCX, Markdown, plain text, images)
- LinkedIn exports or full-page PDF / PNG snapshots
- Certificates and transcripts (PDF or images)
- Portfolio or personal-site dumps (Markdown, JSON, TypeScript, text)
- Notes about roles, metrics, projects, skills
- Screenshots of profiles or job history

Subfolders are fine (`certs/`, `old_resumes/`, `linkedin/`, etc.). The agent inventories everything recursively.

## Job descriptions (optional)

**General resume:** you do not need a job description.

**JD-tailored resume:** provide the posting in one of these ways:

1. Paste the job description into the chat when the agent asks, or
2. Save a single file here:
   - `job_description.md`
   - `job_description.txt`
   - `job_description.pdf`
3. For multiple postings, use:
   ```
   user_data/jobs/
     acme-frontend-engineer.md
     bigco-staff-swe.pdf
   ```

## Privacy

This folder is gitignored (except this README). Do not commit personal documents to a public repo.

## After generation

Compiled facts and resumes are written under `output/` at the workspace root (sibling to this folder), not inside the skill package.
