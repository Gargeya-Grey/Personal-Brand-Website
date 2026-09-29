import Image from 'next/image';
import { useId } from 'react';

/** Editorial cover artwork, not product screenshots. */
export function WorkVisual({ id }: { id: string }) {
  const unique = useId();
  const glass = unique + '-glass';
  const edge = unique + '-edge';
  return (
    <div className={`work-visual project-cover visual-${id}`} aria-hidden="true">
      {id === 'edudojo' ? (
        <Image
          src="/edudojo.png"
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 650px"
          className="edudojo-cover-image"
        />
      ) : id === 'odicto' || id === 'twinaatma' ? (
        <>
          <svg className="project-cover-drawing" viewBox="0 0 640 320" fill="none">
            <defs>
              <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#eefbf9" stopOpacity=".94" />
                <stop offset=".48" stopColor="#a1cecd" stopOpacity=".4" />
                <stop offset="1" stopColor="#739dae" stopOpacity=".12" />
              </linearGradient>
              <linearGradient id={edge} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#f1fff8" />
                <stop offset=".5" stopColor="#76aeb5" />
                <stop offset="1" stopColor="#38566b" />
              </linearGradient>
            </defs>
            {id === 'odicto' ? (
              <>
                <ellipse cx="320" cy="263" rx="206" ry="21" fill="#102633" opacity=".1" />
                <g transform="translate(115 63) skewY(-8)">
                  <rect x="9" y="13" width="410" height="166" rx="28" fill="#36566b" opacity=".2" />
                  <rect
                    width="410"
                    height="166"
                    rx="28"
                    fill={`url(#${glass})`}
                    stroke={`url(#${edge})`}
                    strokeWidth="2"
                  />
                  {[18, 35, 61, 90, 120, 86, 48, 73, 42, 20].map((height, index) => (
                    <rect
                      key={index}
                      x={27 + index * 15}
                      y={83 - height / 2}
                      width="7"
                      height={height}
                      rx="3.5"
                      fill="#267f79"
                      opacity={0.45 + index * 0.04}
                    />
                  ))}
                  <path
                    d="M207 45H362M207 69H332M207 93H353M207 117H295"
                    stroke="#38566b"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity=".55"
                  />
                  <path d="M309 106V129" stroke="#187e6b" strokeWidth="3" />
                  <path d="M19 15H382" stroke="#f1fff8" strokeOpacity=".7" />
                </g>
                <circle cx="499" cy="64" r="24" fill="#e9f5ef" stroke="#7facaa" />
                <path d="M493 64L498 69L507 58" stroke="#267f79" strokeWidth="2" />
              </>
            ) : (
              <>
                <ellipse cx="329" cy="265" rx="171" ry="23" fill="#142936" opacity=".12" />
                {[0, 1, 2].map((layer) => (
                  <g
                    key={layer}
                    transform={`translate(${155 + layer * 27} ${116 - layer * 38}) skewY(-9)`}
                  >
                    <rect
                      x="5"
                      y="8"
                      width="270"
                      height="140"
                      rx="13"
                      fill="#38566b"
                      opacity=".2"
                    />
                    <rect
                      width="270"
                      height="140"
                      rx="13"
                      fill={`url(#${glass})`}
                      stroke={`url(#${edge})`}
                      strokeWidth="2"
                    />
                    <path
                      d="M25 31H123M25 55H235M25 73H213M25 91H178"
                      stroke="#38566b"
                      strokeWidth={layer === 2 ? 4 : 2}
                      strokeLinecap="round"
                      opacity=".4"
                    />
                    <circle cx="232" cy="112" r="14" fill="#d2eee1" stroke="#62a596" />
                    <path d="M225 112L230 117L239 107" stroke="#267f79" strokeWidth="2" />
                  </g>
                ))}
                <path
                  d="M147 138H112V80H176M493 173H531V225H486"
                  stroke="#648b91"
                  strokeDasharray="4 6"
                />
                <circle cx="112" cy="80" r="5" fill="#d2eee1" stroke="#648b91" />
              </>
            )}
          </svg>
          <div className="project-cover-caption">
            <span>{id === 'odicto' ? 'Voice → text' : 'Context → continuity'}</span>
            <span>{id === 'odicto' ? 'Desktop + Android' : 'Memory, with your approval'}</span>
          </div>
        </>
      ) : (
        <div className="question-path">
          <span>
            {id === 'dataclean' ? 'Inspect → change → check' : 'Code → publish → explore'}
          </span>
          <strong>{id === 'dataclean' ? 'A cleaner dataset.' : 'A place for the work.'}</strong>
        </div>
      )}
    </div>
  );
}
