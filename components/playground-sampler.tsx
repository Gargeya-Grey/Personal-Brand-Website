'use client';

import { useState } from 'react';
import { Shuffle } from 'lucide-react';

const combinations = [
  ['A reader with too many bookmarks', 'One screen. One useful recommendation.'],
  ['A friend exploring a new city', 'No map. Only sounds.'],
  ['A teacher with five minutes', 'Help without giving away the answer.'],
  ['Someone starting a project', 'Make the first step take sixty seconds.'],
];

export function PlaygroundSampler({ id }: { id: string }) {
  const [offset, setOffset] = useState(20);
  const [combination, setCombination] = useState(0);
  if (id === 'idea-mixer')
    return (
      <div className="sampler sampler-mixer">
        <div aria-live="polite" aria-atomic="true">
          <span>{combinations[combination][0]}</span>
          <i aria-hidden="true">+</i>
          <strong>{combinations[combination][1]}</strong>
        </div>
        <button
          type="button"
          onClick={() => setCombination((combination + 1) % combinations.length)}
        >
          <Shuffle size={16} /> Try another pairing
        </button>
      </div>
    );
  // Two equal 60 × 60 squares. Their shared height is fixed; horizontal overlap varies.
  const intersection = Math.max(0, 60 - offset) * 60;
  const iou = intersection / (7200 - intersection);
  return (
    <div className="sampler sampler-overlap">
      <div className="sampler-boxes" aria-hidden="true">
        <span />
        <span style={{ left: `${15 + offset / 2}%` }} />
      </div>
      <div className="sampler-readout">
        <span>Overlap score</span>
        <output htmlFor="preview-overlap">{iou.toFixed(2)}</output>
      </div>
      <label htmlFor="preview-overlap">Move the second box</label>
      <input
        id="preview-overlap"
        type="range"
        min="0"
        max="65"
        value={offset}
        onChange={(event) => setOffset(Number(event.target.value))}
      />
    </div>
  );
}
