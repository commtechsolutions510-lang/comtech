import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function ImageWithFallback({ src, alt, className = '', fallback }: Props) {
  const [error, setError] = useState(false);
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Cpath d="M200 160 L200 200 M190 190 L210 190" stroke="%239ca3af" stroke-width="3" stroke-linecap="round"/%3E%3C/svg%3E';
  const fallbackSrc = error ? (fallback || placeholder) : src;

  return (
    <img
      src={fallbackSrc}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={`object-cover ${className}`}
    />
  );
}
