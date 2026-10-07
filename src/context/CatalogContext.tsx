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
import {
  buildCatalogViewModel,
  getCatalogSearchProducts,
  STATIC_CATALOG,
} from '../services/catalogService';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

interface CatalogContextValue {
  readonly selectedSectorId: string | null;
  readonly viewModel: CatalogSectionViewModel;
  readonly searchProducts: readonly CatalogProductViewModel[];
  readonly toggleSector: (sectorId: string) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  // The static catalog paints immediately and is also the fallback if the API is unavailable.
  const [catalog, setCatalog] = useState<CatalogData>(STATIC_CATALOG);

  useEffect(() => {
    let cancelled = false;
    void fetchRemoteCatalog(apiUrl).then((remote) => {
      if (!cancelled && remote) {
        setCatalog(remote);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    }),
    [selectedSectorId, toggleSector, viewModel, searchProducts],
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
