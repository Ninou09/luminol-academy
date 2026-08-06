import Image from 'next/image';
import type { EditorialImage as EditorialImageData } from '../lib/flagship';

type EditorialImageProps = {
  image: EditorialImageData;
  className?: string;
  priority?: boolean;
  sizes?: string;
  caption?: string;
};

export function EditorialImage({
  image,
  className,
  priority = false,
  sizes = '(max-width: 760px) 100vw, 50vw',
  caption,
}: EditorialImageProps) {
  return (
    <figure className={className}>
      <div className="editorial-image-frame">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes={sizes}
        />
      </div>
      <figcaption>
        {caption ? <span>{caption}</span> : <span />}
        <a href={image.creditUrl} target="_blank" rel="noreferrer">
          Photo: {image.credit}
        </a>
      </figcaption>
    </figure>
  );
}
