'use client';

import './strategy.css';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, ExternalLink } from 'lucide-react';
import {
  DAILY_PRACTICE,
  GROWTH_STRATEGY_UPDATED,
  POST_CHECK,
  REPLY_PRACTICE,
  RESEARCH_LIMIT,
  RESEARCH_NOTES,
  SITTINGS,
  THESIS,
  WEEKLY_REVIEW,
  WRITING_EXERCISE,
  WRITING_LENSES,
} from '@/lib/x-growth-strategy';

const TRACK_KEY = 'x_growth_strategy_track';
type Track = { date: string; morning: boolean; evening: boolean };

/** The section rail: label for the reader, id of the section it scrolls to. */
const SECTIONS = [
  { id: 'growth-thesis', label: 'The question' },
  { id: 'growth-writing', label: 'When you’re stuck' },
  { id: 'growth-routine', label: 'Two sittings' },
  { id: 'growth-evidence', label: 'Why it fits X' },
] as const;

function istDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function emptyTrack(): Track {
  return { date: istDateKey(), morning: false, evening: false };
}

function loadTrack(): Track {
  const today = emptyTrack();
  try {
    const saved = JSON.parse(localStorage.getItem(TRACK_KEY) || 'null') as Track | null;
    if (saved?.date === today.date) {
      return { date: today.date, morning: Boolean(saved.morning), evening: Boolean(saved.evening) };
    }
  } catch { /* The guide works without local storage. */ }
  return today;
}

const NUMBER_WORDS: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5' };

/**
 * The daily shape as figures, read from the owner's own sentence (DAILY_PRACTICE) so the figures
 * cannot drift from it. A part the sentence no longer states is left out.
 */
