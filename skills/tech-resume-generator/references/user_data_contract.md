# Workspace data contract

After install / first use, the skill creates **`tech-resume-generator_files/` at the workspace / project root** (sibling to `.agents/skills/` or `.cursor/skills/`, not inside the skill package).

```
tech-resume-generator_files/
  user_professional_data/   # career materials
  job_description_data/     # job postings (JD-tailored)
  output/                   # generated resumes
```

## Interaction order

1. User places career files in `user_professional_data/` → agent lists them → user confirms  
2. Agent asks general vs JD-tailored  
3. If tailored: user places JD files in `job_description_data/` → agent lists them → user confirms  
4. Agent generates under `output/` with fixed names (below)

## user_professional_data/

Any mix of:

- Old resumes (PDF, DOCX, Markdown, plain text, images)
- LinkedIn exports or full-page PDF / PNG snapshots
- Certificates and transcripts (PDF or images)
- Portfolio or personal-site dumps (Markdown, JSON, TypeScript, text)
- Notes about roles, metrics, projects, skills
- Screenshots of profiles or job history

Subfolders are fine. The agent inventories everything recursively. **Do not skip unknown files.**

## job_description_data/

**General resume:** no JD required.

**JD-tailored resume:** after mode choice, provide the posting via files in this folder (`.md`, `.txt`, `.pdf`, etc.). The agent lists them and waits for confirmation before generating. Pasted JD text should be saved here as a file first.

## Privacy

Do not commit personal documents to a public repo. Keep folder *contents* gitignored (READMEs may stay tracked).

## Outputs

Written under **`tech-resume-generator_files/output/`** (not inside the skill package):

| File | When |
| --- | --- |
| `professional_data.md` | Always after extract/compile |
| `general_generated_resume.json` + `.pdf` | General mode |
| `tailored_generated_resume.json` + `.pdf` | JD-tailored mode |

## Browser hosts

Browser chats have no project folder — upload files in chat instead; same confirm → mode → (JD confirm) → deliver PDF download order. See the skill’s Browser workflow.
