type ProgrammeCtaPanelProps = {
  title: string;
  body: string;
  label: string;
};

export function ProgrammeCtaPanel({
  title,
  body,
  label,
}: ProgrammeCtaPanelProps) {
  return (
    <section aria-labelledby="programme-cta-title">
      <h2 id="programme-cta-title">{title}</h2>
      <p>{body}</p>
      <p>{label}</p>
    </section>
  );
}
