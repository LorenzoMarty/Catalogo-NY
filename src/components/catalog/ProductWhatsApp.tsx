import { CatalogProductViewModel } from '../../models/catalog.models';
import { track } from '../../services/track';
import { productPath } from '../../utils/productSlug';
import { productMessage, productTargets, whatsappHref } from '../../utils/whatsapp';

/** One WhatsApp button per target (general number, or each branch); the click is tracked. */
export function ProductWhatsApp({ product }: { readonly product: CatalogProductViewModel }) {
  const url = `${window.location.origin}${productPath(product)}`;
  const text = productMessage(product, url);
  const configured = productTargets();
  const targets = configured.length > 0 ? configured : [{ id: 'general', label: '', number: '' }];

  return (
    <>
      {targets.map((target) => (
        <a
          className="lightbox-whatsapp"
          href={whatsappHref(target.number, text)}
          key={target.id}
          onClick={() => track('whatsapp_click', { product: product.id, target: target.id })}
          rel="noreferrer"
          target="_blank"
        >
          {target.label ? `WhatsApp ${target.label}` : 'Entrar em contato no WhatsApp'}
        </a>
      ))}
    </>
  );
}
