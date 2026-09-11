# Skills client

Local implementation of the [Agent Skills client lifecycle](https://agentskills.io/client-implementation/adding-skills-support):

1. **Discover** skills under project/user `.agents/skills/` (and Cursor/Claude/Codex dirs)
2. **Catalog** name + description (+ location) for progressive disclosure
3. **Activate** full instructions with `<skill_content>` wrapping and resource listing
4. **Slash** user-explicit activation (`/tech-resume-generator`)

## Commands

From the repo root:

```bash
npm run skills:discover
npm run skills:catalog
npm run skills:activate -- tech-resume-generator
npm run skills:slash -- /tech-resume-generator
```

Or:

```bash
node skills_client/cli.mjs catalog --format json
node skills_client/cli.mjs activate tech-resume-generator
```

## Project install path

This repo exposes the skill at:

```
.agents/skills/tech-resume-generator -> ../../skills/tech-resume-generator
```

Compatible agents that scan `.agents/skills/` (see [quickstart](https://agentskills.io/skill-creation/quickstart)) will discover it automatically.

## Using the activated skill

After activate/slash, the agent should follow `SKILL.md`: confirm files in `tech-resume-generator_files/user_professional_data/` → ask general vs JD-tailored → (if tailored) confirm `job_description_data/` → write `general_generated_resume.pdf` or `tailored_generated_resume.pdf` under `output/`.
