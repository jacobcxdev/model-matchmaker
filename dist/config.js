import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const VALID_PROFILES = new Set(["quality", "balanced", "budget"]);
function readJsonFile(path) {
    try {
        const content = readFileSync(path, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
function isValidProfile(value) {
    return typeof value === "string" && VALID_PROFILES.has(value);
}
export function resolveProfile(cwd) {
    // 1. GSD config (project-level)
    if (cwd) {
        const gsdPath = join(cwd, ".planning", "config.json");
        const gsd = readJsonFile(gsdPath);
        if (gsd?.model_profile && isValidProfile(gsd.model_profile)) {
            return gsd.model_profile;
        }
    }
    // 2. Plugin config (user-level)
    const pluginPath = join(homedir(), ".config", "model-matchmaker", "config.json");
    const plugin = readJsonFile(pluginPath);
    if (plugin?.profile && isValidProfile(plugin.profile)) {
        return plugin.profile;
    }
    // 3. Fallback
    return "balanced";
}
