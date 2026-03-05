import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveProfile } from "../src/config.ts";

describe("resolveProfile", () => {
  it("returns 'balanced' when no config exists", () => {
    const profile = resolveProfile("/nonexistent/path");
    assert.equal(profile, "balanced");
  });

  it("returns 'balanced' when cwd is undefined", () => {
    const profile = resolveProfile(undefined);
    assert.equal(profile, "balanced");
  });

  it("returns 'balanced' for invalid GSD profile value", () => {
    // When .planning/config.json has an invalid profile, should fallback
    const profile = resolveProfile("/tmp/no-such-project");
    assert.equal(profile, "balanced");
  });
});
