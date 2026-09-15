import React, { useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { ImageOff } from 'lucide-react';

export default function ImageWithFallback({ src, alt, className = '', fallback = null, ...props }) {
  const [status, setStatus] = useState('loading'); // 'loading', 'loaded', 'error'

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      {status === 'loading' && (
        <Skeleton className="absolute inset-0 w-full h-full z-0 rounded-none" />
      )}
      {status === 'error' && (
        fallback ? fallback : (
          <div className="flex items-center justify-center w-full h-full bg-white/5 text-white/40">
            <ImageOff className="w-1/2 h-1/2 max-w-[24px] max-h-[24px]" />
          </div>
        )
      )}
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: status === 'loaded' ? 1 : 0 }}
          {...props}
        />
      )}
    </div>
  );
}
