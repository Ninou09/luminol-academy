type FounderAuthorityProps = {
  title: string;
  body: string;
  highlights: readonly string[];
};

export function FounderAuthority({ title, body, highlights }: FounderAuthorityProps) {
  return (
    <section aria-labelledby="founder-authority-title">
      <h2 id="founder-authority-title">{title}</h2>
      <p>{body}</p>
      <ul>
        {highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
