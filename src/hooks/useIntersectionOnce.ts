import { useEffect, useRef, useState } from 'react';

export function useIntersectionOnce<T extends Element>(
  options?: IntersectionObserverInit,
): { ref: React.MutableRefObject<T | null>; hasIntersected: boolean } {
  const ref = useRef<T | null>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (hasIntersected || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setHasIntersected(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options, hasIntersected]);

  return { ref, hasIntersected };
}
