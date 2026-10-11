'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Drama,
  Mountain,
  ScanEye,
  GraduationCap,
  MessagesSquare,
  Sprout,
} from 'lucide-react';
import { ChapterHeading } from './chapter-morph';
import { journeyChapters } from './journey-chapters';
import './journey.css';

const chapterIcons = [Drama, Mountain, ScanEye, GraduationCap, MessagesSquare, Sprout];
const chapterCount = journeyChapters.length;
const routePath =
  'M100 38C160 0 240 0 300 38S440 76 500 38C590 -10 590 210 500 158S360 112 300 158S160 204 100 158';
// Where each stop sits on the route, in the route SVG's viewBox units (matches the stops grid).
const routeStopPoints = [
  [100, 38],
  [300, 38],
  [500, 38],
  [500, 158],
  [300, 158],
  [100, 158],
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Finds how far along the route (0 to 1) each stop lies, walking forward so no stop is matched twice. */
function measureRouteStops(route: SVGPathElement) {
  const totalLength = route.getTotalLength();
  const sampleCount = 600;
  let searchFrom = 0;
  return routeStopPoints.map(([stopX, stopY]) => {
    let nearestSample = searchFrom;
    let nearestDistance = Infinity;
    for (let sample = searchFrom; sample <= sampleCount; sample += 1) {
      const point = route.getPointAtLength((totalLength * sample) / sampleCount);
      const distance = Math.hypot(point.x - stopX, point.y - stopY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSample = sample;
      }
    }
    searchFrom = nearestSample;
    return nearestSample / sampleCount;
  });
}

function ChapterScene({ chapter }: { chapter: number }) {
  return (
    <svg
      viewBox="0 0 240 190"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {chapter === 0 && (
        <>
          <path d="M25 160H215M40 160V30H200V160M40 45H200" />
          <path
            className="scene-wash"
            d="M40 30H95Q96 95 45 115L60 160H40ZM200 30H145Q144 95 195 115L180 160H200Z"
          />
          <path d="M120 58L89 144H151Z" strokeDasharray="4 5" />
          <ellipse cx="120" cy="148" rx="32" ry="7" />
        </>
      )}
      {chapter === 1 && (
        <>
          <circle cx="171" cy="40" r="16" className="scene-wash" />
          <path d="M14 140L76 48L125 119L157 70L226 140M58 74L76 82L88 67" />
          <path d="M24 152Q85 139 127 157T220 159M111 161V131H143V161M107 131L127 116L147 131M123 161V146H132V161" />
          <path d="M127 166Q174 177 147 185" strokeDasharray="4 5" />
        </>
      )}
      {chapter === 2 && (
        <>
          <path d="M53 38L151 26L168 156L70 168Z" className="scene-wash" />
          <path d="M76 49H186V169H76ZM91 66H148M91 76H171M91 143H171M91 153H148" />
          <rect x="97" y="92" width="53" height="34" rx="2" />
          <path d="M104 104L116 112L124 102L140 119M88 91V84H98M159 84H166V94M88 124V133H98M159 133H166V123" />
        </>
      )}
      {chapter === 3 && (
        <>
          <path d="M27 154H216M40 154V87H70V154M78 154V59H167V154M175 154V87H205V154M73 59L122 33L171 59M93 80H105V95H93ZM137 80H149V95H137ZM113 154V120Q122 107 131 120V154" />
          <path d="M88 108H104M139 108H155M49 104H61M184 104H196" />
          <path
            className="scene-wash"
            d="M18 167Q61 155 111 170Q154 155 211 167V177Q156 166 111 180Q62 167 18 177Z"
          />
        </>
      )}
      {chapter === 4 && (
        <>
          <path d="M26 127H214V139H26ZM47 139V171M193 139V171M77 58L91 94L105 58ZM91 94V116M79 116H103M146 75H170V115H146Z" />
          <path
            className="scene-wash"
            d="M27 21H115V47H65L51 59V47H27ZM139 35H215V64H198V76L184 64H139Z"
          />
          <path d="M41 33H99M153 48H201M30 178H208" />
        </>
      )}
      {chapter === 5 && (
        <>
          <path d="M40 43H200V141H40ZM25 153H215L203 166H37ZM53 57H187V127H53Z" />
          <path
            d="M120 118V79M120 96Q93 100 87 72Q114 72 120 96ZM120 86Q143 88 154 61Q125 62 120 86Z"
            className="scene-wash"
          />
          <path d="M84 28L79 18M159 28L164 18M120 20V10" />
        </>
      )}
    </svg>
  );
}

export function JourneyMap() {
  const [selected, setSelected] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGPathElement>(null);
  const selectedRef = useRef(0);
  const isPinnedRef = useRef(false);
  const redrawRef = useRef<(() => void) | null>(null);
  const chapter = journeyChapters[selected];
  const link = 'link' in chapter ? chapter.link : undefined;

  function selectChapter(next: number) {
    if (next === selectedRef.current) return;
    selectedRef.current = next;
    setSelected(next);
    setHasChanged(true);
  }

  /** Reads the pinned track: where the panel sticks and how much scroll each chapter owns. */
  function measureTrack() {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return null;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const trackRect = track.getBoundingClientRect();
    const step = (trackRect.height - stage.offsetHeight) / chapterCount;
    return { stickyTop, step, trackRect };
  }

  function goToChapter(index: number) {
    const measured = measureTrack();
    if (!isPinnedRef.current || !measured) {
      selectChapter(index);
      return;
    }
    // Aim at the middle of the chapter's span so rounding never lands on a neighbour.
    // The scroll listener then selects the chapter, so scroll and state stay one thing.
    const trackTop = measured.trackRect.top + window.scrollY;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: trackTop - measured.stickyTop + (index + 0.5) * measured.step,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    });
  }

  useEffect(() => {
    const route = routeRef.current;
    const reveal = revealRef.current;
    const stage = stageRef.current;
    if (!route || !reveal || !stage) return;
    const stops = measureRouteStops(route);
    const lastChapter = chapterCount - 1;
    let frame = 0;

    const drawRoute = (fraction: number) => {
      reveal.style.strokeDashoffset = String(1 - fraction);
    };

    const syncToScroll = () => {
      frame = 0;
      // The stylesheet decides whether the panel pins; ask it rather than repeat its media query.
      isPinnedRef.current = getComputedStyle(stage).position === 'sticky';
      if (!isPinnedRef.current) {
        drawRoute(stops[selectedRef.current]);
        return;
      }
      const measured = measureTrack();
      if (!measured) return;
      const position = clamp(
        (measured.stickyTop - measured.trackRect.top) / measured.step,
        0,
        chapterCount - 0.001,
      );
      const index = Math.floor(position);
      selectChapter(index);
      // The dotted line reaches stop n as chapter n begins and travels on toward stop n + 1.
      const from = stops[index];
      const to = stops[Math.min(index + 1, lastChapter)];
      drawRoute(from + (to - from) * (position - index));
    };

    const requestSync = () => {
      if (!frame) frame = requestAnimationFrame(syncToScroll);
    };

    // The click-through mode has no scroll to follow, so it redraws on selection through this hook.
    redrawRef.current = syncToScroll;
    syncToScroll();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    return () => {
      redrawRef.current = null;
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    redrawRef.current?.();
  }, [selected]);

  return (
    <section
      className="journey-atlas field-section"
      aria-labelledby="journey-title"
      style={{ '--journey-chapters': chapterCount } as CSSProperties}
    >
      <div className="journey-track" ref={trackRef}>
        <div className="journey-stage" ref={stageRef}>
          <div className="journey-panel">
            <header className="journey-atlas-heading">
              <h2 id="journey-title">A few unexpected turns.</h2>
              <p>
                I didn’t set out to work in AI. Follow the stops that brought me here. Choose any
                chapter.
              </p>
            </header>
            <nav className="journey-map-nav" aria-label="Chapters of my journey">
              <svg
                className="journey-route"
                viewBox="0 0 600 240"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <mask
                    id="journey-route-mask"
                    maskUnits="userSpaceOnUse"
                    x="-20"
                    y="-20"
                    width="640"
                    height="280"
                  >
                    <path
                      ref={revealRef}
                      className="journey-route-reveal"
                      d={routePath}
                      pathLength={1}
                    />
                  </mask>
                </defs>
                <path ref={routeRef} className="journey-route-base" d={routePath} />
                <path
                  className="journey-route-progress"
                  d={routePath}
                  mask="url(#journey-route-mask)"
                />
              </svg>
              <ol className="journey-stops">
                {journeyChapters.map((stop, index) => {
                  const Icon = chapterIcons[index];
                  return (
                    <li key={stop.scene}>
                      <button
                        type="button"
                        aria-current={selected === index ? 'step' : undefined}
                        data-passed={index < selected}
                        aria-controls="journey-chapter"
                        onClick={() => goToChapter(index)}
                        aria-label={`Chapter ${index + 1}: ${stop.label}`}
                      >
                        <span className="journey-stop-icon">
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <span>
                          <small aria-hidden="true">{index + 1}.</small> {stop.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
            <div className="journey-reader" data-changed={hasChanged}>
              <div key={`scene-${selected}`} className="journey-scene journey-slide">
                <ChapterScene chapter={selected} />
              </div>
              <article id="journey-chapter" aria-labelledby="journey-chapter-title">
                <p key={`era-${selected}`} className="journey-era journey-slide">
                  {chapter.era}
                </p>
                {/* One heading for every chapter: it morphs through dots instead of re-mounting. */}
                <ChapterHeading text={chapter.title} />
                <div key={`body-${selected}`} className="journey-slide">
                  {chapter.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {link && (
                    <Link
                      href={link.href}
                      className="field-text-link"
                      {...(link.href.startsWith('https:')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {link.label}
                      <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>
              </article>
              {/* Unseen copies of every chapter. In the pinned panel they stack in the article's cell, so the
                reader is as tall as the tallest chapter and the panel never changes height between chapters. */}
              {journeyChapters.map((stop) => (
                <div key={`size-${stop.scene}`} className="journey-sizer" aria-hidden="true" inert>
                  <p className="journey-era">{stop.era}</p>
                  <h3>{stop.title}</h3>
                  {stop.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {'link' in stop && (
                    <span className="field-text-link">
                      {stop.link.label}
                      <ArrowUpRight size={16} />
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="journey-reader-controls">
              <button
                type="button"
                onClick={() => selected > 0 && goToChapter(selected - 1)}
                aria-disabled={selected === 0}
                aria-label="Previous chapter"
              >
                <ArrowLeft size={18} /> Previous
              </button>
              <span role="status" aria-live="polite">
                Chapter {selected + 1} of {chapterCount}
              </span>
              <button
                type="button"
                onClick={() => selected < chapterCount - 1 && goToChapter(selected + 1)}
                aria-disabled={selected === chapterCount - 1}
                aria-label="Next chapter"
              >
                Next chapter <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
