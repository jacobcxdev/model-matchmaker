import { readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { classify, OVERRIDE_PREFIX } from "./classifier.js";
import { resolveProfile } from "./config.js";
import { Tier } from "./types.js";
const LOG_DIR = join(homedir(), ".local", "state", "model-matchmaker");
const LOG_FILE = join(LOG_DIR, "decisions.log");
function logDecision(entry) {
    try {
        mkdirSync(LOG_DIR, { recursive: true });
        const snippet = entry.snippet.slice(0, 20).replace(/\n/g, " ");
        const tierStr = entry.tier === Tier.STANDARD ? "STD" : entry.tier;
        const line = `${entry.timestamp} | ${entry.profile.padEnd(8)} | ${tierStr.padEnd(6)} | "${snippet}"\n`;
        appendFileSync(LOG_FILE, line);
    }
    catch {
        // Logging is best-effort — never block the hook
    }
}
function main() {
    try {
        const raw = readFileSync("/dev/stdin", "utf-8");
        const input = JSON.parse(raw);
        const prompt = input.prompt ?? "";
        if (!prompt.trim()) {
            return;
        }
        // Skip override prompts (prefixed with \)
        if (prompt.trimStart().startsWith(OVERRIDE_PREFIX)) {
            return;
        }
        const profile = resolveProfile(input.cwd);
        const result = classify(prompt, profile);
        logDecision({
            timestamp: new Date().toISOString(),
            profile,
            tier: result.tier,
            snippet: prompt,
        });
        // Plain text stdout — shown in transcript AND added to Claude's context
        if (result.message) {
            process.stdout.write(result.message);
        }
    }
    catch {
        // Never block Claude Code — silent failure
    }
}
main();
