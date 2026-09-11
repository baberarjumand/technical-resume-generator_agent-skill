# Security

This repository publishes an [Agent Skills](https://agentskills.io/) package (`skills/tech-resume-generator`). Please review scripts before installing via [`npx skills`](https://www.skills.sh/docs) or any agent marketplace.

## What the skill does

- Reads career materials you place in workspace `tech-resume-generator_files/user_professional_data/` (or files you upload in chat), after you confirm the listed files.
- Optionally reads job postings from `tech-resume-generator_files/job_description_data/` (JD-tailored mode), after you confirm that list.
- Writes compiled facts and résumé artifacts under workspace `tech-resume-generator_files/output/` as:
  - `professional_data.md`
  - `general_generated_resume.json` + `general_generated_resume.pdf`, or
  - `tailored_generated_resume.json` + `tailored_generated_resume.pdf`
- Optionally grades eval fixtures under `evals-workspace/`.

It does **not** phone home, create accounts, or submit job applications.

## Scripts (review these)

| Script | Network | Filesystem | Notes |
| --- | --- | --- | --- |
| `scripts/generate_resume_pdf.mjs` | No | Reads a résumé JSON path you pass; writes a sibling `.pdf` | Depends on `pdf-lib` (declared in the skill `package.json`) |
| `scripts/extract_user_data.py` | No | Reads `--input` (default `tech-resume-generator_files/user_professional_data/`); writes `--output` (default `<input>/_extracted`) | Optional local tools: poppler-utils, Pillow |
| `scripts/init_workspace.mjs` | No | Creates `tech-resume-generator_files/{user_professional_data,job_description_data,output}/` + READMEs under a project root you choose | Run after project install / on first repo use |
| `scripts/eval_grade.py` / `eval_aggregate.py` | No | Reads eval fixtures / agent outputs you point at | For maintainers running the eval suite |
| `scripts/download_sample_resumes.py` | **Yes** — HTTPS GETs listed in `assets/sample_resumes/download_manifest.json` | Writes under `assets/sample_resumes/` | Optional; not required to generate a résumé. Review URLs in the manifest before running. |
| `scripts/extractors/*` | Varies | Agent-written helpers for unknown formats | Review any new extractor before running it |

## Trust boundaries

- Treat `tech-resume-generator_files/user_professional_data/`, `job_description_data/`, and `output/` as sensitive. Do not commit them to a public fork.
- Prefer `npx skills add … --list` to inspect discovered skills before install.
- Prefer `--copy` over symlinks on Windows if link creation fails.
- skills.sh may run automated security audits; report issues via [security.vercel.com](https://security.vercel.com) for the ecosystem, and open a GitHub issue on this repo for package-specific problems.

## Reporting

Email: use the contact links on [baberarjumand.com](https://baberarjumand.com) or open a private security advisory on [this repository](https://github.com/baberarjumand/technical-resume-generator_agent-skill) if enabled.
