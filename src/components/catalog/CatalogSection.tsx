import { useRef } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useLightbox } from '../../hooks/useLightbox';
import { CatalogImageAsset, CatalogProductViewModel } from '../../models/catalog.models';
import { CSSVars } from '../../utils/styles';

const brandLaneCopies = [0, 1, 2, 3] as const;

export function CatalogSection() {
  const { toggleSector, viewModel: vm } = useCatalog();
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const { activeProduct, closeLightbox, openLightbox } = useLightbox(
    vm.productMap,
    lightboxCloseButtonRef,
  );

  return (
    <>
      <section
        aria-labelledby="results-heading"
        className="catalog-stage"
        id="categories"
        style={
          {
            '--catalog-accent': vm.currentSector?.accent ?? '#8faeff',
            '--catalog-accent-soft': vm.currentSector?.soft ?? 'rgba(143, 174, 255, 0.16)',
          } as CSSVars
        }
      >
        <div className="catalog-shell">
          <div aria-label="Setores do freeshop" className="sector-rail">
            <div className="sector-list" id="sector-list">
              {vm.sectors.map((sector, index) => (
                <button
                  aria-label={`Selecionar ${sector.name}`}
                  aria-pressed={vm.currentSector?.id === sector.id}
                  className={`sector-pill${vm.currentSector?.id === sector.id ? ' is-active' : ''}`}
                  key={sector.id}
                  onClick={() => toggleSector(sector.id)}
                  style={{ '--delay': getDelay(index, 0.05) } as CSSVars}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="sector-icon"
                    dangerouslySetInnerHTML={{ __html: sector.icon }}
                  />
                  <span className="sector-name">{sector.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div aria-live="polite" className="catalog-brand-shell" id="brand-shell">
            <p className="brand-prompt" hidden={Boolean(vm.currentSector)} id="brand-prompt">
              Selecione um setor para revelar as marcas como wordmarks em voo cont&iacute;nuo.
            </p>
          </div>

          <div aria-live="polite" className="catalog-results">
            <div>
              <p className="catalog-results-kicker font-mono" id="results-kicker">
                {vm.resultsKicker}
              </p>
              <h3 className="catalog-results-title display-font" id="results-heading">
                {vm.resultsHeading}
              </h3>
            </div>
          </div>

          <div className="brand-marquee" hidden={!vm.currentSector} id="brand-marquee">
            {vm.currentSector ? (
              <div
                className="brand-track"
                id="brand-track"
                style={{ animationDuration: vm.brandAnimationDuration }}
              >
                {brandLaneCopies.map((lane) => (
                  <span
                    aria-hidden={lane > 0 ? 'true' : undefined}
                    className="brand-lane"
                    key={lane}
                  >
                    {vm.currentSector?.brands.map((brand) => (
                      <span className={`brand-wordmark ${brand.logoClass ?? ''}`} key={brand.name}>
                        {brand.name}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-grid" id="product-grid">
            {vm.products.map((product, index) => (
              <ProductNode
                key={product.id}
                onOpen={(trigger) => openLightbox(product, trigger)}
                product={product}
                revealDelay={getDelay(index, 0.06)}
              />
            ))}
          </div>
        </div>
      </section>

      <div
        aria-hidden={activeProduct ? 'false' : 'true'}
        className={`product-lightbox${activeProduct ? ' is-open' : ''}`}
        id="product-lightbox"
        style={
          {
            '--catalog-accent': activeProduct?.accent ?? '#8faeff',
            '--catalog-accent-soft': activeProduct?.accentSoft ?? 'rgba(143, 174, 255, 0.16)',
          } as CSSVars
        }
      >
        <div className="lightbox-backdrop" data-close-lightbox onClick={closeLightbox} />

        <div
          aria-describedby="lightbox-description"
          aria-labelledby="lightbox-title"
          aria-modal="true"
          className="lightbox-sheet"
          role="dialog"
        >
          <button
            aria-label="Fechar produto"
            className="lightbox-close"
            id="lightbox-close"
            onClick={closeLightbox}
            ref={lightboxCloseButtonRef}
            type="button"
          >
            <span className="sr-only">Fechar produto</span>
          </button>

          <div className="lightbox-shell">
            <div className="lightbox-media" id="lightbox-media">
              {activeProduct ? <ProductMedia product={activeProduct} variant="lightbox" /> : null}
            </div>

            <div className="lightbox-copy">
              <p className="lightbox-sector font-mono" id="lightbox-sector">
                {activeProduct?.sectorName
                  ? `${activeProduct.sectorName} / editorial selection`
                  : ''}
              </p>

              <div className="lightbox-head">
                <span className="lightbox-brand" id="lightbox-brand">
                  {activeProduct?.brand ?? ''}
                </span>
                <span className="lightbox-price" id="lightbox-price">
                  {activeProduct?.price ?? ''}
                </span>
              </div>

              <h3 className="lightbox-title display-font" id="lightbox-title">
                {activeProduct?.name ?? ''}
              </h3>
              <p className="lightbox-note" id="lightbox-note">
                {activeProduct?.note ?? ''}
              </p>
              <p className="lightbox-description" id="lightbox-description">
                {activeProduct?.description ?? ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ProductNodeProps {
  readonly onOpen: (trigger: EventTarget | null) => void;
  readonly product: CatalogProductViewModel;
  readonly revealDelay: string;
}

function ProductNode({ onOpen, product, revealDelay }: ProductNodeProps) {
  return (
    <button
      aria-label={`Abrir ${product.name}`}
      className="product-node"
      onClick={(event) => onOpen(event.currentTarget)}
      style={
        {
          '--delay': revealDelay,
          '--figure-radius': product.radius ?? '34px 20px 30px 20px',
          '--lift': `${product.lift ?? 0}px`,
          '--product-tone': product.tone,
        } as CSSVars
      }
      type="button"
    >
      <span className="product-figure" data-shape={product.shape ?? 'portrait'}>
        <ProductMedia product={product} variant="grid" />
      </span>

      <span className="product-copy">
        <span className="product-brand">{product.brand}</span>
        <span className="product-name">{product.name}</span>
        <span className="product-note">{product.note}</span>
      </span>
      <span className="product-price">{product.price}</span>
    </button>
  );
}

interface ProductMediaProps {
  readonly product: CatalogProductViewModel;
  readonly variant: 'grid' | 'lightbox';
}

function ProductMedia({ product, variant }: ProductMediaProps) {
  const asset = product.imageAsset;

  return (
    <>
      {asset ? (
        <ProductImage asset={asset} product={product} variant={variant} />
      ) : product.art ? (
        <div className="product-illustration" dangerouslySetInnerHTML={{ __html: product.art }} />
      ) : null}
      <span className={`product-brand-mark${variant === 'lightbox' ? ' lightbox-watermark' : ''}`}>
        {product.brandMark}
      </span>
    </>
  );
}

interface ProductImageProps {
  readonly asset: CatalogImageAsset;
  readonly product: CatalogProductViewModel;
  readonly variant: 'grid' | 'lightbox';
}

function ProductImage({ asset, product, variant }: ProductImageProps) {
  return (
    <img
      alt={product.name}
      decoding="async"
      fetchPriority={variant === 'lightbox' ? 'high' : 'low'}
      height={asset.height}
      loading={variant === 'grid' ? 'lazy' : undefined}
      sizes={
        variant === 'lightbox'
          ? (asset.lightboxSizes ?? asset.sizes ?? '92vw')
          : (asset.sizes ?? '50vw')
      }
      src={variant === 'lightbox' ? asset.src : (asset.thumb ?? asset.src)}
      srcSet={asset.srcset ?? undefined}
      style={{
        backgroundImage: asset.placeholder ? `url(${asset.placeholder})` : undefined,
        backgroundSize: asset.placeholder ? 'cover' : undefined,
        objectPosition: product.position ?? 'center center',
      }}
      width={asset.width}
    />
  );
}

function getDelay(index: number, step: number): string {
  return `${(index * step).toFixed(2)}s`;
}
