type PsychologyPathwayProps = {
  title: string;
  body: string;
  actions: readonly string[];
};

export function PsychologyPathway({
  title,
  body,
  actions,
}: PsychologyPathwayProps) {
  return (
    <section aria-labelledby="psychology-pathway-title">
      <h2 id="psychology-pathway-title">{title}</h2>
      <p>{body}</p>
      <ul>
        {actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </section>
  );
}
