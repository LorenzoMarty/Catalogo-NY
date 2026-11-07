import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPriceLabel, getWhatsAppHref, ProductMedia } from '../components/catalog/CatalogSection';
import { CatalogProvider, useCatalog } from '../context/CatalogContext';
import { applyProductMeta, buildProductMeta } from '../seo/productMeta';
import { productIdFromSlug } from '../utils/productSlug';
import { CSSVars } from '../utils/styles';

export function ProductPage() {
  return (
    <CatalogProvider>
      <ProductDetail />
    </CatalogProvider>
  );
}

function ProductDetail() {
  const { slug = '' } = useParams();
  const { pathname, key } = useLocation();
  const navigate = useNavigate();
  const { searchProducts, source } = useCatalog();
  const id = productIdFromSlug(slug);
  const product = searchProducts.find((p) => p.id === id) ?? null;

  useEffect(() => {
    if (!product) return;
    const image = product.imageAsset?.src;
    const origin = window.location.origin;
    return applyProductMeta(
      buildProductMeta(
        { ...product, price: getPriceLabel(product) },
        origin,
        pathname,
        image ? new URL(image, origin).href : undefined,
      ),
    );
  }, [product, pathname]);

  // Back returns to the previous page (the catalog with its filters in the URL); a direct
  // visit has no history entry of ours, so it goes to the home page instead.
  const goBack = () => (key === 'default' ? navigate('/') : navigate(-1));

  if (!product) {
    return (
      <main className="product-page">
        <h1 className="display-font">
          {source === 'loading' ? 'Carregando produto…' : 'Produto não encontrado'}
        </h1>
        <Link className="lightbox-page-link" to="/">
          Voltar ao catálogo
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
        ← Voltar ao catálogo
      </button>
      <div className="lightbox-shell">
        <div className="lightbox-media">
          <ProductMedia product={product} variant="lightbox" />
        </div>
        <div className="lightbox-copy">
          <div className="lightbox-head">
            <p className="lightbox-sector font-mono">{product.sectorName}</p>
            <span className="lightbox-brand">{product.brand}</span>
          </div>
          <h1 className="lightbox-title display-font">{product.name}</h1>
          {product.description && <p>{product.description}</p>}
          <div className="lightbox-commerce">
            <span className="lightbox-price">{getPriceLabel(product)}</span>
            <a
              className="lightbox-whatsapp"
              href={getWhatsAppHref(product)}
              rel="noreferrer"
              target="_blank"
            >
              Entrar em contato no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
