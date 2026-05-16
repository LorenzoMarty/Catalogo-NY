import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { CatalogSectionViewModel } from '../models/catalog.models';
import { buildCatalogViewModel } from '../services/catalogService';

interface CatalogContextValue {
  readonly selectedSectorId: string | null;
  readonly viewModel: CatalogSectionViewModel;
  readonly toggleSector: (sectorId: string) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  const viewModel = useMemo(() => buildCatalogViewModel(selectedSectorId), [selectedSectorId]);

  const toggleSector = useCallback((sectorId: string) => {
    setSelectedSectorId((currentSectorId) => (currentSectorId === sectorId ? null : sectorId));
  }, []);

  const value = useMemo(
    () => ({
      selectedSectorId,
      viewModel,
      toggleSector,
    }),
    [selectedSectorId, toggleSector, viewModel],
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
