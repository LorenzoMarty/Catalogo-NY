export interface CatalogBrand {
  readonly name: string;
  readonly logoClass?: string;
}

export interface CatalogProduct {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly note: string;
  readonly price: string;
  readonly description: string;
  readonly tone: string;
  readonly position?: string;
  readonly shape?: 'portrait' | 'tall' | 'soft' | 'wide';
  readonly radius?: string;
  readonly lift?: number;
  readonly art?: string;
  readonly brandMark?: string;
}

export interface CatalogSector {
  readonly id: string;
  readonly name: string;
  readonly sup: string;
  readonly accent: string;
  readonly soft: string;
  readonly icon: string;
  readonly description: string;
  readonly brandNote: string;
  readonly brands: readonly CatalogBrand[];
  readonly products: readonly CatalogProduct[];
}

export interface CatalogImageAsset {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly sourceHash: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly thumb?: string;
  readonly thumbWidth?: number;
  readonly thumbHeight?: number;
  readonly placeholder?: string;
  readonly srcset?: string;
  readonly sizes?: string;
  readonly lightboxSizes?: string;
  readonly aspectRatio?: string;
  readonly originalWidth?: number;
  readonly originalHeight?: number;
}

export type CatalogImageManifest = Record<string, CatalogImageAsset>;

export interface CatalogProductViewModel extends CatalogProduct {
  readonly sectorId: string;
  readonly sectorName: string;
  readonly accent: string;
  readonly accentSoft: string;
  readonly brandMark: string;
  readonly imageAsset: CatalogImageAsset | null;
}

export interface CatalogSectionViewModel {
  readonly sectors: readonly CatalogSector[];
  readonly currentSector: CatalogSector | null;
  readonly products: readonly CatalogProductViewModel[];
  readonly productMap: Readonly<Record<string, CatalogProductViewModel>>;
  readonly resultsKicker: string;
  readonly resultsHeading: string;
  readonly brandAnimationDuration: string;
}
