type Testimonial = {
  quote: string;
  author: string;
  context: string;
};

type TestimonialsStripProps = {
  title: string;
  items: readonly Testimonial[];
};

export function TestimonialsStrip({ title, items }: TestimonialsStripProps) {
  return (
    <section aria-labelledby="testimonials-title">
      <h2 id="testimonials-title">{title}</h2>
      <div>
        {items.map((item) => (
          <figure key={`${item.author}-${item.context}`}>
            <blockquote>{item.quote}</blockquote>
            <figcaption>
              {item.author} · {item.context}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
