/** Infinite mono spec ticker — pure CSS, pauses under reduced motion. */
const SPECS = [
  "61MP full-frame BSI",
  "ƒ/1.7 ASPH. prime",
  "9-blade iris",
  "6-stop IBIS",
  "8K RAW",
  "282 g",
  "IP54 sealed",
  "420 shots",
  "0.28 m min focus",
  "UHS-II + 512 GB",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {SPECS.map((spec) => (
        <span
          key={spec}
          className="flex items-center gap-6 pr-6 md:gap-10 md:pr-10"
        >
          <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-fog">
            {spec}
          </span>
          <span aria-hidden="true" className="text-[8px] text-signal">
            ◆
          </span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div
      className="marquee border-y border-hairline bg-surface-1/40 py-4"
      aria-hidden="true"
    >
      <div className="marquee-track">
        <Row />
        <Row />
        <Row />
        <Row />
      </div>
    </div>
  );
}
