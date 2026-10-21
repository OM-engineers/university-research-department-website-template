import type { ReactNode } from 'react';

export type DetailItem = { label: string; value: ReactNode };

/** Grey side panel of the detail pages: a heading and a list of label / value pairs. `id` names the heading for `aria-labelledby`. */
export function DetailsPanel({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: DetailItem[];
}) {
  return (
    <aside
      aria-labelledby={id}
      className="self-start rounded-card border border-border bg-surface p-6"
    >
      <h2 id={id} className="text-xl leading-[1.2] font-semibold">
        {title}
      </h2>
      <dl className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm text-text-muted">{item.label}</dt>
            <dd className="font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
