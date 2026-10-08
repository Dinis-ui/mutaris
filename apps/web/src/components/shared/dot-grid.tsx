/** Purely decorative dot-matrix texture — echoes the Doto accent font. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="mutaris-dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
        <radialGradient id="mutaris-dot-fade" cx="50%" cy="0%" r="85%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="mutaris-dot-mask">
          <rect width="100%" height="100%" fill="url(#mutaris-dot-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#mutaris-dot-grid)"
        mask="url(#mutaris-dot-mask)"
      />
    </svg>
  );
}
