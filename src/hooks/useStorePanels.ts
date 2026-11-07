import { useEffect, useState } from 'react';
import { STORE_PANELS } from '../data/stores.data';
import { StorePanel } from '../models/store.models';
import { fetchBranches, mergeBranches } from '../services/branchesApi';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

/** The store panels: static data first, with contact info refreshed from the API when it answers. */
export function useStorePanels(apiBaseUrl: string = apiUrl): readonly StorePanel[] {
  const [panels, setPanels] = useState<readonly StorePanel[]>(STORE_PANELS);

  useEffect(() => {
    let cancelled = false;
    void fetchBranches(apiBaseUrl).then((branches) => {
      if (!cancelled && branches) setPanels(mergeBranches(STORE_PANELS, branches));
    });
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  return panels;
}
