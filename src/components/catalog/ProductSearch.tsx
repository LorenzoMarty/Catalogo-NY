import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { FocusEvent, FormEvent, KeyboardEvent, useEffect, useState } from 'react';
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

const LISTBOX_ID = 'catalog-search-listbox';

function getOptionId(index: number): string {
  return `catalog-search-option-${index}`;
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
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(-1);
  const hasQuery = query.trim().length > 0;
  const showSuggestions = isFocused && suggestions.length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, suggestions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    saveRecentSearch(query);
  };

  const handleContainerBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!showSuggestions) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < suggestions.length) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsFocused(false);
      setActiveIndex(-1);
    }
  };

  return (
    <m.div
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className={`catalog-search${isFocused ? ' is-focused' : ''}${hasQuery ? ' has-query' : ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(8px)' }}
      onBlur={handleContainerBlur}
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
          aria-activedescendant={activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
          aria-autocomplete="list"
          aria-controls={LISTBOX_ID}
          aria-expanded={showSuggestions}
          autoComplete="off"
          id="catalog-product-search"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={
            currentSector ? `Buscar em ${currentSector.name}` : 'Buscar produto, marca ou categoria'
          }
          role="combobox"
          type="search"
          value={query}
        />

        <AnimatePresence>
          {hasQuery ? (
            <m.button
              animate={{ opacity: 1, scale: 1 }}
              aria-label="Limpar busca"
              className="catalog-search-clear"
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.82 }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.82 }}
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
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(8px)' }}
            id={LISTBOX_ID}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(8px)' }}
            role="listbox"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {suggestions.map((suggestion, index) => (
              <m.button
                animate={{ opacity: 1, x: 0 }}
                aria-selected={index === activeIndex}
                className={`catalog-search-suggestion${index === activeIndex ? ' is-active' : ''}`}
                id={getOptionId(index)}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                key={suggestion.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                onPointerEnter={() => setActiveIndex(index)}
                role="option"
                tabIndex={-1}
                transition={{ delay: reduceMotion ? 0 : index * 0.025, duration: 0.24 }}
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
