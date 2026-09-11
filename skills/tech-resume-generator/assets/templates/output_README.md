# output

The **tech-resume-generator** skill writes generated artifacts here. You normally do **not** place source career files in this folder.

## Typical contents

| Path | Meaning |
| --- | --- |
| `professional_data.md` | Compiled, reconciled facts from your sources (facts only) |
| `general_generated_resume.json` | General one-page résumé source |
| `general_generated_resume.pdf` | General résumé PDF |
| `tailored_generated_resume.json` | JD-tailored résumé source |
| `tailored_generated_resume.pdf` | JD-tailored résumé PDF |

## Editing

You can tweak the `.json` by hand and re-run:

```bash
node scripts/generate_resume_pdf.mjs path/to/general_generated_resume.json
# or
node scripts/generate_resume_pdf.mjs path/to/tailored_generated_resume.json
```

(from the installed skill directory, after `npm install` there).

## What *not* to put here

- Raw career dumps → `user_professional_data/`
- Job postings → `job_description_data/`

## Privacy

Generated résumés contain personal data. Do not commit them to a public repo unless you intend to.
