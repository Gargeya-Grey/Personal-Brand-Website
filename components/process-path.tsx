/** The steps a tool supports, drawn as one dotted path: the process, not only the output. */
export function ProcessPath({ steps }: { steps: readonly string[] }) {
  if (!steps.length) return null;
  return (
    <ol className="process-path" aria-label="How it works">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
