import { describe, expect, it } from 'vitest';
import { buildCatalogViewModel, createInitialCatalogViewModel } from './catalogService';

describe('catalogService', () => {
  it('creates the featured catalog view without a selected sector', () => {
    const viewModel = createInitialCatalogViewModel();

    expect(viewModel.currentSector).toBeNull();
    expect(viewModel.products.length).toBeGreaterThan(0);
    expect(viewModel.resultsHeading).toBe('Produtos para descobrir');
  });

  it('filters products when a sector is selected', () => {
    const viewModel = buildCatalogViewModel('perfumery');

    expect(viewModel.currentSector?.id).toBe('perfumery');
    expect(viewModel.products.every((product) => product.sectorId === 'perfumery')).toBe(true);
    expect(viewModel.resultsHeading).toBe('Perfumaria');
  });
});
