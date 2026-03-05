import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classify } from "../src/classifier.ts";
import { Tier } from "../src/types.ts";

// --- Balanced profile (default) ---

describe("classifier – balanced profile", () => {
  // LOW tier — trivial (Haiku)
  it("classifies affirmatives as LOW and recommends haiku", () => {
    for (const prompt of ["yes", "no", "ok", "y", "go ahead", "sure", "do it", "lgtm", "ship it", "thanks"]) {
      const result = classify(prompt, "balanced");
      assert.equal(result.tier, Tier.LOW, `Expected LOW for "${prompt}"`);
      assert.ok(result.message?.includes("/model haiku"), `Expected haiku for "${prompt}"`);
    }
  });

  it("classifies git ops as LOW and recommends haiku", () => {
    const result = classify("git commit", "balanced");
    assert.equal(result.tier, Tier.LOW);
    assert.ok(result.message?.includes("/model haiku"));
  });

  it("classifies file ops as LOW and recommends haiku", () => {
    const result = classify("rename the file", "balanced");
    assert.equal(result.tier, Tier.LOW);
    assert.ok(result.message?.includes("/model haiku"));
  });

  it("classifies mechanical tasks as LOW and recommends haiku", () => {
    for (const prompt of ["run tests", "run build", "lint", "format", "sort imports"]) {
      const result = classify(prompt, "balanced");
      assert.equal(result.tier, Tier.LOW, `Expected LOW for "${prompt}"`);
      assert.ok(result.message?.includes("/model haiku"), `Expected haiku for "${prompt}"`);
    }
  });

  // LOW tier — simple (Sonnet + low effort)
  it("classifies short prompts as LOW and recommends sonnet with low effort", () => {
    const result = classify("fix the bug", "balanced");
    assert.equal(result.tier, Tier.LOW);
    assert.ok(result.message?.includes("/model sonnet"));
    assert.ok(result.message?.includes("low reasoning effort"));
  });

  it("does not classify short questions as LOW", () => {
    const result = classify("what is this?", "balanced");
    assert.notEqual(result.tier, Tier.LOW);
  });

  // Override prefix
  it("includes \\ override prefix in LOW messages", () => {
    const result = classify("git commit", "balanced");
    assert.ok(result.message?.includes("\\"));
  });

  // STANDARD tier
  it("classifies normal prompts as STANDARD", () => {
    const result = classify("fix the bug in the authentication module please", "balanced");
    assert.equal(result.tier, Tier.STANDARD);
    assert.equal(result.message, null);
  });

  // HIGH tier (Opus + high effort)
  it("classifies architecture prompts as HIGH and recommends opus with high effort", () => {
    const result = classify("architect a new auth system for the application", "balanced");
    assert.equal(result.tier, Tier.HIGH);
    assert.ok(result.message?.includes("/model opus"));
    assert.ok(result.message?.includes("high reasoning effort"));
  });

  it("mentions ultrawork as alternative for HIGH", () => {
    const result = classify("architect a new auth system", "balanced");
    assert.ok(result.message?.includes("ultrawork"));
  });

  it("classifies cross-cutting prompts as HIGH", () => {
    const result = classify("refactor all error handling across the codebase", "balanced");
    assert.equal(result.tier, Tier.HIGH);
  });

  it("classifies deep analysis prompts as HIGH", () => {
    for (const prompt of ["do a security review", "investigate the root cause", "deep dive into the issue"]) {
      const result = classify(prompt, "balanced");
      assert.equal(result.tier, Tier.HIGH, `Expected HIGH for "${prompt}"`);
    }
  });

  it("classifies planning prompts as HIGH", () => {
    const result = classify("create a migration plan for the database", "balanced");
    assert.equal(result.tier, Tier.HIGH);
  });

  it("classifies very long prompts (>250 words) as HIGH", () => {
    const longPrompt = "word ".repeat(260).trim();
    const result = classify(longPrompt, "balanced");
    assert.equal(result.tier, Tier.HIGH);
  });

  it("classifies long analytical prompts (>150 words with ?) as HIGH", () => {
    const longQuestion = "word ".repeat(155).trim() + "?";
    const result = classify(longQuestion, "balanced");
    assert.equal(result.tier, Tier.HIGH);
  });

  // Sanitisation
  it("strips code blocks before classification", () => {
    const prompt = "```\narchitect a system\n```\nyes";
    const result = classify(prompt, "balanced");
    assert.equal(result.tier, Tier.LOW);
  });

  it("strips inline code before classification", () => {
    const prompt = "run `git commit` please";
    const result = classify(prompt, "balanced");
    assert.equal(result.tier, Tier.LOW);
  });

  it("strips URLs before classification", () => {
    const prompt = "yes https://example.com/very/long/path/that/adds/words";
    const result = classify(prompt, "balanced");
    assert.equal(result.tier, Tier.LOW);
  });
});

// --- Quality profile ---

describe("classifier – quality profile", () => {
  it("classifies affirmatives as LOW with no model switch suggestion", () => {
    const result = classify("yes", "quality");
    assert.equal(result.tier, Tier.LOW);
    assert.ok(!result.message?.includes("/model haiku"));
  });

  it("classifies very short prompts as LOW", () => {
    const result = classify("fix bug", "quality");
    assert.equal(result.tier, Tier.LOW);
  });

  it("does NOT classify git ops as LOW (narrower threshold)", () => {
    const result = classify("git commit the changes to the repository", "quality");
    assert.notEqual(result.tier, Tier.LOW);
  });

  it("does NOT classify complex prompts as HIGH (already at max)", () => {
    const result = classify("architect a new auth system across the codebase", "quality");
    assert.equal(result.tier, Tier.STANDARD);
    assert.equal(result.message, null);
  });
});

// --- Budget profile ---

describe("classifier – budget profile", () => {
  it("does NOT classify affirmatives as LOW (already at low baseline)", () => {
    const result = classify("yes", "budget");
    assert.equal(result.tier, Tier.STANDARD);
  });

  it("does NOT classify git ops as LOW", () => {
    const result = classify("git commit", "budget");
    assert.equal(result.tier, Tier.STANDARD);
  });

  it("classifies complex prompts as HIGH with strong Opus recommendation", () => {
    const result = classify("architect a new auth system across the codebase", "budget");
    assert.equal(result.tier, Tier.HIGH);
    assert.ok(result.message?.includes("Strongly recommend"));
    assert.ok(result.message?.includes("/model opus"));
  });

  it("classifies planning prompts as HIGH", () => {
    const result = classify("create a migration plan for the database", "budget");
    assert.equal(result.tier, Tier.HIGH);
  });
});
