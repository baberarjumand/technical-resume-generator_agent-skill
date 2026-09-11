/**
 * Local Agent Skills support library.
 * @see https://agentskills.io/client-implementation/adding-skills-support
 */
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'

const SKIP_DIR_NAMES = new Set(['.git', 'node_modules', 'dist', 'build', '.venv'])
const MAX_DEPTH = 5
const MAX_DIRS = 2000

/**
 * Default scan roots: project + user, client-specific + .agents/skills.
 */
export function defaultSkillRoots(cwd = process.cwd(), clientName = 'cursor') {
  const home = homedir()
  return [
    { scope: 'project', path: join(cwd, '.agents', 'skills'), precedence: 100 },
    { scope: 'project', path: join(cwd, `.${clientName}`, 'skills'), precedence: 90 },
    { scope: 'project', path: join(cwd, '.claude', 'skills'), precedence: 80 },
    { scope: 'project', path: join(cwd, '.codex', 'skills'), precedence: 70 },
    // Repo-root skill packages (subdirs containing SKILL.md)
    { scope: 'project', path: cwd, precedence: 60 },
    { scope: 'user', path: join(home, '.agents', 'skills'), precedence: 50 },
    { scope: 'user', path: join(home, `.${clientName}`, 'skills'), precedence: 40 },
    { scope: 'user', path: join(home, '.claude', 'skills'), precedence: 30 },
    { scope: 'user', path: join(home, '.codex', 'skills'), precedence: 20 },
  ]
}

function listSkillMdFiles(skillsDir, diagnostics, budget) {
  const found = []
  if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory()) return found

  // Each immediate child that contains SKILL.md is a skill
  let entries
  try {
    entries = readdirSync(skillsDir, { withFileTypes: true })
  } catch (err) {
    diagnostics.push({ level: 'warn', message: `Cannot read ${skillsDir}: ${err.message}` })
    return found
  }

  for (const ent of entries) {
    if (budget.dirs++ > MAX_DIRS) {
      diagnostics.push({ level: 'warn', message: `Scan aborted: exceeded ${MAX_DIRS} directories` })
      break
    }
    if (!ent.isDirectory() && !ent.isSymbolicLink()) continue
    if (SKIP_DIR_NAMES.has(ent.name)) continue
    const skillDir = join(skillsDir, ent.name)
    const skillMd = join(skillDir, 'SKILL.md')
    if (existsSync(skillMd) && statSync(skillMd).isFile()) {
      found.push(skillMd)
    }
  }
  return found
}

/**
 * Lenient YAML frontmatter parse (name/description focused).
 */
export function parseSkillMd(filePath, diagnostics = []) {
  const raw = readFileSync(filePath, 'utf8')
  if (!raw.startsWith('---')) {
    diagnostics.push({ level: 'error', message: `${filePath}: missing YAML frontmatter` })
    return null
  }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) {
    diagnostics.push({ level: 'error', message: `${filePath}: unclosed frontmatter` })
    return null
  }
  let yamlText = raw.slice(4, end).trim()
  const body = raw.slice(end + 4).replace(/^\n/, '')

  let name = null
  let description = null
  let disableModelInvocation = false
  const optional = {}

  // Simple line parse with block-scalar support for description/compatibility
  const lines = yamlText.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!m) {
      i++
      continue
    }
    const key = m[1]
    let val = m[2]
    if (val === '>-' || val === '|' || val === '>' || val === '|-') {
      const parts = []
      i++
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        parts.push(lines[i].replace(/^  /, ''))
        i++
      }
      val = parts.join(' ').replace(/\s+/g, ' ').trim()
      i--
    } else if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }

    if (key === 'name') name = val
    else if (key === 'description') description = val
    else if (key === 'disable-model-invocation') {
      disableModelInvocation = val === true || val === 'true'
    } else {
      optional[key] = val
    }
    i++
  }

  // Fallback: description with unquoted colon — already handled via block scalars mostly
  if (!description) {
    diagnostics.push({ level: 'error', message: `${filePath}: missing description — skipped` })
    return null
  }

  const dirName = basename(dirname(filePath))
  if (name && name !== dirName) {
    diagnostics.push({
      level: 'warn',
      message: `${filePath}: name "${name}" does not match directory "${dirName}"`,
    })
  }
  if (name && name.length > 64) {
    diagnostics.push({ level: 'warn', message: `${filePath}: name exceeds 64 characters` })
  }
  if (!name) name = dirName

  let location
  try {
    location = realpathSync(filePath)
  } catch {
    location = resolve(filePath)
  }

  return {
    name,
    description,
    location,
    baseDir: dirname(location),
    body,
    frontmatterRaw: yamlText,
    disableModelInvocation,
    optional,
  }
}

