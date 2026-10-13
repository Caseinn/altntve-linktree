export function Emblem({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      viewBox="0 0 24 24"
    >
      <ellipse cx="12" cy="12" rx="10" ry="4.5" />
      <ellipse cx="12" cy="12" rx="4.5" ry="10" />
      <circle cx="12" cy="12" fill="currentColor" r="1" stroke="none" />
    </svg>
  )
}
