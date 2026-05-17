import { useEffect, useState } from 'react';

export function useDebouncedValue<TValue>(value: TValue, delay = 120): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [delay, value]);

  return debouncedValue;
}
