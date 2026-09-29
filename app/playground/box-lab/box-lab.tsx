'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { boxOverlap } from '@/lib/box-overlap';

const reference = { x: 140, y: 90, width: 120, height: 100 };
const initial = { offset: 35, width: 140, threshold: 0.5 };

export function BoxLab() {
  const [settings, setSettings] = useState(initial);
  const prediction = {
    x: reference.x + settings.offset,
    y: 90,
    width: settings.width,
    height: 100,
  };
  const { intersection, union, iou } = boxOverlap(reference, prediction);
  const meetsThreshold = iou >= settings.threshold;
  const sharedX = Math.max(reference.x, prediction.x);
  const sharedWidth = Math.max(
    0,
    Math.min(reference.x + reference.width, prediction.x + prediction.width) - sharedX,
  );

  return (
    <section className="box-lab" aria-label="Interactive overlap experiment">
      <div className="lab-canvas">
        <div className="lab-legend">
          <span>
            <i className="reference-key" /> Reference box
          </span>
          <span>
            <i className="prediction-key" /> Your prediction
          </span>
        </div>
        <svg
          viewBox="0 0 500 280"
          role="img"
          aria-label={`Reference and prediction boxes overlap by ${Math.round(iou * 100)} percent intersection over union.`}
        >
          <defs>
            <pattern id="overlap-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 8L8 0" className="overlap-hatch-line" />
            </pattern>
          </defs>
          <rect {...reference} className="reference-rect" />
          <rect {...prediction} className="prediction-rect" />
          <rect x={sharedX} y={90} width={sharedWidth} height={100} fill="url(#overlap-hatch)" />
        </svg>
        <div className="lab-presets" role="group" aria-label="Try an example">
          <button onClick={() => setSettings({ ...settings, offset: 0, width: 120 })}>
            Perfect match
          </button>
          <button onClick={() => setSettings({ ...settings, offset: 35, width: 140 })}>
            Almost there
          </button>
          <button onClick={() => setSettings({ ...settings, offset: 120, width: 120 })}>
            A complete miss
          </button>
        </div>
        <p className="lab-hint">Try “Almost there”, then move the box a little to the left.</p>
      </div>
      <div className="lab-controls">
        <div className="lab-score" role="status" aria-live="polite" aria-atomic="true">
          <span>Intersection over union</span>
          <strong>{iou.toFixed(3)}</strong>
          <p>
            {meetsThreshold ? 'Meets' : 'Below'} your {settings.threshold.toFixed(2)} threshold
          </p>
        </div>
        <div className="lab-sliders">
          <label htmlFor="box-position">
            <span>
              Move the prediction{' '}
              <output>
                {settings.offset > 0 ? '+' : ''}
                {settings.offset}
              </output>
            </span>
            <input
              id="box-position"
              type="range"
              min="-120"
              max="120"
              value={settings.offset}
              onChange={(event) => setSettings({ ...settings, offset: Number(event.target.value) })}
            />
          </label>
          <label htmlFor="box-width">
            <span>
              Prediction width <output>{settings.width}</output>
            </span>
            <input
              id="box-width"
              type="range"
              min="40"
              max="200"
              value={settings.width}
              onChange={(event) => setSettings({ ...settings, width: Number(event.target.value) })}
            />
          </label>
          <label htmlFor="box-threshold">
            <span>
              Acceptance threshold <output>{settings.threshold.toFixed(2)}</output>
            </span>
            <input
              id="box-threshold"
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={settings.threshold}
              onChange={(event) =>
                setSettings({ ...settings, threshold: Number(event.target.value) })
              }
            />
          </label>
        </div>
        <p className="lab-calculation">
          {intersection.toLocaleString('en-US')} shared ÷ {union.toLocaleString('en-US')} total area
        </p>
        <button className="field-text-link" onClick={() => setSettings(initial)}>
          <RotateCcw size={16} /> Reset experiment
        </button>
      </div>
    </section>
  );
}
