import type { WorkFacets as Facets } from '@/data/selected-work';

/** What a project holds, as a short table of contents: a key, a name, one sentence. */
export function WorkFacets({ facets }: { facets: Facets }) {
  return (
    <section className="work-facets" aria-labelledby="facets-title">
      <header className="experience-heading">
        <h2 id="facets-title">
          {facets.title} <em>{facets.tone}</em>
        </h2>
        <p>{facets.aside}</p>
      </header>
      <ul className="facet-list" data-key-style={facets.keyStyle}>
        {facets.items.map((item) => (
          <li key={item.key}>
            {facets.keyStyle === 'keyboard' ? (
              <kbd className="facet-key">{item.key}</kbd>
            ) : (
              <span className="facet-key">{item.key}</span>
            )}
            <h3>{item.title}</h3>
            <p>{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
