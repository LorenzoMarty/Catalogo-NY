import { useCallback, useEffect, useMemo, useState } from 'react';
import { CatalogProductViewModel, CatalogSector } from '../models/catalog.models';
import { useDebouncedValue } from './useDebouncedValue';

const RECENT_SEARCHES_KEY = 'catalogo-ny-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export interface ProductSearchSuggestion {
  readonly id: string;
  readonly label: string;
  readonly meta: string;
  readonly type: 'produto' | 'marca' | 'categoria' | 'tag' | 'recente';
}

interface UseProductSearchOptions {
  readonly allProducts: readonly CatalogProductViewModel[];
  readonly currentProducts: readonly CatalogProductViewModel[];
  readonly currentSector: CatalogSector | null;
}

export function useProductSearch({
  allProducts,
  currentProducts,
  currentSector,
}: UseProductSearchOptions) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<readonly string[]>([]);
  const debouncedQuery = useDebouncedValue(query, 90);
  const normalizedQuery = normalizeSearchValue(debouncedQuery);

  useEffect(() => {
    try {
      const rawSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      const parsedSearches = rawSearches ? JSON.parse(rawSearches) : [];

      if (Array.isArray(parsedSearches)) {
        setRecentSearches(
          parsedSearches
            .filter((item): item is string => typeof item === 'string')
            .slice(0, MAX_RECENT_SEARCHES),
        );
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const scopedProducts = useMemo(() => {
    if (currentSector) {
      return allProducts.filter((product) => product.sectorId === currentSector.id);
    }

    return allProducts;
  }, [allProducts, currentSector]);

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return currentProducts;
    }

    return scopedProducts
      .map((product) => ({
        product,
        score: getSearchScore(product, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .map((entry) => entry.product);
  }, [currentProducts, normalizedQuery, scopedProducts]);

  const suggestions = useMemo(
    () =>
      createSuggestions({
        products: scopedProducts,
        query: normalizedQuery,
        recentSearches,
      }),
    [normalizedQuery, recentSearches, scopedProducts],
  );

  const saveRecentSearch = useCallback((nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    setRecentSearches((currentSearches) => {
      const nextSearches = [
        trimmedQuery,
        ...currentSearches.filter(
          (item) => normalizeSearchValue(item) !== normalizeSearchValue(trimmedQuery),
        ),
      ].slice(0, MAX_RECENT_SEARCHES);

      try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
      } catch {
        // localStorage can be unavailable in private contexts.
      }

      return nextSearches;
    });
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: ProductSearchSuggestion) => {
      setQuery(suggestion.label);
      saveRecentSearch(suggestion.label);
    },
    [saveRecentSearch],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    clearSearch,
    isFocused,
    query,
    results,
    saveRecentSearch,
    selectSuggestion,
    setIsFocused,
    setQuery,
    suggestions,
  };
}

export function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSearchScore(product: CatalogProductViewModel, query: string): number {
  const fields = [
    { value: product.name, weight: 120 },
    { value: product.brand, weight: 96 },
    { value: product.sectorName, weight: 72 },
    { value: product.note, weight: 52 },
    { value: product.description, weight: 32 },
    { value: product.searchTags.join(' '), weight: 22 },
  ];

  return fields.reduce((score, field) => {
    const value = normalizeSearchValue(field.value);

    if (!value) {
      return score;
    }

    if (value === query) {
      return score + field.weight * 2;
    }

    if (value.startsWith(query)) {
      return score + field.weight * 1.45;
    }

    if (value.includes(query)) {
      return score + field.weight;
    }

    return score;
  }, 0);
}

function createSuggestions({
  products,
  query,
  recentSearches,
}: {
  readonly products: readonly CatalogProductViewModel[];
  readonly query: string;
  readonly recentSearches: readonly string[];
}): readonly ProductSearchSuggestion[] {
  if (!query) {
    return recentSearches.map((label) => ({
      id: `recent-${label}`,
      label,
      meta: 'recente',
      type: 'recente',
    }));
  }

  const suggestions = new Map<string, ProductSearchSuggestion>();

  products.forEach((product) => {
    addSuggestion(
      suggestions,
      {
        id: `product-${product.id}`,
        label: product.name,
        meta: product.brand,
        type: 'produto',
      },
      query,
    );
    addSuggestion(
      suggestions,
      {
        id: `brand-${product.brand}`,
        label: product.brand,
        meta: product.sectorName,
        type: 'marca',
      },
      query,
    );
    addSuggestion(
      suggestions,
      {
        id: `sector-${product.sectorId}`,
        label: product.sectorName,
        meta: 'categoria',
        type: 'categoria',
      },
      query,
    );

    product.searchTags.slice(0, 8).forEach((tag) => {
      addSuggestion(
        suggestions,
        {
          id: `tag-${normalizeSearchValue(tag)}`,
          label: tag,
          meta: product.sectorName,
          type: 'tag',
        },
        query,
      );
    });
  });

  return Array.from(suggestions.values()).slice(0, 7);
}

function addSuggestion(
  suggestions: Map<string, ProductSearchSuggestion>,
  suggestion: ProductSearchSuggestion,
  query: string,
): void {
  const normalizedLabel = normalizeSearchValue(suggestion.label);

  if (!normalizedLabel.includes(query) || suggestions.has(suggestion.id)) {
    return;
  }

  suggestions.set(suggestion.id, suggestion);
}
