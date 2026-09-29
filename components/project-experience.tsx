'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Play, X } from 'lucide-react';
import type { ProjectDemo, ProjectMedia } from '@/lib/project-media';

const BoxLab = dynamic(() => import('@/app/playground/box-lab/box-lab').then((m) => m.BoxLab));
const IdeaMixer = dynamic(() =>
  import('@/app/playground/idea-mixer/idea-mixer').then((m) => m.IdeaMixer),
);

function HostedDemo({ demo }: { demo: Extract<ProjectDemo, { kind: 'embed' }> }) {
  const [running, setRunning] = useState(false);
  const launch = useRef<HTMLButtonElement>(null);
  return (
    <div className="hosted-demo">
      <div className="demo-launch-row">
        <button
          ref={launch}
          className="field-button"
          onClick={() => setRunning(!running)}
          aria-expanded={running}
          aria-controls="hosted-project-demo"
        >
          {running ? 'Close demo' : 'Load interactive demo'}{' '}
          {running ? <X size={17} /> : <Play size={17} />}
        </button>
        <a className="field-text-link" href={demo.url} target="_blank" rel="noopener noreferrer">
          Open separately <ArrowUpRight size={17} />
        </a>
      </div>
      {running ? (
        <div id="hosted-project-demo">
          <iframe
            src={demo.url}
            title={demo.title}
            sandbox="allow-scripts allow-forms"
            referrerPolicy="no-referrer"
          />
          <button
            className="field-text-link"
            onClick={() => {
              setRunning(false);
              launch.current?.focus();
            }}
          >
            Close demo <X size={16} />
          </button>
        </div>
      ) : (
        <p className="demo-host-note">
          Loads from {new URL(demo.url).hostname} when you choose. If it needs a full window, open
          it separately.
        </p>
      )}
    </div>
  );
}

export function ProjectExperience({ demo, recordings = [] }: ProjectMedia) {
  return (
    <>
      {demo && (
        <section id="try-project" className="project-experience" aria-labelledby="demo-title">
          <header className="experience-heading">
            <h2 id="demo-title">{demo.title}</h2>
            <p>{demo.description}</p>
          </header>
          {demo.kind === 'native' ? (
            demo.app === 'box-lab' ? (
              <BoxLab />
            ) : (
              <IdeaMixer />
            )
          ) : (
            <HostedDemo demo={demo} />
          )}
        </section>
      )}
      {recordings.length > 0 && (
        <section
          id="watch-project"
          className="project-recordings"
          aria-labelledby="recordings-title"
        >
          <header className="experience-heading">
            <h2 id="recordings-title">See it in use.</h2>
            <p>Short recordings of the project doing the work.</p>
          </header>
          <div className="recording-collection">
            {recordings.map((recording) => (
              <figure
                className={`project-recording recording-${recording.orientation ?? 'landscape'}`}
                key={recording.id}
              >
                <video
                  controls
                  playsInline
                  preload="none"
                  poster={recording.poster}
                  aria-label={recording.title}
                  src={recording.src}
                >
                  {recording.captions && (
                    <track
                      kind="captions"
                      src={recording.captions.src}
                      srcLang={recording.captions.language}
                      label={recording.captions.label}
                      default
                    />
                  )}
                  <a href={recording.src}>Open the recording</a>
                </video>
                <figcaption>
                  <h3>{recording.title}</h3>
                  <p>{recording.description}</p>
                </figcaption>
                <details className="recording-transcript">
                  <summary>Read the walkthrough</summary>
                  <p>{recording.transcript}</p>
                </details>
                <a
                  className="field-text-link"
                  href={recording.src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open video file <ArrowUpRight size={16} />
                </a>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
