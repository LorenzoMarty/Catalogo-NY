import { useEffect } from 'react';

export function useBodyClass(className: string, enabled: boolean): void {
  useEffect(() => {
    document.body.classList.toggle(className, enabled);

    return () => {
      document.body.classList.remove(className);
    };
  }, [className, enabled]);
}
