/** The red arrow of cards and text links. Decorative: the link text carries the meaning. */
export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 text-accent ${className}`.trim()}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
