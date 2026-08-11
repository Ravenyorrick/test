type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function SafeImage({ src, alt, className }: Props) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        const el = e.currentTarget;
        el.style.visibility = 'hidden';
      }}
    />
  );
}
