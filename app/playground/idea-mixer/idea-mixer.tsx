'use client';
import { useEffect, useState } from 'react';
import { Bookmark, Check, Copy, Shuffle, Trash2 } from 'lucide-react';

const audiences = [
  'a student learning something difficult',
  'a friend in a new city',
  'a teacher with very little time',
  'someone starting their first project',
  'a reader with too many bookmarks',
  'a team trying to explain an idea',
];
const constraints = [
  'without giving them the answer',
  'using only one screen',
  'in less than sixty seconds',
  'with no scores or rankings',
  'through a playful daily ritual',
  'by making their progress visible',
];
const storageKey = 'gargeya-idea-mixer-v1';

export function IdeaMixer() {
  const [audience, setAudience] = useState(0);
  const [constraint, setConstraint] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  const prompt = `Build something for ${audiences[audience]}, ${constraints[constraint]}. What is the smallest useful version you could make today?`;
  useEffect(() => {
    // Read device-only state after the server-rendered first frame.
    const frame = requestAnimationFrame(() => {
      try {
        const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (Array.isArray(value))
          setSaved(
            value
              .filter((item): item is string => typeof item === 'string' && item.length < 500)
              .slice(0, 12),
          );
      } catch {
        /* Storage is optional; the mixer still works. */
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function save(next: string[]) {
    setSaved(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStatus('Notebook updated. Saved on this device.');
    } catch {
      setStatus('Saved for this visit. Your browser has disabled device storage.');
    }
  }
  function mix() {
    // Nonzero offsets guarantee each slot changes on every press.
    setAudience(
      (current) =>
        (current + 1 + Math.floor(Math.random() * (audiences.length - 1))) % audiences.length,
    );
    setConstraint(
      (current) =>
        (current + 1 + Math.floor(Math.random() * (constraints.length - 1))) % constraints.length,
    );
    setStatus('A fresh combination. Where would you take it?');
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus('Prompt copied. Go make something.');
    } catch {
      setStatus('Clipboard unavailable. Select the prompt above to copy it.');
    }
  }
  const alreadySaved = saved.includes(prompt);
  return (
    <>
      <section className="experiment-surface" aria-label="Idea mixer">
        <p className="field-label">One audience + one constraint = a starting point</p>
        <div className="mix-slots" aria-live="polite" aria-atomic="true">
          <div className="mix-slot">
            <span className="field-label">Make it for</span>
            <strong>{audiences[audience]}</strong>
          </div>
          <span className="mix-plus" aria-hidden="true">
            +
          </span>
          <div className="mix-slot">
            <span className="field-label">The twist</span>
            <strong>{constraints[constraint]}</strong>
          </div>
        </div>
        <p className="mix-prompt">{prompt}</p>
        <div className="field-actions">
          <button type="button" className="field-button" onClick={mix}>
            <Shuffle size={17} /> Mix another idea
          </button>
          <button type="button" className="field-button secondary" onClick={copy}>
            <Copy size={16} /> Copy prompt
          </button>
          <button
            type="button"
            className="field-button secondary"
            disabled={!ready || alreadySaved || saved.length >= 12}
            onClick={() => save([prompt, ...saved])}
          >
            {alreadySaved ? <Check size={16} /> : <Bookmark size={16} />}
            {alreadySaved ? 'Saved' : 'Keep this idea'}
          </button>
        </div>
        <p className="mix-status" role="status">
          {status || 'Your saved ideas stay in this browser. Keep up to 12.'}
        </p>
      </section>
      {saved.length > 0 && (
        <section className="field-section">
          <p className="field-label">Your little notebook / {saved.length} of 12</p>
          <h2 className="mt-4 mb-6">
            Worth <em>coming back to.</em>
          </h2>
          <ul>
            {saved.map((idea, index) => (
              <li key={idea} className="writing-row saved-idea-row">
                <span className="field-label">{String(index + 1).padStart(2, '0')}</span>
                <p className="field-copy">{idea}</p>
                <button
                  type="button"
                  aria-label={'Remove saved idea ' + (index + 1)}
                  className="flex min-h-11 min-w-11 items-center justify-center"
                  onClick={() => save(saved.filter((item) => item !== idea))}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
