# model-matchmaker

Effort-aware prompt routing for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Classifies prompt complexity and suggests the right model + reasoning effort so you're not burning Opus tokens on "yes" or giving Haiku an architecture task.

## What it does

model-matchmaker classifies every prompt into a complexity tier and injects a suggestion for which model and reasoning effort to use. You still switch models manually — the plugin tells you *when* and *what* to switch to.

| Tier | Triggers | Suggestion |
|------|----------|------------|
| **LOW** (trivial) | Affirmatives, git ops, file ops, mechanical tasks | `/model haiku` |
| **LOW** (simple) | Short prompts (≤6 words, no question) | `/model sonnet` with low reasoning effort |
| **STANDARD** | Everything else | No suggestion — current model at natural depth |
| **HIGH** | Architecture, security, cross-cutting, planning, very long prompts | `/model opus` with high reasoning effort (or `ultrawork` prefix) |

### Override

Prefix any prompt with `\` to skip the suggestion for that turn.

### Why not auto-switch?

The Claude Code hooks API doesn't support programmatic model switching. Rather than running a proxy server (which breaks OAuth on Max plans), model-matchmaker works within the plugin system to give you actionable suggestions before Claude executes.

## Installation

### From marketplace

```
/plugin marketplace add jacobcxdev/cc-plugins
/plugin install model-matchmaker@jacobcxdev-cc-plugins
```

### Local development

```bash
claude --plugin-dir ~/Developer/src/github/jacobcxdev/model-matchmaker
```

## Configuration

### With GSD (Get Shit Done)

The plugin reads your GSD profile automatically:

```bash
/gsd:set-profile quality   # Thorough by default, LOW only for trivial
/gsd:set-profile balanced  # Effort matches task (default)
/gsd:set-profile budget    # Lean responses, HIGH suggests /model opus
```

### Without GSD

Create `~/.config/model-matchmaker/config.json`:

```json
{
  "profile": "balanced"
}
```

## Profile Behaviour

| Profile | LOW threshold | HIGH threshold | Philosophy |
|---------|--------------|----------------|------------|
| `quality` | Only affirmatives, ≤6 words (no model switch suggestion) | Silent (already on Opus) | Pay compute tax, avoid correction tax |
| `balanced` | Trivial → Haiku, simple → Sonnet+low effort | Architecture/security → Opus+high effort | Smart routing — model matches task |
| `budget` | Silent (already on Sonnet) | Complex patterns → strongly recommend Opus | Maximum savings, escalate when it matters |

## Decision Log

Decisions are logged to `~/.local/state/model-matchmaker/decisions.log` for tuning analysis:

```
2026-03-04T22:35:00Z | balanced | LOW    | "yes"
2026-03-04T22:36:00Z | balanced | STD    | "fix the bug in auth..."
2026-03-04T22:37:00Z | quality  | HIGH   | "architect a new auth..."
```

## Development

```bash
pnpm install    # Install TypeScript
pnpm build      # Compile src/ → dist/
pnpm test       # Run tests (29 tests across all profiles)
```

## Licence

MIT
