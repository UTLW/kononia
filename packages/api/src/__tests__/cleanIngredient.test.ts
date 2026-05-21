import { describe, it, expect } from "vitest";

const INSTRUCTION_WORDS = /\b(for the|in a|to taste|optional|as needed|divided|such as|like|or until|until|enough)\b/i;

function cleanIngredient(raw: string): string[] {
  return raw
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !INSTRUCTION_WORDS.test(s));
}

describe("cleanIngredient", () => {
  it("splits multi-line ingredients into array", () => {
    const result = cleanIngredient("olive oil\nsalt\npepper");
    expect(result).toEqual(["olive oil", "salt", "pepper"]);
  });

  it("trims whitespace from each line", () => {
    const result = cleanIngredient("  olive oil  \n  salt  ");
    expect(result).toEqual(["olive oil", "salt"]);
  });

  it("filters out empty lines", () => {
    const result = cleanIngredient("olive oil\n\n\nsalt");
    expect(result).toEqual(["olive oil", "salt"]);
  });

  it("filters out lines with instruction words", () => {
    const result = cleanIngredient("olive oil\nfor the dressing\nsalt\nto taste");
    expect(result).toEqual(["olive oil", "salt"]);
  });

  it("filters lines with 'optional'", () => {
    const result = cleanIngredient("cheese\noptional: garnish\nparsley");
    expect(result).toEqual(["cheese", "parsley"]);
  });

  it("filters lines with 'as needed'", () => {
    const result = cleanIngredient("flour\nwater as needed\nsalt");
    expect(result).toEqual(["flour", "salt"]);
  });

  it("filters lines with 'or until'", () => {
    const result = cleanIngredient("chicken\ncook until golden\nspices");
    expect(result).toEqual(["chicken", "spices"]);
  });

  it("returns empty array for empty input", () => {
    const result = cleanIngredient("");
    expect(result).toEqual([]);
  });

  it("returns empty array for only instruction words", () => {
    const result = cleanIngredient("to taste\noptional\nas needed");
    expect(result).toEqual([]);
  });

  it("preserves mixed case instruction words", () => {
    const result = cleanIngredient("Olive Oil\nFor The Dressing\nSalt");
    expect(result).toEqual(["Olive Oil", "Salt"]);
  });

  it("handles single line input", () => {
    const result = cleanIngredient("olive oil");
    expect(result).toEqual(["olive oil"]);
  });
});
