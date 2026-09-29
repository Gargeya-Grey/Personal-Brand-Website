/** The owner's gate mark, adapted from public/Mark-light.svg for theme-aware use. */
export function EdudojoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 150 120" fill="none" aria-hidden="true">
      <path d="M25 15H35L30 120H15L25 15Z" fill="currentColor" />
      <path d="M40 115V78.8095H76.0298V31.7619H111V20" stroke="currentColor" strokeWidth="10" />
      <path d="M115 15H125L135 120H120L115 15Z" fill="currentColor" />
      <path d="M10 40H140V52H10Z M0 0Q75 10 150 0V15Q75 25 0 15Z" fill="currentColor" />
    </svg>
  );
}
