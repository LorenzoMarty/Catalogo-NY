import { CatalogProductViewModel } from '../../models/catalog.models';
import { track } from '../../services/track';
import { productPath } from '../../utils/productSlug';
import { productMessage, productTargets, whatsappHref } from '../../utils/whatsapp';
import { useI18n } from '../../i18n/I18nProvider';
import { localizedText } from '../../i18n/product';

/** One WhatsApp button per target (general number, or each branch); the click is tracked. */
export function ProductWhatsApp({ product }: { readonly product: CatalogProductViewModel }) {
  const { lang, t } = useI18n();
  const url = `${window.location.origin}${productPath(product)}`;
  const text = productMessage({ ...product, name: localizedText(product, lang).name }, url, t);
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
          {target.label ? t('whatsapp.branch', { name: target.label }) : t('whatsapp.cta')}
        </a>
      ))}
    </>
  );
}
