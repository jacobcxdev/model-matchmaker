import { Tier, type Profile, type ClassifierResult } from "./types.ts";

// --- Sanitisation ---

const XML_TAG_RE = /<[^>]+>/g;
const URL_RE = /https?:\/\/\S+/g;
const FILE_PATH_RE = /(?:\/[\w.-]+){2,}/g;
const CODE_BLOCK_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`]+`/g;

function sanitise(prompt: string): string {
  return prompt
    .replace(CODE_BLOCK_RE, "")
    .replace(INLINE_CODE_RE, "")
    .replace(XML_TAG_RE, "")
    .replace(URL_RE, "")
    .replace(FILE_PATH_RE, "")
    .trim();
}

function wordCount(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length;
}

// --- LOW patterns ---

const AFFIRMATIVE_RE =
  /^(yes|no|ok|y|n|go|go ahead|sure|do it|continue|proceed|correct|exactly|sounds good|lgtm|ship it|thanks|thank you|looks good|perfect|great|nice|agreed|approve)\.?!?$/i;

const GIT_OPS_RE =
  /\bgit\s+(commit|push|pull|status|log|diff|add|stash|branch|merge|rebase|checkout|tag|cherry-pick)\b/i;

const FILE_OPS_RE =
  /\b(rename|move|copy|delete|remove)\s+(the\s+)?(file|folder|directory)\b/i;

const MECHANICAL_RE =
  /\b(format|lint|prettier|eslint|sort imports|run tests|run build|npm install|pnpm install|bun install|make)\b/i;

// --- HIGH patterns ---

const ARCHITECTURE_RE =
  /\b(architect|architecture|design system|system design|evaluate tradeoffs?|trade-?offs?|compare approaches)\b/i;

const CROSS_CUTTING_RE =
  /\b(across the codebase|system-?wide|refactor all|entire codebase|every file)\b/i;

const DEEP_ANALYSIS_RE =
  /\b(security review|security audit|performance audit|root cause|why does|explain why|deep dive|investigate)\b/i;

const PLANNING_RE =
  /\b(migration plan|roadmap|redesign|rethink|strategy|strategic)\b/i;

const MULTI_DOMAIN_RE =
  /\b(multi-?system|cross-?module|end-?to-?end)\b/i;

// --- Override prefix ---

export const OVERRIDE_PREFIX = "\\";

// --- Messages ---

const SKIP_HINT = "Prefix with `\\` to skip.";

const LOW_TRIVIAL_MESSAGE =
  `[Effort: LOW] Trivial/mechanical task. Suggest \`/model haiku\` for cost savings. ${SKIP_HINT} One sentence.`;

const LOW_SIMPLE_MESSAGE =
  `[Effort: LOW] Simple task. Suggest \`/model sonnet\` with low reasoning effort. ${SKIP_HINT} One sentence.`;

const LOW_MESSAGE_QUALITY =
  `[Effort: LOW] Trivially simple task. Be direct — 1-3 sentences, no preamble.`;

const HIGH_MESSAGE_BALANCED =
  `[Effort: HIGH] Complex reasoning task. Suggest \`/model opus\` with high reasoning effort (or prefix with \`ultrawork\` for one turn). ${SKIP_HINT} Then go deep: extended thinking, edge cases, multiple approaches.`;

const HIGH_MESSAGE_BUDGET =
  `[Effort: HIGH] Complex reasoning task. Strongly recommend \`/model opus\` with high reasoning effort (or prefix with \`ultrawork\`). ${SKIP_HINT} This needs deep reasoning that lighter models may struggle with.`;

// --- LOW sub-classification ---

type LowCategory = "trivial" | "simple" | false;

function classifyLow(sanitised: string, profile: Profile): LowCategory {
  if (AFFIRMATIVE_RE.test(sanitised)) {
    return profile !== "budget" ? "trivial" : false;
  }

  if (profile === "quality") {
    return wordCount(sanitised) <= 6 && !sanitised.includes("?") ? "simple" : false;
  }

  if (profile === "budget") {
    return false;
  }

  if (GIT_OPS_RE.test(sanitised)) return "trivial";
  if (FILE_OPS_RE.test(sanitised)) return "trivial";
  if (MECHANICAL_RE.test(sanitised)) return "trivial";

  if (wordCount(sanitised) <= 6 && !sanitised.includes("?")) return "simple";

  return false;
}

function isHigh(sanitised: string, profile: Profile): boolean {
  if (profile === "quality") {
    return false;
  }

  if (ARCHITECTURE_RE.test(sanitised)) return true;
  if (CROSS_CUTTING_RE.test(sanitised)) return true;
  if (DEEP_ANALYSIS_RE.test(sanitised)) return true;
  if (PLANNING_RE.test(sanitised)) return true;
  if (MULTI_DOMAIN_RE.test(sanitised)) return true;

  const wc = wordCount(sanitised);
  if (wc > 150 && sanitised.includes("?")) return true;
  if (wc > 250) return true;

  return false;
}

function getLowMessage(category: LowCategory, profile: Profile): string {
  if (profile === "quality") return LOW_MESSAGE_QUALITY;
  return category === "trivial" ? LOW_TRIVIAL_MESSAGE : LOW_SIMPLE_MESSAGE;
}

function getHighMessage(profile: Profile): string {
  if (profile === "budget") return HIGH_MESSAGE_BUDGET;
  return HIGH_MESSAGE_BALANCED;
}

export function classify(prompt: string, profile: Profile): ClassifierResult {
  const sanitised = sanitise(prompt);

  // Check HIGH first — a short prompt can still be complex (e.g. "do a security review")
  if (isHigh(sanitised, profile)) {
    return { tier: Tier.HIGH, message: getHighMessage(profile) };
  }

  const lowCategory = classifyLow(sanitised, profile);
  if (lowCategory) {
    return { tier: Tier.LOW, message: getLowMessage(lowCategory, profile) };
  }

  return { tier: Tier.STANDARD, message: null };
}
