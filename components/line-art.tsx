type Motif = "orbits" | "routes" | "contours" | "pages";

export function LineArt({ motif, className }: { motif: Motif; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 540 360" fill="none" aria-hidden="true" focusable="false">
      {motif === "orbits" && (
        <g stroke="currentColor">
          {[0, 26, 52, 78, 104, 130, 156].map((angle) => (
            <ellipse key={angle} cx="270" cy="180" rx="156" ry="66" transform={"rotate(" + angle + " 270 180)"} />
          ))}
          <circle cx="270" cy="180" r="156" opacity=".45" strokeDasharray="2 5" />
          <circle cx="270" cy="180" r="5" fill="currentColor" stroke="none" />
          <circle cx="414" cy="130" r="4" fill="currentColor" stroke="none" />
          <path d="M270 10v14m-7-7h14M97 180h-14m7-7v14M444 180h14m-7-7v14M270 336v14m-7-7h14" />
        </g>
      )}
      {motif === "routes" && (
        <g stroke="currentColor">
          {Array.from({ length: 11 }, (_, index) => (
            <path className="line-art-trace" pathLength="1" key={index} transform={"translate(0 " + ((index - 5) * 13) + ")"} d="M-20 263C64 263 109 268 159 223 213 174 190 119 265 122 343 125 334 221 405 210 462 201 459 99 557 93" />
          ))}
          <circle cx="158" cy="223" r="6" fill="currentColor" stroke="none" />
          <circle cx="264" cy="122" r="6" fill="currentColor" stroke="none" />
          <circle cx="405" cy="210" r="6" fill="currentColor" stroke="none" />
        </g>
      )}
      {motif === "contours" && (
        <g stroke="currentColor">
          {Array.from({ length: 16 }, (_, index) => (
            <path key={index} transform={"translate(" + (index * 6) + " " + (index * -3) + ")"} d="M-58 354c90-15 89-58 175-111 106-65 192-37 230-113 43-88-10-107 26-177" />
          ))}
          <circle cx="207" cy="224" r="5" fill="currentColor" stroke="none" />
          <circle cx="360" cy="92" r="4" fill="currentColor" stroke="none" />
        </g>
      )}
      {motif === "pages" && (
        <g stroke="currentColor">
          {Array.from({ length: 12 }, (_, index) => (
            <path key={index} transform={"translate(" + (index * 5) + " " + (index * -8) + ")"} d="m66 213 171-93c11-6 23-6 33 0l171 93-171 94c-11 6-23 6-33 0L66 213Z" />
          ))}
          <circle cx="300" cy="233" r="5" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}
