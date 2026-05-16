import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CatalogProductViewModel } from '../models/catalog.models';
import { useBodyClass } from './useBodyClass';

export function useLightbox(
  productMap: Readonly<Record<string, CatalogProductViewModel>>,
  closeButtonRef: RefObject<HTMLButtonElement | null>,
) {
  const [lightboxProductId, setLightboxProductId] = useState<string | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const activeProduct = useMemo(() => {
    if (!lightboxProductId) {
      return null;
    }

    return productMap[lightboxProductId] ?? null;
  }, [lightboxProductId, productMap]);

  useBodyClass('modal-open', Boolean(activeProduct));

  const openLightbox = useCallback(
    (product: CatalogProductViewModel, trigger: EventTarget | null) => {
      const fallbackElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lastFocusedElementRef.current = trigger instanceof HTMLElement ? trigger : fallbackElement;
      setLightboxProductId(product.id);
    },
    [],
  );

  const closeLightbox = useCallback(() => {
    restoreFocusRef.current = lastFocusedElementRef.current;
    lastFocusedElementRef.current = null;
    setLightboxProductId(null);
  }, []);

  useEffect(() => {
    if (activeProduct) {
      closeButtonRef.current?.focus();
      return;
    }

    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }, [activeProduct, closeButtonRef]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeLightbox]);

  return {
    activeProduct,
    closeLightbox,
    openLightbox,
  };
}
