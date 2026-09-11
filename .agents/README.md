# .agents

Cross-client [Agent Skills](https://agentskills.io/) discovery root.

This repo installs the skill at:

```
.agents/skills/tech-resume-generator -> ../../skills/tech-resume-generator
```

Canonical skill path: `skills/tech-resume-generator/` (skills.sh / `npx skills` layout; kebab-case name per [Agent Skills spec](https://agentskills.io/specification)).
A convenience symlink also exists at repo root: `tech-resume-generator` → `skills/tech-resume-generator`.

Clients that scan `.agents/skills/` (VS Code Copilot, and others following the [adding-skills-support](https://agentskills.io/client-implementation/adding-skills-support) convention) will find it automatically.

Generate a progressive-disclosure catalog for your agent harness:

```bash
npm run skills:catalog
npm run skills:activate -- tech-resume-generator
```

On Windows, prefer `npx skills add … --copy` instead of relying on these symlinks.
