import { useEffect, useState } from 'react';

export function useZeroToTarget(target: number): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    const id = setTimeout(() => {
      setCurrent(target);
    }, 90);
    return () => clearTimeout(id);
  }, [target]);

  return current;
}
