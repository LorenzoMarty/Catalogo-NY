import { AnimatePresence, m } from 'framer-motion';
import { FormEvent } from 'react';
import { CatalogSector } from '../../models/catalog.models';
import { ProductSearchSuggestion } from '../../hooks/useProductSearch';

interface ProductSearchProps {
  readonly currentSector: CatalogSector | null;
  readonly isFocused: boolean;
  readonly query: string;
  readonly resultCount: number;
  readonly saveRecentSearch: (query: string) => void;
  readonly setIsFocused: (isFocused: boolean) => void;
  readonly setQuery: (query: string) => void;
  readonly suggestions: readonly ProductSearchSuggestion[];
  readonly totalCount: number;
  readonly clearSearch: () => void;
  readonly selectSuggestion: (suggestion: ProductSearchSuggestion) => void;
}

export function ProductSearch({
  clearSearch,
  currentSector,
  isFocused,
  query,
  resultCount,
  saveRecentSearch,
  selectSuggestion,
  setIsFocused,
  setQuery,
  suggestions,
  totalCount,
}: ProductSearchProps) {
  const hasQuery = query.trim().length > 0;
  const showSuggestions = isFocused && suggestions.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    saveRecentSearch(query);
  };

  return (
    <m.div
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className={`catalog-search${isFocused ? ' is-focused' : ''}${hasQuery ? ' has-query' : ''}`}
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
    >
      <form className="catalog-search-form" onSubmit={handleSubmit}>
        <span aria-hidden="true" className="catalog-search-icon">
          <svg fill="none" viewBox="0 0 24 24">
            <path d="m15.5 15.5 4 4" />
            <circle cx="11" cy="11" r="6.5" />
          </svg>
        </span>

        <label className="sr-only" htmlFor="catalog-product-search">
          Buscar produtos
        </label>
        <input
          autoComplete="off"
          id="catalog-product-search"
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 90);
          }}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={
            currentSector ? `Buscar em ${currentSector.name}` : 'Buscar produto, marca ou categoria'
          }
          type="search"
          value={query}
        />

        <AnimatePresence>
          {hasQuery ? (
            <m.button
              animate={{ opacity: 1, scale: 1 }}
              aria-label="Limpar busca"
              className="catalog-search-clear"
              exit={{ opacity: 0, scale: 0.82 }}
              initial={{ opacity: 0, scale: 0.82 }}
              onClick={clearSearch}
              type="button"
            />
          ) : null}
        </AnimatePresence>
      </form>

      {hasQuery ? (
        <div className="catalog-search-meta">
          <span>{`${resultCount} de ${totalCount} resultados`}</span>
        </div>
      ) : null}

      <AnimatePresence>
        {showSuggestions ? (
          <m.div
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            className="catalog-search-suggestions"
            exit={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
            initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
            role="listbox"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {suggestions.map((suggestion, index) => (
              <m.button
                animate={{ opacity: 1, x: 0 }}
                className="catalog-search-suggestion"
                initial={{ opacity: 0, x: -8 }}
                key={suggestion.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                role="option"
                transition={{ delay: index * 0.025, duration: 0.24 }}
                type="button"
              >
                <span>{suggestion.label}</span>
                <small>
                  {suggestion.type} / {suggestion.meta}
                </small>
              </m.button>
            ))}
          </m.div>
        ) : null}
      </AnimatePresence>
    </m.div>
  );
}
