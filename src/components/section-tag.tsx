"use client";

/**
 * Small mono library tag that labels which motion library powers a section —
 * and lets you toggle that section's motion on/off to see the difference.
 */
export function SectionTag({
  lib,
  sub,
  enabled,
  onToggle,
  className = "",
}: {
  lib: string;
  sub?: string;
  enabled?: boolean;
  onToggle?: (next: boolean) => void;
  className?: string;
}) {
  const interactive = typeof onToggle === "function" && typeof enabled === "boolean";
  const on = enabled ?? true;

  const inner = (
    <>
      <span className="glow-dot" aria-hidden="true" data-enabled={on} />
      <span className="text-cream/90">{lib}</span>
      {sub ? <span className="text-fog/70">· {sub}</span> : null}
      {interactive ? (
        <span className="ml-1 flex items-center gap-1.5 border-l border-hairline pl-2.5 text-[9px]">
          <span
            aria-hidden="true"
            className={`inline-block h-[14px] w-[26px] rounded-full border border-hairline transition-colors duration-300 ${
              on ? "border-signal/50 bg-signal/20" : "bg-white/5"
            }`}
          >
            <span
              className={`mt-[2px] ml-[2px] block h-[8px] w-[8px] rounded-full transition-all duration-300 ${
                on ? "ml-[14px] bg-signal" : "bg-fog/60"
              }`}
            />
          </span>
          <span className={on ? "text-signal/90" : "text-fog/60"}>
            {on ? "MOTION ON" : "MOTION OFF"}
          </span>
        </span>
      ) : null}
    </>
  );

  if (!interactive) {
    return <span className={`mono-chip ${className}`}>{inner}</span>;
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      className={`mono-chip cursor-pointer transition-colors duration-300 hover:border-white/20 hover:text-cream ${className}`}
      onClick={() => onToggle!(!on)}
    >
      {inner}
    </button>
  );
}
