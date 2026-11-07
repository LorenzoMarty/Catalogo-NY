import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPriceLabel, ProductMedia } from '../components/catalog/CatalogSection';
import { ProductWhatsApp } from '../components/catalog/ProductWhatsApp';
import { CatalogProvider, useCatalog } from '../context/CatalogContext';
import { applyProductMeta, buildProductMeta } from '../seo/productMeta';
import { productIdFromSlug } from '../utils/productSlug';
import { CSSVars } from '../utils/styles';
import { useI18n } from '../i18n/I18nProvider';
import { localizedText } from '../i18n/product';

export function ProductPage() {
  return (
    <CatalogProvider>
      <ProductDetail />
    </CatalogProvider>
  );
}

function ProductDetail() {
  const { lang, t, tOr } = useI18n();
  const { slug = '' } = useParams();
  const { pathname, key } = useLocation();
  const navigate = useNavigate();
  const { searchProducts, source } = useCatalog();
  const id = productIdFromSlug(slug);
  const product = searchProducts.find((p) => p.id === id) ?? null;
  const text = product ? localizedText(product, lang) : { name: '', description: '' };

  useEffect(() => {
    if (!product) return;
    const image = product.imageAsset?.src;
    const origin = window.location.origin;
    return applyProductMeta(
      buildProductMeta(
        { ...product, ...text, price: getPriceLabel(product, t) },
        origin,
        pathname,
        image ? new URL(image, origin).href : undefined,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `text` derives from product and lang
  }, [product, pathname, t, lang]);

  // Back returns to the previous page (the catalog with its filters in the URL); a direct
  // visit has no history entry of ours, so it goes to the home page instead.
  const goBack = () => (key === 'default' ? navigate('/') : navigate(-1));

  if (!product) {
    return (
      <main className="product-page">
        <h1 className="display-font">
          {source === 'loading' ? t('product.loading') : t('product.notFound')}
        </h1>
        <Link className="lightbox-page-link" to="/">
          {t('product.backLink')}
        </Link>
      </main>
    );
  }

  return (
    <main
      className="product-page"
      style={
        {
          '--catalog-accent': product.accent,
          '--catalog-accent-soft': product.accentSoft,
        } as CSSVars
      }
    >
      <button className="lightbox-page-link" onClick={goBack} type="button">
        {t('product.back')}
      </button>
      <div className="lightbox-shell">
        <div className="lightbox-media">
          <ProductMedia product={product} variant="lightbox" />
        </div>
        <div className="lightbox-copy">
          <div className="lightbox-head">
            <p className="lightbox-sector font-mono">
              {tOr(`sector.${product.sectorId}`, product.sectorName)}
            </p>
            <span className="lightbox-brand">{product.brand}</span>
          </div>
          <h1 className="lightbox-title display-font">{text.name}</h1>
          {text.description && <p>{text.description}</p>}
          <div className="lightbox-commerce">
            <span className="lightbox-price">{getPriceLabel(product, t)}</span>
            <ProductWhatsApp product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
