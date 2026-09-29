import type { ComponentType } from 'react';
import type { CoverSceneName } from '@/lib/project-cover';
import { Approval, GlassPanel, Ground, type CoverSceneProps } from './primitives';

function Voice(props: CoverSceneProps) {
  return (
    <>
      <Ground width={206} />
      <g transform="translate(115 63) skewY(-8)">
        <GlassPanel {...props} width={410} height={166} radius={28}>
          {[18, 35, 61, 90, 120, 86, 48, 73, 42, 20].map((height, index) => (
            <rect
              key={index}
              x={27 + index * 15}
              y={83 - height / 2}
              width="7"
              height={height}
              rx="3.5"
              fill="var(--cover-accent)"
              opacity={0.45 + index * 0.04}
            />
          ))}
          <path
            d="M207 45H362M207 69H332M207 93H353M207 117H295"
            stroke="var(--cover-ink)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".55"
          />
          <path d="M309 106V129" stroke="var(--cover-accent)" strokeWidth="3" />
        </GlassPanel>
      </g>
      <Approval x={500} y={65} />
    </>
  );
}

function Memory(props: CoverSceneProps) {
  return (
    <>
      <Ground />
      {[0, 1, 2].map((layer) => (
        <g key={layer} transform={`translate(${155 + layer * 27} ${116 - layer * 38}) skewY(-9)`}>
          <GlassPanel {...props} width={270} height={140}>
            <path
              d="M25 31H123M25 55H235M25 73H213M25 91H178"
              stroke="var(--cover-ink)"
              strokeWidth={layer === 2 ? 4 : 2}
              strokeLinecap="round"
              opacity=".4"
            />
            <Approval x={232} y={112} />
          </GlassPanel>
        </g>
      ))}
      <path
        d="M147 138H112V80H176M493 173H531V225H486"
        stroke="var(--cover-accent)"
        strokeDasharray="4 6"
      />
    </>
  );
}

function Overlap(props: CoverSceneProps) {
  return (
    <>
      <Ground />
      <g transform="translate(156 57) skewY(-8)">
        <GlassPanel {...props} width={325} height={188}>
          <path
            d="M20 26H305M20 162H305M37 15V174M289 15V174"
            stroke="var(--cover-ink)"
            opacity=".15"
          />
          <rect
            x="55"
            y="35"
            width="143"
            height="108"
            rx="4"
            fill="var(--cover-highlight)"
            fillOpacity=".5"
            stroke="var(--cover-accent)"
            strokeWidth="3"
          />
          <rect
            x="115"
            y="64"
            width="143"
            height="108"
            rx="4"
            fill="var(--cover-accent)"
            fillOpacity=".18"
            stroke="var(--cover-ink)"
            strokeWidth="3"
          />
          <path d="M115 64H198V143H115Z" fill="var(--cover-accent)" opacity=".32" />
          <path
            d="M124 76H189M124 90H189M124 104H189M124 118H189M124 132H189"
            stroke="var(--cover-highlight)"
            strokeWidth="2"
          />
        </GlassPanel>
      </g>
    </>
  );
}

function Ideas(props: CoverSceneProps) {
  return (
    <>
      <Ground width={195} />
      <g transform="translate(112 80) rotate(-12 82 85)">
        <GlassPanel {...props} width={170} height={170}>
          <circle cx="85" cy="58" r="22" stroke="var(--cover-accent)" strokeWidth="3" />
          <path
            d="M42 120Q42 84 85 84Q128 84 128 120M48 140H122"
            stroke="var(--cover-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </GlassPanel>
      </g>
      <g transform="translate(360 57) rotate(10 82 85)">
        <GlassPanel {...props} width={170} height={170}>
          <rect
            x="36"
            y="36"
            width="98"
            height="98"
            rx="8"
            stroke="var(--cover-accent)"
            strokeWidth="3"
          />
          <path
            d="M61 60H109M61 78H109M61 96H88M109 110V122M103 116H115"
            stroke="var(--cover-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </GlassPanel>
      </g>
      <circle cx="319" cy="143" r="24" fill="var(--cover-highlight)" stroke="var(--cover-accent)" />
      <path d="M308 143H330M319 132V154" stroke="var(--cover-accent)" strokeWidth="3" />
    </>
  );
}

function Data(props: CoverSceneProps) {
  return (
    <>
      <Ground width={205} />
      <g transform="translate(88 76) skewY(-8)">
        <GlassPanel {...props} width={190} height={157}>
          {[0, 1, 2, 3].map((row) => (
            <g key={row} opacity={row === 2 ? 0.35 : 0.7}>
              <path
                d={`M22 ${32 + row * 29}H${row % 2 ? 143 : 166}`}
                stroke="var(--cover-ink)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle
                cx={row % 2 ? 158 : 173}
                cy={32 + row * 29}
                r="4"
                fill="var(--cover-accent)"
              />
            </g>
          ))}
        </GlassPanel>
      </g>
      <path d="M297 149H343M334 140L343 149L334 158" stroke="var(--cover-accent)" strokeWidth="3" />
      <g transform="translate(364 53) skewY(-8)">
        <GlassPanel {...props} width={190} height={157}>
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <path
                d={`M23 ${37 + row * 37}H132`}
                stroke="var(--cover-ink)"
                strokeWidth="5"
                strokeLinecap="round"
                opacity=".5"
              />
              <Approval x={156} y={37 + row * 37} />
            </g>
          ))}
        </GlassPanel>
      </g>
    </>
  );
}

function Publishing(props: CoverSceneProps) {
  return (
    <>
      <Ground width={205} />
      <g transform="translate(112 65) skewY(-7)">
        <GlassPanel {...props} width={410} height={185}>
          <path d="M0 29H410" stroke="var(--cover-ink)" opacity=".25" />
          {[19, 31, 43].map((x) => (
            <circle key={x} cx={x} cy="15" r="3" fill="var(--cover-accent)" />
          ))}
          <rect
            x="25"
            y="49"
            width="103"
            height="111"
            rx="4"
            fill="var(--cover-accent)"
            opacity=".2"
          />
          <path
            d="M49 89L37 100L49 111M102 89L114 100L102 111M85 81L65 121"
            stroke="var(--cover-accent)"
            strokeWidth="3"
          />
          <path
            d="M153 60H347M153 76H315M153 104H230M153 119H253M153 134H233"
            stroke="var(--cover-ink)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".5"
          />
          <rect
            x="282"
            y="99"
            width="102"
            height="60"
            rx="5"
            fill="var(--cover-highlight)"
            fillOpacity=".7"
            stroke="var(--cover-accent)"
          />
          <path
            d="M320 130H346M337 121L346 130L337 139"
            stroke="var(--cover-accent)"
            strokeWidth="3"
          />
        </GlassPanel>
      </g>
    </>
  );
}

/** Add a deliberately composed scene here; a new project must choose one explicitly. */
export const coverScenes: Record<CoverSceneName, ComponentType<CoverSceneProps>> = {
  voice: Voice,
  memory: Memory,
  overlap: Overlap,
  ideas: Ideas,
  data: Data,
  publishing: Publishing,
};