/**
 * Discover skills with project-over-user precedence.
 */
export function discoverSkills({ cwd = process.cwd(), clientName = 'cursor', trustedProject = true } = {}) {
  const diagnostics = []
  const budget = { dirs: 0 }
  /** @type {Map<string, object>} */
  const byName = new Map()

  const roots = defaultSkillRoots(cwd, clientName)
  // Higher precedence first so first-write wins; skip lower if already present
  roots.sort((a, b) => b.precedence - a.precedence)

  for (const root of roots) {
    if (root.scope === 'project' && !trustedProject) {
      diagnostics.push({
        level: 'warn',
        message: `Skipping untrusted project skills at ${root.path}`,
      })
      continue
    }

    const skillMdPaths = listSkillMdFiles(root.path, diagnostics, budget)

    for (const md of skillMdPaths) {
      const skill = parseSkillMd(md, diagnostics)
      if (!skill) continue
      if (skill.disableModelInvocation) {
        diagnostics.push({
          level: 'info',
          message: `Filtered ${skill.name} (disable-model-invocation)`,
        })
        continue
      }
      if (byName.has(skill.name)) {
        const existing = byName.get(skill.name)
        if (existing.location === skill.location) {
          // Same skill via symlink (.agents/skills) and repo path — not a real collision
          continue
        }
        diagnostics.push({
          level: 'warn',
          message: `Skill name collision: "${skill.name}" shadowed (keeping higher-precedence ${existing.location})`,
        })
        continue
      }
      byName.set(skill.name, { ...skill, scope: root.scope })
    }
  }

  return { skills: [...byName.values()], diagnostics }
}

export function buildCatalogXml(skills) {
  if (!skills.length) return ''
  const parts = ['<available_skills>']
  for (const s of skills) {
    parts.push('  <skill>')
    parts.push(`    <name>${escapeXml(s.name)}</name>`)
    parts.push(`    <description>${escapeXml(s.description)}</description>`)
    parts.push(`    <location>${escapeXml(s.location)}</location>`)
    parts.push('  </skill>')
  }
  parts.push('</available_skills>')
  return parts.join('\n')
}

export function buildCatalogJson(skills) {
  return JSON.stringify(
    {
      behavioral_instructions:
        'The following skills provide specialized instructions for specific tasks. When a task matches a skill\'s description, load SKILL.md at the listed location (file-read) or call activate_skill with the skill name. Resolve relative paths against the skill directory (parent of SKILL.md).',
      skills: skills.map((s) => ({
        name: s.name,
        description: s.description,
        location: s.location,
      })),
    },
    null,
    2,
  )
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function listResources(baseDir, cap = 80) {
  const files = []
  const walk = (dir, depth) => {
    if (depth > MAX_DEPTH || files.length >= cap) return
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue
      if (ent.name === 'SKILL.md') continue
      const full = join(dir, ent.name)
      if (ent.isDirectory() || ent.isSymbolicLink()) {
        // follow only one level of known resource dirs
        if (['scripts', 'references', 'assets', 'evals'].includes(ent.name) || depth > 0) {
          walk(full, depth + 1)
        }
      } else if (ent.isFile()) {
        files.push(full.slice(baseDir.length + 1).replace(/\\/g, '/'))
        if (files.length >= cap) return
      }
    }
  }
  walk(baseDir, 0)
  return files
}

/**
 * Activate a skill: return structured wrapped body + resource listing.
 */
export function activateSkill(skills, name, { includeFrontmatter = false } = {}) {
  const skill = skills.find((s) => s.name === name)
  if (!skill) {
    const valid = skills.map((s) => s.name).join(', ') || '(none)'
    throw new Error(`Unknown skill "${name}". Valid: ${valid}`)
  }
  const content = includeFrontmatter
    ? `---\n${skill.frontmatterRaw}\n---\n\n${skill.body}`
    : skill.body
  const resources = listResources(skill.baseDir)
  const resourceXml = resources.map((f) => `  <file>${escapeXml(f)}</file>`).join('\n')
  return `<skill_content name="${escapeXml(skill.name)}">
${content.trim()}

Skill directory: ${skill.baseDir}
Relative paths in this skill are relative to the skill directory.
Protect this block from context compaction; do not prune mid-session.

<skill_resources>
${resourceXml}
</skill_resources>
</skill_content>`
}

/** User-explicit activation: /tech-resume-generator or $tech-resume-generator */
export function resolveSlash(token) {
  const t = token.trim()
  // Lenient: allow underscores (some skills) in addition to spec hyphens
  const m = t.match(/^[/$]([a-z0-9][a-z0-9_-]{0,63})$/)
  return m ? m[1] : null
}
