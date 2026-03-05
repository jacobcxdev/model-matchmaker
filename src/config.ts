import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { Profile } from "./types.ts";

interface GsdConfig {
  readonly model_profile?: string;
}

interface PluginConfig {
  readonly profile?: Profile;
}

const VALID_PROFILES: ReadonlySet<string> = new Set(["quality", "balanced", "budget"]);

function readJsonFile<T>(path: string): T | null {
  try {
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function isValidProfile(value: unknown): value is Profile {
  return typeof value === "string" && VALID_PROFILES.has(value);
}

export function resolveProfile(cwd?: string): Profile {
  // 1. GSD config (project-level)
  if (cwd) {
    const gsdPath = join(cwd, ".planning", "config.json");
    const gsd = readJsonFile<GsdConfig>(gsdPath);
    if (gsd?.model_profile && isValidProfile(gsd.model_profile)) {
      return gsd.model_profile;
    }
  }

  // 2. Plugin config (user-level)
  const pluginPath = join(homedir(), ".config", "model-matchmaker", "config.json");
  const plugin = readJsonFile<PluginConfig>(pluginPath);
  if (plugin?.profile && isValidProfile(plugin.profile)) {
    return plugin.profile;
  }

  // 3. Fallback
  return "balanced";
}