function dailyShape(text: string): { value: string; label: string }[] {
  const figures: { value: string; label: string }[] = [];
  const original = /\b(one|two|three|\d+)\s+(?:\w+\s+)?original/i.exec(text);
  const replies = /\b(\d+\s*[–-]\s*\d+|\d+)\s+(?:\w+\s+)?repl/i.exec(text);
  if (original) {
    figures.push({ value: NUMBER_WORDS[original[1].toLowerCase()] ?? original[1], label: 'original a day' });
  }
  if (replies) figures.push({ value: replies[1].replace(/\s+/g, ''), label: 'replies a day' });
  return figures;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function XGrowthStrategy() {
  const [track, setTrack] = useState<Track>(loadTrack);
  const [lensId, setLensId] = useState<(typeof WRITING_LENSES)[number]['id']>('learning');
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const railRef = useRef<HTMLElement>(null);
  const lens = WRITING_LENSES.find((item) => item.id === lensId) ?? WRITING_LENSES[0];

  const shape = [
    ...dailyShape(DAILY_PRACTICE),
    { value: String(SITTINGS.length), label: 'sittings' },
    { value: String(SITTINGS.reduce((total, sitting) => total + sitting.minutes, 0)), label: 'minutes in all' },
  ];

  useEffect(() => {
    try { localStorage.setItem(TRACK_KEY, JSON.stringify(track)); }
    catch { /* Tracking is optional. */ }
  }, [track]);

  useEffect(() => {
    const refreshDay = () => {
      const today = emptyTrack();
      setTrack((current) => current.date === today.date ? current : today);
    };
    const timer = window.setInterval(refreshDay, 60_000);
    window.addEventListener('focus', refreshDay);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshDay);
    };
  }, []);

  // The rail follows the section the reader is in.
  useEffect(() => {
    const targets = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => node !== null
    );
    if (!targets.length || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  // On a narrow screen the rail scrolls sideways; keep the current section's tab in view.
  useEffect(() => {
    const rail = railRef.current;
    const tab = rail?.querySelector<HTMLElement>('.is-active');
    if (!rail || !tab) return;
    const outOfView = tab.offsetLeft < rail.scrollLeft || tab.offsetLeft + tab.offsetWidth > rail.scrollLeft + rail.clientWidth;
    if (outOfView) rail.scrollLeft = Math.max(0, tab.offsetLeft - 16);
  }, [activeSection]);

  function toggleSitting(id: 'morning' | 'evening') {
    setTrack((current) => {
      const today = emptyTrack();
      const latest = current.date === today.date ? current : today;
      return { ...latest, [id]: !latest[id] };
    });
  }

  function goToSection(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  return (
    <div className="st-root">
      <nav ref={railRef} className="st-rail" aria-label="Sections">
        <ul className="atelier-tabs">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                aria-current={activeSection === section.id ? 'true' : undefined}
                onClick={() => goToSection(section.id)}
                className={'atelier-tab' + (activeSection === section.id ? ' is-active' : '')}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section id="growth-thesis" aria-labelledby="growth-thesis-title" className="atelier-section st-section">
        <div className="st-aside">
          <span className="atelier-mono">01</span>
          <p className="atelier-meta st-updated">
            <span>Updated <span className="atelier-mono">{GROWTH_STRATEGY_UPDATED}</span></span>
          </p>
        </div>
        <div className="st-body">
          <h2 id="growth-thesis-title" className="st-h2 st-h2-lead">
            The question to return to. <em>{THESIS.title}</em>
          </h2>
          <p className="st-statement">{THESIS.statement}</p>
          <p className="st-text">{THESIS.grounding}</p>
          <p className="st-audience">{THESIS.audience}</p>
        </div>
      </section>

      <section id="growth-writing" aria-labelledby="growth-writing-title" className="atelier-section st-section">
        <div className="st-aside">
          <span className="atelier-mono">02</span>
        </div>
        <div className="st-body">
          <h2 id="growth-writing-title" className="st-h2">
            When you’re stuck. <em>Pick one real moment.</em>
          </h2>
          <div role="group" aria-label="Writing focus">
            <ul className="atelier-tabs st-lenses">
              {WRITING_LENSES.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={lensId === item.id}
                    aria-controls="growth-writing-prompt"
                    onClick={() => setLensId(item.id)}
                    className="atelier-tab"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div id="growth-writing-prompt" aria-live="polite" aria-atomic="true" className="st-prompt">
            <p className="st-question">{lens.question}</p>
            <p className="st-text">{lens.nudge}</p>
          </div>

          <h3 className="atelier-h3 st-h3">Five minutes, four notes</h3>
          <ol className="st-steps" role="list">
            {WRITING_EXERCISE.map((question) => <li key={question}>{question}</li>)}
          </ol>
          <p className="st-text">Use the notes to write a natural paragraph. Let the specific detail do the impressing.</p>
          <p className="st-check">{POST_CHECK}</p>
        </div>
      </section>

      <section id="growth-routine" aria-labelledby="growth-routine-title" className="atelier-section st-section">
        <div className="st-aside">
          <span className="atelier-mono">03</span>
        </div>
        <div className="st-body">
          <div className="st-title-row">
            <h2 id="growth-routine-title" className="st-h2">
              The repeatable part. <em>Two sittings. Then leave.</em>
            </h2>
            <Link href="/editorial?workspace=x" className="atelier-link st-open">
              Open To-Do <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <p className="st-text st-practice">{DAILY_PRACTICE}</p>

          <ul className="st-figures" aria-label="The daily shape">
            {shape.map((figure) => (
              <li key={figure.label}>
                <b>{figure.value}</b>
                <span>{figure.label}</span>
              </li>
            ))}
          </ul>

          <ol className="st-path">
            {SITTINGS.map((sitting) => {
              const done = track[sitting.id];
              return (
                <li key={sitting.id} className="st-stop" data-done={done ? 'true' : undefined}>
                  <button
                    type="button"
                    aria-label={(sitting.id === 'morning' ? 'Morning' : 'Evening') + ' sitting complete'}
                    aria-pressed={done}
                    onClick={() => toggleSitting(sitting.id)}
                    className="st-stop-button"
                  >
                    <span className="st-time">{sitting.label}</span>
                    <span className="st-stop-meta">
                      <span className="atelier-mono">{sitting.minutes} min</span>
                      <span className="st-state">
                        {done && <Check size={14} aria-hidden="true" />}
                        {done ? 'Done' : 'Mark done'}
                      </span>
                    </span>
                    <span className="st-action">{sitting.action}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="st-note">Daily checks stay on this device and reset at midnight IST.</p>

          <dl className="st-rows">
            <div>
              <dt>Replies</dt>
              <dd>{REPLY_PRACTICE}</dd>
            </div>
            <div>
              <dt>Review once a week</dt>
              <dd>{WEEKLY_REVIEW}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="growth-evidence" aria-labelledby="growth-evidence-title" className="atelier-section st-section">
        <details className="st-why">
          <summary>
            <span className="atelier-mono st-why-index">04</span>
            <h2 id="growth-evidence-title" className="st-h2">
              Why this approach fits X. <em>The sources, and where they stop.</em>
            </h2>
            <ChevronDown size={18} className="st-chevron" aria-hidden="true" />
          </summary>
          <div className="st-why-body">
            <ul className="st-notes">
              {RESEARCH_NOTES.map((note) => (
                <li key={note.title}>
                  <h3 className="atelier-h3">{note.title}</h3>
                  <p className="st-text">{note.evidence}</p>
                  <a href={note.url} target="_blank" rel="noopener noreferrer" className="st-source">
                    {note.source} <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <p className="st-implication">{note.implication}</p>
                </li>
              ))}
            </ul>
            <p className="atelier-notice st-limit">{RESEARCH_LIMIT}</p>
          </div>
        </details>
      </section>
    </div>
  );
}
