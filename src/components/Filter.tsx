import { useId } from "react";
import { useData } from "../lib/lang";
import type { FilterOption } from "../lib/types";

export type FilterProps<V extends string> = {
  /** pills: project status | dropdown: news type, year and language */
  variant: "pills" | "dropdown";
  label: string;
  /** The options after All */
  options: FilterOption<V>[];
  /** Selected value, null = All */
  value: V | null;
  onChange: (value: V | null) => void;
};

/**
 * K-06: one filter of a list page, as pills or as a dropdown.
 * In-page filter, no URL change: the page keeps the selected value and filters
 * its items with the helpers in lib/filters.ts.
 * Example usage: <Filter variant="pills" label={filters.status.label} options={filters.status.options} value={status} onChange={setStatus} />
 */
export function Filter<V extends string>(props: FilterProps<V>) {
  return props.variant === "pills" ? (
    <Pills {...props} />
  ) : (
    <Dropdown {...props} />
  );
}

function Pills<V extends string>({
  label,
  options,
  value,
  onChange,
}: FilterProps<V>) {
  const all = useData("site").filters.all;
  const pills: { value: V | null; label: string }[] = [
    { value: null, label: all },
    ...options,
  ];
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {pills.map((pill) => {
        const selected = pill.value === value;
        return (
          <button
            key={pill.value ?? ""}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(pill.value)}
            className={`min-h-8 rounded-full border px-4 py-1 text-sm transition-colors ${
              selected
                ? "border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover"
                : "border-border bg-white hover:border-accent hover:text-accent"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

function Dropdown<V extends string>({
  label,
  options,
  value,
  onChange,
}: FilterProps<V>) {
  const id = useId();
  const all = useData("site").filters.all;
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ALL}
        onChange={(e) =>
          onChange(e.target.value === ALL ? null : (e.target.value as V))
        }
        className={`min-h-10 w-full min-w-36 cursor-pointer appearance-none rounded-md border bg-white py-2 pl-3.5 pr-9 text-sm hover:border-accent ${
          value === null ? "border-border" : "border-accent"
        }`}
      >
        {/* Same value as All: React selects this first one, so the closed box shows the filter name.
            Browsers that ignore `hidden` list it, and picking it also means All. */}
        <option value={ALL} hidden>
          {label}
        </option>
        <option value={ALL}>{all}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        width={10}
        height={10}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
      >
        <path d="M1 3h14L8 13z" />
      </svg>
    </div>
  );
}

/** <option> value of All. Filter values are never empty strings. */
const ALL = "";
