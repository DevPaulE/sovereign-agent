/**
 * Jev router (ISA C14–C17) — registers the `jev/auto` virtual model.
 *
 * On every user turn, Jev (the cheap classifier, one call — Level 5C model router pattern)
 * answers a single choice question about the user prompt alone, truncated (ISA A5: never
 * file contents, never the personal layer):
 *
 *   build → openrouter/auto    OpenRouter Auto picks the strongest available model for
 *                              the turn. Ruling 2026-10-14: no fixed builder.
 *   other → openrouter/deepseek/deepseek-v4-pro   "otherwise v4 is fine" (2026-10-09).
 *
 * Tool follow-ups (reason: continuation), retries and out-of-band requests (compaction
 * summaries) stay on the model that handled the turn, so prompt caches and thinking
 * signatures stay valid. If Jev fails, answers too slowly (> timeoutMs) or is missing,
 * the turn falls back to V4 Pro and is never blocked (C16).
 *
 * Jev routes, Paul rules (C17): every classification and every fallback is appended to
 * `log/jev-router.jsonl` beside lifeos.config.json — route, confidence, model, ms, prompt
 * snippet. Routes, threshold, timeout and truncation live in `model.router` in
 * lifeos.config.json, read at load from the first location that exists
 * (~/Projects/toolbelt/pi-lifeos, ~/dpi-work/pi-lifeos, or $JEV_ROUTER_CONFIG).
 *
 * Requires OPENROUTER_API_KEY (Jev is reached through OpenRouter). Usage:
 *   pi --extension ./jev-router.ts --model jev/auto     # try it
 * or copy this file into ~/.pi/agent/extensions/ and select `jev/auto` in /model (C14).
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Message } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

// ── C17: configuration — source of truth is `model.router` in lifeos.config.json ─────────────

interface RouterConfig {
	/** publisher/id of the Jev classifier. */
	classifier: string;
	/** provider/id for build / agent-orchestration turns. */
	buildRoute: string;
	/** provider/id for everything else, and the fallback when Jev fails (C16). */
	otherRoute: string;
	/** minimum P(build) that takes the build route. */
	confidenceThreshold: number;
	/** Jev must answer within this window or the turn falls back (C16). */
	timeoutMs: number;
	/** Only the first N characters of the user prompt reach Jev (A5). */
	maxPromptChars: number;
}

const DEFAULTS: RouterConfig = {
	classifier: "openrouter/~typesafe/jev-latest",
	buildRoute: "openrouter/auto",
	otherRoute: "openrouter/deepseek/deepseek-v4-pro",
	confidenceThreshold: 0.6,
	timeoutMs: 1500,
	maxPromptChars: 2000,
};

/** Load `model.router` at startup; first lifeos.config.json that exists and parses wins. */
function loadConfig(): { config: RouterConfig; configPath?: string; logPath: string } {
	const candidates = [
		process.env.JEV_ROUTER_CONFIG,
		join(homedir(), "Projects/toolbelt/pi-lifeos/lifeos.config.json"),
		join(homedir(), "dpi-work/pi-lifeos/lifeos.config.json"),
	].filter((p): p is string => Boolean(p));

	for (const path of candidates) {
		if (!existsSync(path)) continue;
		try {
			const block = JSON.parse(readFileSync(path, "utf8"))?.model?.router;
			if (!block || typeof block !== "object") continue;
			const config: RouterConfig = {
				classifier: typeof block.classifier === "string" ? block.classifier : DEFAULTS.classifier,
				buildRoute: typeof block.buildRoute === "string" ? block.buildRoute : DEFAULTS.buildRoute,
				otherRoute: typeof block.otherRoute === "string" ? block.otherRoute : DEFAULTS.otherRoute,
				confidenceThreshold:
					typeof block.confidenceThreshold === "number" ? block.confidenceThreshold : DEFAULTS.confidenceThreshold,
				timeoutMs: typeof block.timeoutMs === "number" ? block.timeoutMs : DEFAULTS.timeoutMs,
				maxPromptChars: typeof block.maxPromptChars === "number" ? block.maxPromptChars : DEFAULTS.maxPromptChars,
			};
			return { config, configPath: path, logPath: process.env.JEV_ROUTER_LOG ?? join(dirname(path), "log", "jev-router.jsonl") };
		} catch {
			// unreadable — try the next candidate
		}
	}
	return { config: DEFAULTS, logPath: process.env.JEV_ROUTER_LOG ?? join(homedir(), ".dpi", "jev-router.jsonl") };
}

/** "openrouter/deepseek/deepseek-v4-pro" → ["openrouter", "deepseek/deepseek-v4-pro"] */
function splitModelRef(ref: string): [string, string] {
	const at = ref.indexOf("/");
	if (at <= 0) throw new Error(`jev-router: "${ref}" is not a provider/id reference`);
	return [ref.slice(0, at), ref.slice(at + 1)];
}

// ── C16 logging — every decision lands in the JSONL Paul audits ───────────────────────────────

