import { describe, expect, it } from "vitest";
import {
  languageFilterOptions,
  matchesLanguage,
  matchesValue,
  matchesYear,
  yearOptions,
} from "./filters";
import { getData } from "./data";

describe("filters (D-18)", () => {
  it("All (null) matches everything", () => {
    expect(matchesValue("active", null)).toBe(true);
    expect(matchesLanguage("it", null)).toBe(true);
    expect(matchesYear("2026-01-01", null)).toBe(true);
  });

  it("matches status, type and theme by value", () => {
    expect(matchesValue("active", "active")).toBe(true);
    expect(matchesValue("planned", "active")).toBe(false);
  });

  it('shows "both" under English and under Italian', () => {
    expect(matchesLanguage("both", "en")).toBe(true);
    expect(matchesLanguage("both", "it")).toBe(true);
    expect(matchesLanguage("en", "it")).toBe(false);
    expect(matchesLanguage("it", "en")).toBe(false);
  });

  it("takes the year from the date", () => {
    expect(matchesYear("2025-12-31", "2025")).toBe(true);
    expect(matchesYear("2026-01-01", "2025")).toBe(false);
  });

  it('has no "both" option in the language filter', () => {
    for (const lang of ["en", "it"] as const) {
      const options = languageFilterOptions(
        getData(lang, "site").filters.language.options,
      );
      expect(options.map((o) => o.value)).toEqual(["en", "it"]);
    }
  });

  it("builds the year options in the given order", () => {
    expect(yearOptions([2026, 2025])).toEqual([
      { value: "2026", label: "2026" },
      { value: "2025", label: "2025" },
    ]);
  });
});
