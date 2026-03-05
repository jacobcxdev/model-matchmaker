import { readFileSync } from "node:fs";
import { resolveProfile } from "./config.js";
const SESSION_CONTEXT = {
    balanced: `Effort routing active (model-matchmaker, profile: balanced).
Model tiers: Haiku for git ops, renames, formatting, simple edits. Sonnet for feature work, debugging, standard implementation. Opus for architecture, deep analysis, security review, cross-codebase reasoning.
When you receive an [Effort: LOW] or [Effort: HIGH] tag, suggest the user switch models before executing. The user can prefix with \\ to skip suggestions.`,
    quality: `Effort routing active (model-matchmaker, profile: quality). Default: thorough.
You're on Opus for a reason. Only [Effort: LOW] tags appear for trivially simple tasks — be concise for those. Everything else gets full depth.`,
    budget: `Effort routing active (model-matchmaker, profile: budget). Default: efficient.
Keep responses lean. When you receive an [Effort: HIGH] tag, strongly recommend switching to Opus before executing — the task needs deep reasoning.`,
};
function main() {
    try {
        const raw = readFileSync("/dev/stdin", "utf-8");
        const input = JSON.parse(raw);
        const profile = resolveProfile(input.cwd);
        const context = SESSION_CONTEXT[profile];
        // Plain text stdout — shown in transcript AND added to Claude's context
        process.stdout.write(context);
    }
    catch {
        // Never block Claude Code — silent failure
    }
}
main();
