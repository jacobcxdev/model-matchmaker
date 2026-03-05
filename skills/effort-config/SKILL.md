---
name: effort-config
description: Configure effort-aware prompt routing. Use when the user asks about effort levels, model routing, or wants to adjust classification thresholds.
---

# Effort Configuration

The model-matchmaker plugin classifies prompts into complexity tiers and suggests the right model + reasoning effort:

- **LOW (trivial)**: Mechanical tasks (git ops, affirmatives, file renames) → suggests `/model haiku`
- **LOW (simple)**: Short prompts (≤6 words, no question) → suggests `/model sonnet` with low reasoning effort
- **STANDARD**: Normal implementation work → no suggestion, current model at natural depth
- **HIGH**: Complex reasoning (architecture, security, cross-codebase) → suggests `/model opus` with high reasoning effort (or `ultrawork` prefix for one turn)

Prefix any prompt with `\` to skip the suggestion for that turn.

## GSD Profile Integration

The active GSD profile (quality/balanced/budget) controls thresholds and suggestions:

| Profile | LOW | HIGH |
|---------|-----|------|
| quality | Affirmatives, ≤6 words (concise, no model switch) | Silent (already on Opus) |
| balanced | Trivial → Haiku, simple → Sonnet+low effort | Opus+high effort |
| budget | Silent (already on Sonnet) | Strongly recommend Opus |

## Adjusting Behaviour

Change profile via `/gsd:set-profile <quality|balanced|budget>`.

For non-GSD projects, create `~/.config/model-matchmaker/config.json`:
```json
{
  "profile": "balanced"
}
```

## Decision Log

Decisions are logged to `~/.local/state/model-matchmaker/decisions.log` for tuning analysis.
