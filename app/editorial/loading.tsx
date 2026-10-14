import './workbench.css';

/** Streaming shell while auth + data resolve. It mirrors the page head and four rows, so the layout stays still (less CLS). */
export default function Loading() {
  return (
    <div className="atelier-page wb-skeleton" aria-busy="true">
      <div className="atelier-head">
        <span className="wb-bone" style={{ width: '9rem' }} />
        <span className="wb-bone" style={{ width: 'min(30rem, 80%)', height: '2.6rem' }} />
        <span className="wb-bone" style={{ width: 'min(20rem, 60%)' }} />
      </div>
      <ul className="atelier-rows" style={{ marginTop: 48 }}>
        {[0, 1, 2, 3].map((row) => (
          <li key={row} className="atelier-row wb-row" style={{ alignItems: 'center' }}>
            <span className="wb-bone" style={{ width: '6rem' }} />
            <span style={{ display: 'grid', gap: 10 }}>
              <span className="wb-bone" style={{ width: 'min(24rem, 70%)', height: '1.1rem' }} />
              <span className="wb-bone" style={{ width: 'min(36rem, 90%)' }} />
            </span>
            <span className="wb-bone" style={{ width: '6.5rem', height: '2.25rem' }} />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading editorial workspace…</span>
    </div>
  );
}
