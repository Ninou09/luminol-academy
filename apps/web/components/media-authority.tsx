type MediaAuthorityProps = {
  title: string;
  description: string;
  appearances: readonly string[];
};

export function MediaAuthority({
  title,
  description,
  appearances,
}: MediaAuthorityProps) {
  return (
    <section aria-labelledby="media-authority-title">
      <h2 id="media-authority-title">{title}</h2>
      <p>{description}</p>
      <ul>
        {appearances.map((appearance) => (
          <li key={appearance}>{appearance}</li>
        ))}
      </ul>
    </section>
  );
}
