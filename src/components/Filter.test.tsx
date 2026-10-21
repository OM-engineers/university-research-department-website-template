import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { Filter } from "./Filter";
import { getData } from "../lib/data";
import { LangContext } from "../lib/lang";
import {
  languageFilterOptions,
  matchesLanguage,
  matchesValue,
  matchesYear,
  yearOptions,
} from "../lib/filters";
import type { NewsItem, NewsLanguage, NewsType, Status } from "../lib/types";

const { filters } = getData("en", "site");

const visibleOptions = (select: HTMLSelectElement) =>
  [...select.options].filter((o) => !o.hidden).map((o) => o.textContent);

afterEach(cleanup);

describe("Filter as pills", () => {
  function renderPills(value: Status | null = null) {
    const onChange = vi.fn();
    render(
      <Filter
        variant="pills"
        label={filters.status.label}
        options={filters.status.options}
        value={value}
        onChange={onChange}
      />,
    );
    return { onChange, group: screen.getByRole("group", { name: "Status" }) };
  }

  it("shows All and the four statuses of D-18", () => {
    const { group } = renderPills();
    const labels = within(group)
      .getAllByRole("button")
      .map((b) => b.textContent);
    expect(labels).toEqual([
      "All",
      "Planned",
      "Active",
      "Completed",
      "Cancelled",
    ]);
  });

  it("marks All when nothing is selected", () => {
    const { group } = renderPills();
    expect(
      within(group)
        .getByRole("button", { name: "All" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      within(group)
        .getByRole("button", { name: "Active" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("marks the selected status", () => {
    const { group } = renderPills("completed");
    const pressed = within(group)
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed.map((b) => b.textContent)).toEqual(["Completed"]);
  });

  it("sends the value, and null for All", () => {
    const { group, onChange } = renderPills("active");
    fireEvent.click(within(group).getByRole("button", { name: "Planned" }));
    expect(onChange).toHaveBeenLastCalledWith("planned");
    fireEvent.click(within(group).getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe("Filter as a dropdown", () => {
  function renderDropdown(value: NewsType | null = null) {
    const onChange = vi.fn();
    render(
      <Filter
        variant="dropdown"
        label={filters.type.label}
        options={filters.type.options}
        value={value}
        onChange={onChange}
      />,
    );
    return {
      onChange,
      select: screen.getByRole<HTMLSelectElement>("combobox", { name: "Type" }),
    };
  }

  it("shows the filter name in the closed box and All, News, Events in the list", () => {
    const { select } = renderDropdown();
    expect(select.selectedOptions[0].textContent).toBe("Type");
    expect(select.selectedOptions[0].hidden).toBe(true);
    expect(visibleOptions(select)).toEqual(["All", "News", "Events"]);
  });

  it("shows the selected value", () => {
    expect(renderDropdown("event").select.selectedOptions[0].textContent).toBe(
      "Events",
    );
  });

  it("sends the value, and null for All", () => {
    const { select, onChange } = renderDropdown("news");
    fireEvent.change(select, { target: { value: "event" } });
    expect(onChange).toHaveBeenLastCalledWith("event");
    fireEvent.change(select, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("offers only English and Italian for the language (D-18)", () => {
    render(
      <Filter
        variant="dropdown"
        label={filters.language.label}
        options={languageFilterOptions(filters.language.options)}
        value={null}
        onChange={() => {}}
      />,
    );
    const select = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Language",
    });
    expect(visibleOptions(select)).toEqual(["All", "English", "Italian"]);
  });

  it("uses the Italian labels, All included", () => {
    const it = getData("it", "site").filters;
    render(
      <LangContext.Provider value={{ lang: "it", setLang: () => {} }}>
        <Filter
          variant="pills"
          label={it.status.label}
          options={it.status.options}
          value={null}
          onChange={() => {}}
        />
        <Filter
          variant="dropdown"
          label={it.type.label}
          options={it.type.options}
          value={null}
          onChange={() => {}}
        />
      </LangContext.Provider>,
    );
    const group = screen.getByRole("group", { name: "Stato" });
    expect(within(group).getByRole("button", { name: "Tutti" })).toBeTruthy();
    expect(
      visibleOptions(screen.getByRole("combobox", { name: "Tipo" }))[0],
    ).toBe("Tutti");
  });
});

describe("Filters on a list", () => {
  const items = [
    { id: "news-001", type: "news", date: "2026-03-01", language: "en" },
    { id: "news-002", type: "event", date: "2026-05-10", language: "it" },
    { id: "news-003", type: "event", date: "2025-11-20", language: "both" },
  ] as NewsItem[];

  function NewsList() {
    const [type, setType] = useState<NewsType | null>(null);
    const [year, setYear] = useState<string | null>(null);
    const [language, setLanguage] = useState<NewsLanguage | null>(null);
    const shown = items.filter(
      (n) =>
        matchesValue(n.type, type) &&
        matchesYear(n.date, year) &&
        matchesLanguage(n.language, language),
    );
    return (
      <>
        <Filter
          variant="dropdown"
          label="Type"
          options={filters.type.options}
          value={type}
          onChange={setType}
        />
        <Filter
          variant="dropdown"
          label="Year"
          options={yearOptions([2026, 2025])}
          value={year}
          onChange={setYear}
        />
        <Filter
          variant="dropdown"
          label="Language"
          options={languageFilterOptions(filters.language.options)}
          value={language}
          onChange={setLanguage}
        />
        <ul>
          {shown.map((n) => (
            <li key={n.id}>{n.id}</li>
          ))}
        </ul>
      </>
    );
  }

  const shownIds = () =>
    screen.queryAllByRole("listitem").map((li) => li.textContent);
  const choose = (name: string, value: string) =>
    fireEvent.change(screen.getByRole("combobox", { name }), {
      target: { value },
    });

  it("combines the filters and goes back to All", () => {
    render(<NewsList />);
    expect(shownIds()).toEqual(["news-001", "news-002", "news-003"]);

    choose("Type", "event");
    expect(shownIds()).toEqual(["news-002", "news-003"]);

    choose("Year", "2026");
    expect(shownIds()).toEqual(["news-002"]);

    choose("Language", "en");
    expect(shownIds()).toEqual([]);

    choose("Type", "");
    choose("Year", "");
    expect(shownIds()).toEqual(["news-001", "news-003"]);
  });

  it("shows an item in both languages under English and under Italian", () => {
    render(<NewsList />);
    choose("Language", "en");
    expect(shownIds()).toContain("news-003");
    choose("Language", "it");
    expect(shownIds()).toEqual(["news-002", "news-003"]);
  });
});
