#!/usr/bin/env bun
// build.ts — turn lifeos.config.json into pi resources.
//   skills/<name>/SKILL.md  shim per configured skill (lowercase name, points at the original)
//   AGENTS.md               global context, rendered from AGENTS.template.md
// Both outputs are generated (gitignored). Exit 1 if any configured skill is unusable.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = import.meta.dir;
const HOME = process.env.HOME!;
const expand = (p: string) => p.replace(/^~(?=\/|$)/, HOME);

const config = JSON.parse(readFileSync(join(ROOT, "lifeos.config.json"), "utf8"));
const paths: Record<string, string> = Object.fromEntries(
  Object.entries(config.paths as Record<string, string>).map(([k, v]) => [k, expand(v)]),
);

// pi's rule (docs/skills.md): lowercase, digits, single hyphens, ≤64 chars; description ≤1024
const VALID_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function description(skillMd: string): string | null {
  const fm = skillMd.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const lines = fm[1].split("\n");
  const i = lines.findIndex((l) => /^description:/.test(l));
  if (i < 0) return null;
  let value = lines[i].replace(/^description:\s*/, "");
  if (/^[|>][+-]?$/.test(value)) {
    const block: string[] = [];
    for (const l of lines.slice(i + 1)) {
      if (/^\S/.test(l)) break;
      block.push(l.trim());
    }
    value = block.join(" ");
  }
  value = value.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
  return value.length > 1024 ? value.slice(0, 1021) + "..." : value;
}

const skillsOut = join(ROOT, "skills");
rmSync(skillsOut, { recursive: true, force: true });
let failed = 0;

for (const [name, folder] of Object.entries(config.skills as Record<string, string>)) {
  const src = join(paths.skillsRoot, folder, "SKILL.md");
  if (!VALID_NAME.test(name) || name.length > 64) { console.log(`✗ ${name}: invalid pi name`); failed++; continue; }
  if (!existsSync(src)) { console.log(`✗ ${name}: missing ${src}`); failed++; continue; }
  const desc = description(readFileSync(src, "utf8"));
  if (!desc) { console.log(`✗ ${name}: no description in ${src}`); failed++; continue; }
  const dir = join(skillsOut, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), `---
name: ${name}
description: ${JSON.stringify(desc)}
---
This is a pointer. Read \`${src}\` now and follow it.
Its supporting files (Workflows/, Tools/, references/) sit beside it in \`${join(paths.skillsRoot, folder)}/\`; resolve relative paths from there.
It was written for Claude Code: where it names tools pi lacks (Agent, Skill, Task, WebSearch), do the work inline with bash and read, or say plainly what you can't do here.
`);
  console.log(`✓ ${name} -> ${folder}`);
}

let agents = readFileSync(join(ROOT, "AGENTS.template.md"), "utf8");
for (const [k, v] of Object.entries({ ...paths, principal: config.principal, assistant: config.assistant })) {
  agents = agents.replaceAll(`{{${k}}}`, v);
}
const leftover = agents.match(/\{\{\w+\}\}/g);
if (leftover) { console.log(`✗ AGENTS.md: unfilled ${[...new Set(leftover)].join(", ")}`); failed++; }
writeFileSync(join(ROOT, "AGENTS.md"), agents);
console.log(`✓ AGENTS.md (${Buffer.byteLength(agents)} bytes)`);

process.exit(failed ? 1 : 0);
