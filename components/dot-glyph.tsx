import type { CSSProperties } from 'react';
import { GLYPH_VIEWBOX, glyphLayers, type GlyphName } from '@/lib/stipple';
import './dot-glyph.css';

/*
 * A small figure drawn only with dots: the stippled signature shared with edudojo.ai. A server
 * component on purpose: the dots are computed from a fixed seed (name and size), so the server and
 * the client write the same SVG and nothing needs hydration. At rest it is fully assembled and still.
 * Inside an ancestor with the class `glyph-host`, a hover or keyboard focus plays a one-time gather
 * (see dot-glyph.css); under reduced motion nothing moves.
 *
 * Every dot is a zero-length line with round caps, so a whole draw-order slot of one tone is a single
 * <path>. Dot size is the same in CSS px at every glyph size; a larger glyph gets more dots, not bigger ones.
 *
 * Colour: the dots use `currentColor` (the caller sets it; the default is the page ink), plus a few
 * accent dots in `--leaf`.
 */
export function DotGlyph({
  name,
  size = 64,
  className,
  label,
}: {
  name: GlyphName;
  /** CSS px, square. The dot count follows the area (120 to 1100 dots). */
  size?: number;
  className?: string;
  /** Names the glyph for screen readers. Without it the glyph is decorative and hidden from them. */
  label?: string;
}) {
  const layers = glyphLayers(name, size);
  const classes = className ? `dot-glyph ${className}` : 'dot-glyph';
  const labelled = label ? ({ role: 'img', 'aria-label': label } as const) : ({ 'aria-hidden': true } as const);
  return (
    <svg
      className={classes}
      viewBox={`0 0 ${GLYPH_VIEWBOX} ${GLYPH_VIEWBOX}`}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      focusable="false"
      {...labelled}
    >
      {layers.map((layer) => (
        <g
          key={`${layer.leaf ? 'leaf' : 'ink'}${layer.level}`}
          className={layer.leaf ? 'dg-leaf' : undefined}
          strokeWidth={layer.width}
          strokeOpacity={layer.opacity}
        >
          {layer.paths.map((path) => (
            <path key={path.order} d={path.d} style={{ '--o': path.order, '--x': path.x, '--y': path.y } as CSSProperties} />
          ))}
        </g>
      ))}
    </svg>
  );
}
