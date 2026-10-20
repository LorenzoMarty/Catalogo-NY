import {
  CatalogFilters as Filters,
  hasActiveFilters,
  SORT_OPTIONS,
} from '../../utils/catalogFilters';

interface CatalogFiltersProps {
  readonly brands: readonly string[];
  readonly filters: Filters;
  readonly onChange: (next: Filters) => void;
  readonly onReset: () => void;
}

export function CatalogFilters({ brands, filters, onChange, onReset }: CatalogFiltersProps) {
  const parse = (value: string): number | null => {
    const n = value === '' ? NaN : Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  return (
    <form
      aria-label="Filtros e ordenação"
      className="catalog-filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <label>
        <span>Marca</span>
        <select
          onChange={(event) => onChange({ ...filters, brand: event.target.value })}
          value={filters.brand}
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Preço mín. (US$)</span>
        <input
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange({ ...filters, minPrice: parse(event.target.value) })}
          type="number"
          value={filters.minPrice ?? ''}
        />
      </label>
      <label>
        <span>Preço máx. (US$)</span>
        <input
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange({ ...filters, maxPrice: parse(event.target.value) })}
          type="number"
          value={filters.maxPrice ?? ''}
        />
      </label>
      <label className="catalog-filters-check">
        <input
          checked={filters.inStockOnly}
          onChange={(event) => onChange({ ...filters, inStockOnly: event.target.checked })}
          type="checkbox"
        />
        <span>Somente em estoque</span>
      </label>
      <label>
        <span>Ordenar por</span>
        <select
          onChange={(event) =>
            onChange({ ...filters, sort: event.target.value as Filters['sort'] })
          }
          value={filters.sort}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {hasActiveFilters(filters) && (
        <button className="catalog-filters-reset" onClick={onReset} type="button">
          Limpar filtros
        </button>
      )}
    </form>
  );
}