/** Fire-and-forget; logging must never block or fail a turn. */
function record(logPath: string, entry: Record<string, unknown>): void {
	try {
		const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n";
		mkdirSync(dirname(logPath), { recursive: true });
		appendFileSync(logPath, line);
	} catch {
		// C16: never block a turn on audit-log trouble
	}
}

// ── helpers ────────────────────────────────────────────────────────────────────────────────────

function lastUserText(messages: readonly Message[]): string {
	const content = messages.filter((message) => message.role === "user").at(-1)?.content ?? "";
	if (typeof content === "string") return content;
	return content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("\n");
}

export default function (pi: ExtensionAPI) {
	const { config, configPath, logPath } = loadConfig();
	const [classifierProvider, classifierId] = splitModelRef(config.classifier);
	const [buildProvider, buildId] = splitModelRef(config.buildRoute);
	const [otherProvider, otherId] = splitModelRef(config.otherRoute);

	const logNote = configPath ? `config ${configPath}` : "config: file not found, using defaults";
	record(logPath, { verdict: "boot", note: logNote, config: { ...config } });

	/** One Jev call on the prompt alone. Returns the verdict, confidence and timing. */
	async function decide(
		request: { signal?: AbortSignal },
		ctx: ExtensionContext,
		prompt: string,
	): Promise<{ verdict: "build" | "other" | "fallback"; confidence: number | null; note?: string; ms: number }> {
		const started = Date.now();
		const jev = ctx.modelRegistry.findOfType("classifier", classifierProvider, classifierId);
		if (!jev) return { verdict: "fallback", confidence: null, note: "classifier not in catalog", ms: Date.now() - started };
		try {
			let timer: ReturnType<typeof setTimeout> | undefined;
			const timeout = new Promise<never>((_, reject) => {
				timer = setTimeout(() => reject(new Error(`no answer within ${config.timeoutMs} ms`)), config.timeoutMs);
			});
			const call = ctx.modelRegistry.classify(
				jev,
				{
					state: { prompt },
					questions: {
						work: {
							type: "choice",
							instructions: "What kind of work does the request in `prompt` describe? Judge the request itself, not the surrounding conversation.",
							criteria: {
								build: "Writing, changing, debugging, reviewing, or operating software, or orchestrating AI agents — engineering work that benefits from the strongest available model",
								other: "Questions, explanation, planning, writing, research, or anything that is not software engineering work",
							},
						},
					},
				},
				{ signal: request.signal },
			);
			call.catch(() => {}); // if the timeout wins the race, never reject unhandled
			const result = await Promise.race([call, timeout]);
			clearTimeout(timer);
			const ms = Date.now() - started;
			if (result.stopReason !== "stop") return { verdict: "fallback", confidence: null, note: `stopReason ${result.stopReason}`, ms };
			const answer = result.answers.work;
			if (!answer || answer.type !== "choice") return { verdict: "fallback", confidence: null, note: "no choice answer", ms };
			const confidence = answer.probabilities.build ?? 0;
			return { verdict: confidence >= config.confidenceThreshold ? "build" : "other", confidence, ms };
		} catch (e) {
			return { verdict: "fallback", confidence: null, note: String(e).slice(0, 150), ms: Date.now() - started };
		}
	}

	pi.registerVirtualModel({
		provider: "jev",
		id: "auto",
		name: "Jev Auto",
		thinkingLevels: ["low", "medium", "high", "xhigh"],
		// Shown before the first response; the binding limits of the two route targets.
		contextWindow: 1_024_000,
		maxTokens: 30_000,
		async route(request, ctx) {
			const build = ctx.modelRegistry.find(buildProvider, buildId);
			const other = ctx.modelRegistry.find(otherProvider, otherId);
			if (!build && !other) throw new Error(`jev-router: neither ${config.buildRoute} nor ${config.otherRoute} is in the catalog`);

			// Follow-ups, retries and out-of-band requests stay on the model that handled the turn —
			// prompt caches and thinking signatures stay valid. (C15: tool follow-ups stay.)
			const sticky = request.reason === "retry" ? request.failed : request.previous;
			if (sticky && request.reason !== "user") return { model: sticky.model, thinkingLevel: sticky.thinkingLevel ?? "medium" };

			// Out-of-band requests first ever (no previous): default route, no classify.
			if (request.reason === "direct") {
				const model = other ?? build!;
				record(logPath, { verdict: "direct", route: other ? config.otherRoute : config.buildRoute, model: `${model.provider}/${model.id}`, confidence: null });
				return { model, thinkingLevel: request.thinkingLevel };
			}

			// A new user turn: one Jev call decides (C15).
			const prompt = lastUserText(request.messages).slice(0, config.maxPromptChars);
			const decision = await decide({ signal: request.signal }, ctx, prompt);
			const model = decision.verdict === "build" ? (build ?? other!) : (other ?? build!);
			record(logPath, {
				verdict: decision.verdict,
				route: decision.verdict === "build" ? config.buildRoute : config.otherRoute,
				model: `${model.provider}/${model.id}`,
				confidence: decision.confidence,
				threshold: config.confidenceThreshold,
				note: decision.note,
				ms: decision.ms,
				prompt: prompt.slice(0, 80),
			});
			return { model, thinkingLevel: request.thinkingLevel };
		},
	});
}