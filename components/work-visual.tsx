/** A diagram of each project's idea, never presented as a product screenshot. */
export function WorkVisual({ id }: { id: string }) {
  return (
    <div className={`work-visual visual-${id}`} aria-hidden="true">
      {id === 'edudojo' ? (
        <div className="question-path">
          <span>A first attempt</span>
          <strong>What makes you think that?</strong>
          <span>A better question. Another attempt.</span>
          <i className="path-line" />
        </div>
      ) : id === 'odicto' ? (
        <div className="voice-path">
          <div className="voice-bars">
            {[18, 32, 46, 26, 58, 40, 24, 48, 30, 16].map((height, i) => (
              <i key={i} style={{ height }} />
            ))}
          </div>
          <strong>
            A thought, written down<span className="voice-caret">|</span>
          </strong>
          <span>Desktop hotkey ↔ Android keyboard</span>
        </div>
      ) : id === 'twinaatma' ? (
        <div className="memory-path">
          <span>A conversation</span>
          <span>A decision</span>
          <span>A lesson</span>
          <strong>Your memory</strong>
          <small>Context for the next conversation</small>
        </div>
      ) : (
        <div className="question-path">
          <span>Inspect → change → check</span>
          <strong>{id === 'dataclean' ? 'A cleaner dataset.' : 'Always in the making.'}</strong>
        </div>
      )}
    </div>
  );
}
