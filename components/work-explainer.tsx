'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const examples = {
  edudojo: {
    title: 'Follow an idea through a revision',
    note: 'An illustrative learning exchange, not a student record or a live AI response.',
    stages: [
      {
        label: 'First attempt',
        speaker: 'Student draft',
        text: 'More trees will always make a city cooler.',
        detail: 'A clear claim, with a word worth questioning: “always”.',
      },
      {
        label: 'A question',
        speaker: 'Coach prompt',
        text: 'Would the same tree have the same effect on every street?',
        detail: 'The question invites the student to consider shade, location, and conditions.',
      },
      {
        label: 'Revision',
        speaker: 'Student revises',
        text: 'Trees can help cool a street. The effect depends on shade, water, and where they are planted.',
        detail: 'The student has narrowed the claim. A teacher can discuss what led to the change.',
      },
    ],
  },
  odicto: {
    title: 'One thought. Two ways to get it down.',
    note: 'An interaction sketch using sample text. This page does not record your microphone.',
    stages: [
      {
        label: 'Desktop',
        speaker: 'Hotkey → transcript at the cursor',
        text: 'Let’s test the smaller version before adding more features.',
        detail:
          'Trigger dictation from the keyboard and keep your current app in focus. Local Whisper or an optional cloud transcription provider.',
      },
      {
        label: 'Android',
        speaker: 'Keyboard microphone → text in your editor',
        text: 'Let’s test the smaller version before adding more features.',
        detail:
          'Speak through the Android keyboard. Audio goes directly to your configured provider; no desktop connection is needed.',
      },
    ],
  },
  twinaatma: {
    title: 'What should the next conversation remember?',
    note: 'A sample memory flow. Nothing here is saved to your device or an AI assistant.',
    stages: [
      {
        label: 'Conversation',
        speaker: 'Something worth remembering',
        text: 'When we compare options, start with a small working example.',
        detail: 'A useful preference emerges during a conversation.',
      },
      {
        label: 'Proposal',
        speaker: 'A change for you to review',
        text: 'Prefers a working example before a long comparison.',
        detail:
          'TwinAatma proposes an update. You can accept it or leave your existing memory unchanged.',
      },
      {
        label: 'Next time',
        speaker: 'Context the assistant can load',
        text: 'Start with a small example, then explain the tradeoffs.',
        detail:
          'An accepted preference becomes context for a future conversation, in notes you can inspect.',
      },
    ],
  },
};

export function WorkExplainer({ id }: { id: string }) {
  const controls = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const example = examples[id as keyof typeof examples];
  if (!example) return null;
  const current = example.stages[stage];
  function showStage(next: number) {
    setStage(next);
    requestAnimationFrame(() =>
      controls.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus(),
    );
  }
  function chooseMemory(accept: boolean) {
    setAccepted(accept);
    showStage(accept ? 2 : 0);
  }
  return (
    <section
      className={`work-explainer explainer-${id}`}
      aria-label="Interactive project explanation"
    >
      <div className="explainer-heading">
        <h2>{example.title}</h2>
        <p>{example.note}</p>
      </div>
      <div ref={controls} className="explainer-controls" role="group" aria-label="Example stage">
        {example.stages.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={stage === index}
            disabled={id === 'twinaatma' && index === 2 && !accepted}
            onClick={() => setStage(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="example-scene" aria-live="polite" aria-atomic="true">
        <span>{current.speaker}</span>
        <blockquote>{current.text}</blockquote>
        <p>{current.detail}</p>
      </div>
      {id === 'twinaatma' && stage === 1 ? (
        <div className="field-actions">
          <button className="field-button" onClick={() => chooseMemory(true)}>
            Accept sample memory <Check size={16} />
          </button>
          <button className="field-text-link" onClick={() => chooseMemory(false)}>
            Leave it unchanged
          </button>
        </div>
      ) : (
        <button
          className="field-text-link"
          onClick={() => {
            if (stage === example.stages.length - 1) {
              showStage(0);
              setAccepted(false);
            } else showStage(stage + 1);
          }}
        >
          {stage === example.stages.length - 1
            ? 'Start again'
            : id === 'odicto'
              ? 'See the Android path'
              : 'Continue the example'}{' '}
          <ArrowRight size={16} />
        </button>
      )}
    </section>
  );
}
