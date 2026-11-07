import {
  CatalogFilters as Filters,
  hasActiveFilters,
  SORT_OPTIONS,
} from '../../utils/catalogFilters';
import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '../../i18n/pt';

interface CatalogFiltersProps {
  readonly brands: readonly string[];
  readonly filters: Filters;
  readonly onChange: (next: Filters) => void;
  readonly onReset: () => void;
}

export function CatalogFilters({ brands, filters, onChange, onReset }: CatalogFiltersProps) {
  const { t } = useI18n();
  const parse = (value: string): number | null => {
    const n = value === '' ? NaN : Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  return (
    <form
      aria-label={t('filters.aria')}
      className="catalog-filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <label>
        <span>{t('filters.brand')}</span>
        <select
          onChange={(event) => onChange({ ...filters, brand: event.target.value })}
          value={filters.brand}
        >
          <option value="">{t('filters.all')}</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t('filters.minPrice')}</span>
        <input
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange({ ...filters, minPrice: parse(event.target.value) })}
          type="number"
          value={filters.minPrice ?? ''}
        />
      </label>
      <label>
        <span>{t('filters.maxPrice')}</span>
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
        <span>{t('filters.inStock')}</span>
      </label>
      <label>
        <span>{t('filters.sort')}</span>
        <select
          onChange={(event) =>
            onChange({ ...filters, sort: event.target.value as Filters['sort'] })
          }
          value={filters.sort}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`sort.${option.value}` as MessageKey)}
            </option>
          ))}
        </select>
      </label>
      {hasActiveFilters(filters) && (
        <button className="catalog-filters-reset" onClick={onReset} type="button">
          {t('catalog.clearFilters')}
        </button>
      )}
    </form>
  );
}
