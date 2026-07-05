import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCatalog } from '../../context/CatalogContext';
import { useBodyClass } from '../../hooks/useBodyClass';
import { useLightbox } from '../../hooks/useLightbox';
import { normalizeSearchValue, useProductSearch } from '../../hooks/useProductSearch';
import { CatalogImageAsset, CatalogProductViewModel } from '../../models/catalog.models';
import { getCatalogSearchProducts } from '../../services/catalogService';
import { CSSVars } from '../../utils/styles';
import { ProductSearch } from './ProductSearch';

const brandLaneCopies = [0, 1, 2, 3] as const;

export function CatalogSection() {
  const { toggleSector, viewModel: vm } = useCatalog();
  const reduceMotion = useReducedMotion();
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const allProducts = useMemo(() => getCatalogSearchProducts(), []);
  const allProductMap = useMemo(
    () =>
      allProducts.reduce<Record<string, CatalogProductViewModel>>((productMap, product) => {
        productMap[product.id] = product;
        return productMap;
      }, {}),
    [allProducts],
  );
  const {
    clearSearch,
    isFocused,
    query,
    results,
    saveRecentSearch,
    selectSuggestion,
    setIsFocused,
    setQuery,
    suggestions,
  } = useProductSearch({
    allProducts,
    currentProducts: vm.products,
    currentSector: vm.currentSector,
  });
  const { activeProduct, closeLightbox, openLightbox } = useLightbox(
    allProductMap,
    lightboxCloseButtonRef,
  );
  useBodyClass('product-detail-open', Boolean(activeProduct));
  const hasSearchQuery = query.trim().length > 0;

  return (
    <>
      <m.section
        aria-labelledby="results-heading"
        className={`catalog-stage${isFocused ? ' is-searching' : ''}`}
        id="categories"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: '-8% 0px' }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
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
                <m.button
                  aria-label={`Selecionar ${sector.name}`}
                  aria-pressed={vm.currentSector?.id === sector.id}
                  className={`sector-pill${vm.currentSector?.id === sector.id ? ' is-active' : ''}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
                  key={sector.id}
                  onClick={() => toggleSector(sector.id)}
                  style={{ '--delay': getDelay(index, 0.05) } as CSSVars}
                  transition={{ delay: index * 0.035, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  type="button"
                  viewport={{ once: true }}
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <span
                    aria-hidden="true"
                    className="sector-icon"
                    dangerouslySetInnerHTML={{ __html: sector.icon }}
                  />
                  <span className="sector-name">{sector.name}</span>
                </m.button>
              ))}
            </div>
          </div>

          <ProductSearch
            clearSearch={clearSearch}
            currentSector={vm.currentSector}
            isFocused={isFocused}
            query={query}
            resultCount={results.length}
            saveRecentSearch={saveRecentSearch}
            selectSuggestion={selectSuggestion}
            setIsFocused={setIsFocused}
            setQuery={setQuery}
            suggestions={suggestions}
            totalCount={vm.currentSector ? vm.products.length : allProducts.length}
          />

          <div
            aria-live="polite"
            className="catalog-brand-shell"
            hidden={Boolean(vm.currentSector)}
            id="brand-shell"
          >
            <p className="brand-prompt" hidden={Boolean(vm.currentSector)} id="brand-prompt">
              Selecione um setor para revelar as marcas.
            </p>
          </div>

          <div aria-live="polite" className="catalog-results">
            <div>
              <p className="catalog-results-kicker font-mono" id="results-kicker">
                {hasSearchQuery
                  ? `${results.length} resultados / busca instantânea`
                  : vm.resultsKicker}
              </p>
              <h3 className="catalog-results-title display-font" id="results-heading">
                {hasSearchQuery ? 'Seleção encontrada' : vm.resultsHeading}
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

          <m.div className="product-grid" id="product-grid" layout={!reduceMotion}>
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((product, index) => (
                  <ProductNode
                    key={product.id}
                    onOpen={(trigger) => {
                      saveRecentSearch(query);
                      openLightbox(product, trigger);
                    }}
                    product={product}
                    revealDelay={getDelay(index, 0.04)}
                    searchQuery={hasSearchQuery ? query : ''}
                  />
                ))
              ) : (
                <m.div
                  animate={{ opacity: 1, y: 0 }}
                  className="catalog-empty-state"
                  exit={{ opacity: 0, y: 12 }}
                  initial={{ opacity: 0, y: 12 }}
                  key="empty"
                >
                  <span className="font-mono">Sem resultados</span>
                  <p>Ajuste a busca ou troque o escopo para revelar mais produtos.</p>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </div>
      </m.section>

      <AnimatePresence>
        {activeProduct ? (
          <m.div
            animate={{ opacity: 1, backdropFilter: 'blur(18px)' }}
            aria-hidden="false"
            className="product-lightbox is-open"
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            id="product-lightbox"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: reduceMotion ? 0.16 : 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={
              {
                '--catalog-accent': activeProduct.accent,
                '--catalog-accent-soft': activeProduct.accentSoft,
              } as CSSVars
            }
          >
            <div className="lightbox-backdrop" data-close-lightbox onClick={closeLightbox} />

            <m.div
              animate={reduceMotion ? { opacity: 1 } : { y: 0, scale: 1, filter: 'blur(0px)' }}
              aria-describedby="lightbox-specs"
              aria-labelledby="lightbox-title"
              aria-modal="true"
              className="lightbox-sheet"
              exit={reduceMotion ? { opacity: 0 } : { y: 28, scale: 0.98, filter: 'blur(12px)' }}
              initial={reduceMotion ? { opacity: 0 } : { y: 28, scale: 0.98, filter: 'blur(12px)' }}
              role="dialog"
              transition={{ duration: reduceMotion ? 0.16 : 0.44, ease: [0.16, 1, 0.3, 1] }}
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
                  <ProductMedia product={activeProduct} variant="lightbox" />
                </div>

                <div className="lightbox-copy">
                  <div className="lightbox-head">
                    <p className="lightbox-sector font-mono" id="lightbox-sector">
                      {activeProduct.sectorName}
                    </p>
                    <span className="lightbox-brand" id="lightbox-brand">
                      {activeProduct.brand}
                    </span>
                  </div>

                  <h3 className="lightbox-title display-font" id="lightbox-title">
                    {activeProduct.name}
                  </h3>

                  <ul className="lightbox-specs" id="lightbox-specs">
                    <li>
                      <span>Categoria</span>
                      <strong>{activeProduct.sectorName}</strong>
                    </li>
                    <li>
                      <span>Marca</span>
                      <strong>{activeProduct.brand}</strong>
                    </li>
                    <li>
                      <span>Destaque</span>
                      <strong>{activeProduct.note}</strong>
                    </li>
                  </ul>

                  <div className="lightbox-commerce">
                    <span className="lightbox-price" id="lightbox-price">
                      {getDisplayPrice(activeProduct.price)}
                    </span>
                    <m.a
                      className="lightbox-whatsapp"
                      href={getWhatsAppHref(activeProduct)}
                      rel="noreferrer"
                      target="_blank"
                      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    >
                      Entrar em contato no WhatsApp
                    </m.a>
                  </div>
                </div>
              </div>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

interface ProductNodeProps {
  readonly onOpen: (trigger: EventTarget | null) => void;
  readonly product: CatalogProductViewModel;
  readonly revealDelay: string;
  readonly searchQuery: string;
}

function ProductNode({ onOpen, product, revealDelay, searchQuery }: ProductNodeProps) {
  const reduceMotion = useReducedMotion();
  const { inView, ref } = useInView({
    rootMargin: '220px 0px',
    triggerOnce: true,
  });

  return (
    <m.button
      aria-label={`Abrir ${product.name}`}
      className="product-node"
      exit={
        reduceMotion
          ? { opacity: 0, transition: { duration: 0.12 } }
          : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(8px)' }
      }
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(8px)' }}
      layout={!reduceMotion}
      onClick={(event) => onOpen(event.currentTarget)}
      ref={ref}
      transition={{
        delay: reduceMotion ? 0 : Number.parseFloat(revealDelay),
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={
        {
          '--delay': revealDelay,
          '--figure-radius': product.radius ?? '34px 20px 30px 20px',
          '--lift': `${product.lift ?? 0}px`,
          '--product-tone': product.tone,
        } as CSSVars
      }
      type="button"
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
    >
      <span className="product-figure" data-shape={product.shape ?? 'portrait'}>
        {inView ? (
          <ProductMedia product={product} variant="grid" />
        ) : (
          <span aria-hidden="true" className="product-skeleton" />
        )}
      </span>

      <span className="product-copy">
        <span className="product-brand">{product.brand}</span>
        <span className="product-name">
          <HighlightText query={searchQuery} text={product.name} />
        </span>
      </span>
      <span className="product-price">{getDisplayPrice(product.price)}</span>
    </m.button>
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
  const reduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <m.img
      animate={{
        opacity: isLoaded ? 1 : 0.01,
        scale: reduceMotion ? 1 : isLoaded ? 1 : 1.025,
      }}
      alt={product.name}
      className={isLoaded ? 'is-loaded' : 'is-loading'}
      decoding="async"
      exit={{ opacity: 0 }}
      fetchPriority={variant === 'lightbox' ? 'high' : 'low'}
      height={asset.height}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.025 }}
      loading={variant === 'grid' ? 'lazy' : undefined}
      onLoad={() => setIsLoaded(true)}
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
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      width={asset.width}
    />
  );
}

function HighlightText({ query, text }: { readonly query: string; readonly text: string }) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return <>{text}</>;
  }

  const normalizedText = normalizeSearchValue(text);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex < 0) {
    return <>{text}</>;
  }

  const matchEnd = matchIndex + normalizedQuery.length;

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark>{text.slice(matchIndex, matchEnd)}</mark>
      {text.slice(matchEnd)}
    </>
  );
}

function getDelay(index: number, step: number): string {
  return `${(index * step).toFixed(2)}s`;
}

function getDisplayPrice(price: string): string {
  return price.replace(/\s+info$/i, '');
}

function getWhatsAppHref(product: CatalogProductViewModel): string {
  const message = `Olá, gostaria de saber mais sobre ${product.name} da ${product.brand}.`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
