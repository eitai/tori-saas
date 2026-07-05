/**
 * "תורי" wordmark — a small indigo app-mark (a "T"/clock crossbar with a live
 * dot) + the Rubik wordmark. Pure SVG/type, no image asset.
 */
export default function Logo({
  className = "",
  tone = "ink",
  markSize = 30,
}: {
  className?: string;
  tone?: "ink" | "light";
  markSize?: number;
}) {
  const text = tone === "light" ? "text-white" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="15" fill="#4F46E5" />
        <path
          d="M20 20h24M32 20v24"
          stroke="#fff"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="32" cy="44" r="3.6" fill="#34D399" />
      </svg>
      <span
        className={`font-heading text-2xl font-extrabold tracking-tight ${text}`}
      >
        תורי
      </span>
    </span>
  );
}
