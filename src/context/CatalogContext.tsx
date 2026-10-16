import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CatalogData,
  CatalogProductViewModel,
  CatalogSectionViewModel,
} from '../models/catalog.models';
import { fetchRemoteCatalog } from '../services/catalogApi';
import { reportFallback } from '../services/fallbackReport';
import {
  buildCatalogViewModel,
  getCatalogSearchProducts,
  STATIC_CATALOG,
} from '../services/catalogService';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

/**
 * Where the products on screen come from.
 * `static`: no API configured (by design). `loading`: waiting for the API, showing the bundled
 * catalog. `api`: live data. `fallback`: the API was expected but failed, so the bundled
 * catalog (possibly stale) is on screen.
 */
export type CatalogSource = 'static' | 'loading' | 'api' | 'fallback';

interface CatalogContextValue {
  readonly selectedSectorId: string | null;
  readonly viewModel: CatalogSectionViewModel;
  readonly searchProducts: readonly CatalogProductViewModel[];
  readonly toggleSector: (sectorId: string) => void;
  readonly source: CatalogSource;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

interface CatalogProviderProps extends PropsWithChildren {
  /** Overrides VITE_API_URL (used by tests). */
  readonly apiBaseUrl?: string;
}

export function CatalogProvider({ children, apiBaseUrl = apiUrl }: CatalogProviderProps) {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  // The static catalog paints immediately and is also the fallback if the API is unavailable.
  const [catalog, setCatalog] = useState<CatalogData>(STATIC_CATALOG);
  const [source, setSource] = useState<CatalogSource>(apiBaseUrl.trim() ? 'loading' : 'static');

  useEffect(() => {
    let cancelled = false;
    void fetchRemoteCatalog(apiBaseUrl, { onFailure: reportFallback }).then((remote) => {
      if (cancelled || !apiBaseUrl.trim()) {
        return;
      }
      if (remote) {
        setCatalog(remote);
        setSource('api');
      } else {
        setSource('fallback');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const viewModel = useMemo(
    () => buildCatalogViewModel(selectedSectorId, catalog),
    [selectedSectorId, catalog],
  );
  const searchProducts = useMemo(() => getCatalogSearchProducts(catalog), [catalog]);

  const toggleSector = useCallback((sectorId: string) => {
    setSelectedSectorId((currentSectorId) => (currentSectorId === sectorId ? null : sectorId));
  }, []);

  const value = useMemo(
    () => ({
      selectedSectorId,
      viewModel,
      searchProducts,
      toggleSector,
      source,
    }),
    [selectedSectorId, toggleSector, viewModel, searchProducts, source],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error('useCatalog must be used inside CatalogProvider.');
  }

  return context;
}
