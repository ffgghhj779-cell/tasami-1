import { memo, useState, useCallback } from 'react';

interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

/** Progressive image reveal — opacity fade only (GPU-friendly). */
export const FadeInImage = memo(function FadeInImage({
  src,
  alt,
  className = '',
  placeholderSrc,
}: FadeInImageProps) {
  const [loaded, setLoaded] = useState(false);
  const handleLoad = useCallback(() => setLoaded(true), []);

  return (
    <div className={`relative overflow-hidden gpu-layer ${className}`}>
      {placeholderSrc && !loaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 opacity-60"
        />
      )}
      {!loaded && !placeholderSrc && (
        <div className="absolute inset-0 skeleton-shimmer bg-border/30" aria-hidden />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        className={`img-fade-in w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
});
