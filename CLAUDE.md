# model-matchmaker

Claude Code plugin — classifies prompt complexity, suggests model + reasoning effort.

## Commands

```bash
pnpm build      # tsc → dist/*.js (ESM)
pnpm test       # node --experimental-transform-types --test test/*.test.ts
```

## Architecture

- `src/classifier.ts` — Pure classification logic (regex + word-count heuristics). No I/O.
- `src/config.ts` — Profile resolution: GSD → plugin config → "balanced" fallback.
- `src/prompt-router.ts` — `UserPromptSubmit` hook entry point. Reads stdin JSON, classifies, outputs plain text.
- `src/session-context.ts` — `SessionStart` hook. Injects profile-aware model tier guidance.
- `src/types.ts` — Tier enum, Profile type, interfaces.
- `hooks/hooks.json` — Hook definitions referencing `dist/` compiled output.
- `skills/effort-config/SKILL.md` — User-invocable skill for configuring routing.

## Key Conventions

- **Zero runtime deps.** Only `typescript` and `@types/node` as devDeps.
- **Source imports use `.ts` extensions** — `rewriteRelativeImportExtensions` in tsconfig rewrites to `.js` on compile.
- **Tests use `--experimental-transform-types`** (not `--experimental-strip-types`) because `Tier` is an enum.
- **`dist/` is committed** — plugin consumers clone from GitHub and need compiled output. Do NOT add `dist/` to `.gitignore`.
- **Hook output is plain text stdout** — not JSON `additionalContext`. Plain text is visible in transcript AND reaches Claude's context.
- **Override prefix is `\`** (backslash) — `!` enters bash mode in Claude Code.

## Testing

29 tests across 4 suites covering all 3 profiles (quality/balanced/budget) × all tiers.
Tests are pure functions — no mocking, no I/O. Add new patterns to classifier.ts, add matching test cases.
