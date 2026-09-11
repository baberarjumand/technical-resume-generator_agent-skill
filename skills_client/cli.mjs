#!/usr/bin/env node
/**
 * Agent Skills client helpers — discovery, catalog, activation.
 * Implements the lifecycle from:
 * https://agentskills.io/client-implementation/adding-skills-support
 *
 * Usage:
 *   node skills_client/cli.mjs discover [--cwd DIR] [--json]
 *   node skills_client/cli.mjs catalog [--cwd DIR] [--format xml|json]
 *   node skills_client/cli.mjs activate <skill-name> [--cwd DIR] [--full]
 *   node skills_client/cli.mjs slash <token> [--cwd DIR]
 */
import {
  activateSkill,
  buildCatalogJson,
  buildCatalogXml,
  discoverSkills,
  resolveSlash,
} from './index.mjs'

function usage() {
  console.log(`Usage:
  node skills_client/cli.mjs discover [--cwd DIR] [--json]
  node skills_client/cli.mjs catalog [--cwd DIR] [--format xml|json]
  node skills_client/cli.mjs activate <skill-name> [--cwd DIR] [--full]
  node skills_client/cli.mjs slash </skill-name|/skill-name> [--cwd DIR]

Scans project/user .agents/skills and client skill dirs (progressive disclosure catalog).`)
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--cwd') args.cwd = argv[++i]
    else if (a === '--format') args.format = argv[++i]
    else if (a === '--json') args.json = true
    else if (a === '--full') args.full = true
    else if (a === '--help' || a === '-h') args.help = true
    else args._.push(a)
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
if (args.help || args._.length === 0) {
  usage()
  process.exit(args.help ? 0 : 1)
}

const cwd = args.cwd || process.cwd()
const cmd = args._[0]

if (cmd === 'discover') {
  const { skills, diagnostics } = discoverSkills({ cwd })
  if (args.json) {
    console.log(JSON.stringify({ skills, diagnostics }, null, 2))
  } else {
    for (const d of diagnostics) {
      console.error(`[${d.level}] ${d.message}`)
    }
    for (const s of skills) {
      console.log(`${s.name}\t${s.location}`)
    }
    console.error(`Discovered ${skills.length} skill(s)`)
  }
  process.exit(0)
}

if (cmd === 'catalog') {
  const { skills, diagnostics } = discoverSkills({ cwd })
  for (const d of diagnostics) console.error(`[${d.level}] ${d.message}`)
  if (skills.length === 0) {
    process.exit(0)
  }
  const format = args.format || 'xml'
  if (format === 'json') console.log(buildCatalogJson(skills))
  else console.log(buildCatalogXml(skills))
  process.exit(0)
}

if (cmd === 'activate') {
  const name = args._[1]
  if (!name) {
    console.error('Error: activate requires <skill-name>')
    process.exit(1)
  }
  const { skills, diagnostics } = discoverSkills({ cwd })
  for (const d of diagnostics) console.error(`[${d.level}] ${d.message}`)
  try {
    const wrapped = activateSkill(skills, name, { includeFrontmatter: !!args.full })
    console.log(wrapped)
    process.exit(0)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}

if (cmd === 'slash') {
  const token = args._[1]
  if (!token) {
    console.error('Error: slash requires a token like /tech-resume-generator')
    process.exit(1)
  }
  const { skills, diagnostics } = discoverSkills({ cwd })
  for (const d of diagnostics) console.error(`[${d.level}] ${d.message}`)
  const name = resolveSlash(token)
  if (!name) {
    console.error(`Error: could not parse skill name from ${token}`)
    process.exit(1)
  }
  try {
    console.log(activateSkill(skills, name, { includeFrontmatter: false }))
    process.exit(0)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}

console.error(`Unknown command: ${cmd}`)
usage()
process.exit(1)
