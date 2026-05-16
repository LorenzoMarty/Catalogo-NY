import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { CATALOG_FEATURED_MIX, CATALOG_SECTORS, getCatalogBrandMark } from '../data/catalog.data';
import {
  CatalogImageManifest,
  CatalogProductViewModel,
  CatalogSectionViewModel,
  CatalogSector,
} from '../models/catalog.models';

type CatalogBaseProduct = Omit<CatalogProductViewModel, 'imageAsset'>;

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly sectors = CATALOG_SECTORS;
  private readonly featuredMix = CATALOG_FEATURED_MIX;
  private readonly baseProducts = this.buildBaseProducts();
  private readonly baseProductMap = this.buildBaseProductMap();

  readonly imageManifest$ = this.http.get<CatalogImageManifest>('data/catalog-image-manifest.json').pipe(
    catchError((error) => {
      console.error('Failed to load catalog image manifest.', error);
      return of({});
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  createInitialViewModel(): CatalogSectionViewModel {
    return this.buildViewModel(null, {});
  }

  getCatalogView(selectedSectorId$: Observable<string | null>): Observable<CatalogSectionViewModel> {
    return combineLatest([
      selectedSectorId$.pipe(startWith(null), distinctUntilChanged()),
      this.imageManifest$,
    ]).pipe(
      map(([sectorId, imageManifest]) => this.buildViewModel(sectorId, imageManifest)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private buildBaseProducts(): readonly CatalogBaseProduct[] {
    return this.sectors.flatMap((sector) =>
      sector.products.map((product) => ({
        ...product,
        sectorId: sector.id,
        sectorName: sector.name,
        accent: sector.accent,
        accentSoft: sector.soft,
        brandMark: product.brandMark ?? getCatalogBrandMark(product.brand),
      })),
    );
  }

  private buildBaseProductMap(): Readonly<Record<string, CatalogBaseProduct>> {
    return this.baseProducts.reduce<Record<string, CatalogBaseProduct>>((productMap, product) => {
      productMap[product.id] = product;
      return productMap;
    }, {});
  }

  private buildViewModel(
    sectorId: string | null,
    imageManifest: CatalogImageManifest,
  ): CatalogSectionViewModel {
    const currentSector = this.getSectorById(sectorId);
    const products = this.getVisibleProducts(currentSector, imageManifest);
    const productMap = products.reduce<Record<string, CatalogProductViewModel>>((mapById, product) => {
      mapById[product.id] = product;
      return mapById;
    }, {});

    return {
      sectors: this.sectors,
      currentSector,
      products,
      productMap,
      resultsKicker: currentSector
        ? `${products.length} itens / ${currentSector.sup}`
        : `${this.sectors.length} setores / best sellers`,
      resultsHeading: currentSector?.name ?? 'Produtos para descobrir',
      brandAnimationDuration: `${Math.max(34, (currentSector?.brands.length ?? 0) * 8)}s`,
    };
  }

  private getVisibleProducts(
    currentSector: CatalogSector | null,
    imageManifest: CatalogImageManifest,
  ): readonly CatalogProductViewModel[] {
    const visibleBaseProducts = currentSector
      ? this.baseProducts.filter((product) => product.sectorId === currentSector.id)
      : this.featuredMix
          .map((productId) => this.baseProductMap[productId])
          .filter((product): product is CatalogBaseProduct => Boolean(product));

    return visibleBaseProducts.map((product) => ({
      ...product,
      imageAsset: imageManifest[product.id] ?? null,
    }));
  }

  private getSectorById(sectorId: string | null): CatalogSector | null {
    return this.sectors.find((sector) => sector.id === sectorId) ?? null;
  }
}
