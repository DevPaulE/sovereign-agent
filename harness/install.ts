#!/usr/bin/env bun
// install.ts — wire pi-lifeos into this machine's pi. Safe to re-run.
//   1. build (skills + AGENTS.md)
//   2. ~/.pi/agent/AGENTS.md -> this package's AGENTS.md (symlink; an existing real file is backed up)
//   3. add this folder to ~/.pi/agent/settings.json "packages" (loaded by path, so edits are live)
//   4. clone Miessler's LifeOS read-only to paths.upstream if it isn't there
import { existsSync, lstatSync, readFileSync, readlinkSync, renameSync, symlinkSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = import.meta.dir;
const HOME = process.env.HOME!;
const AGENT_DIR = join(HOME, ".pi/agent");
const expand = (p: string) => p.replace(/^~(?=\/|$)/, HOME);

const build = Bun.spawnSync(["bun", join(ROOT, "build.ts")], { stdout: "inherit", stderr: "inherit" });
if (build.exitCode !== 0) { console.log("build failed — fix lifeos.config.json and re-run"); process.exit(1); }

const link = join(AGENT_DIR, "AGENTS.md");
const target = join(ROOT, "AGENTS.md");
if (existsSync(link) || lstatSync(link, { throwIfNoEntry: false })) {
  const isOurs = lstatSync(link).isSymbolicLink() && readlinkSync(link) === target;
  if (!isOurs) {
    if (lstatSync(link).isSymbolicLink()) unlinkSync(link);
    else { renameSync(link, `${link}.bak-${Date.now()}`); console.log("backed up existing AGENTS.md"); }
  }
}
if (!lstatSync(link, { throwIfNoEntry: false })) symlinkSync(target, link);
console.log(`✓ ${link} -> ${target}`);

const settingsPath = join(AGENT_DIR, "settings.json");
const settings = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, "utf8")) : {};
const packages: unknown[] = settings.packages ?? [];
if (!packages.includes(ROOT)) {
  settings.packages = [...packages, ROOT];
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}
console.log(`✓ settings.json packages includes ${ROOT}`);

const config = JSON.parse(readFileSync(join(ROOT, "lifeos.config.json"), "utf8"));

// Hide auto-discovered stock skills (~/.agents/skills, matched as "skills/<dir>") except config.stockSkills.keep.
// Note: "!skills/*" also hides anything in ~/.pi/agent/skills; put personal pi skills in this package instead.
const keep: string[] = config.stockSkills?.keep ?? [];
const managed = ["!skills/*", ...keep.map((k) => `+skills/${k}`)];
const others = ((settings.skills ?? []) as string[]).filter((s) => !/^[!+]skills\//.test(s));
settings.skills = [...others, ...managed];
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
console.log(`✓ stock skills hidden except: ${keep.join(", ") || "(none)"}`);

// Default model: "provider/id" where provider is the first segment (openrouter/deepseek/deepseek-v4-pro → openrouter).
const model: string | undefined = config.model?.default;
if (model) {
  settings.defaultProvider = model.split("/")[0];
  settings.defaultModel = model.split("/").slice(1).join("/"); // pi wants the bare ID here (docs/settings.md: "Startup model ID")
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  console.log(`✓ default model ${model}`);
}
const upstream = expand(config.paths.upstream);
if (!existsSync(upstream)) {
  console.log(`cloning danielmiessler/LifeOS -> ${upstream} (shallow)`);
  const clone = Bun.spawnSync(["git", "clone", "--depth", "1", "https://github.com/danielmiessler/LifeOS.git", upstream], { stdout: "inherit", stderr: "inherit" });
  if (clone.exitCode !== 0) { console.log("clone failed — everything else is installed; re-run later"); process.exit(1); }
}
console.log(`✓ upstream at ${upstream} (refresh: git -C ${upstream} pull)`);
