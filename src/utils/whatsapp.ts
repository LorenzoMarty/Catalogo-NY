import type { Translate } from '../i18n/core';

export interface WhatsAppTarget {
  /** 'general' or a store id. */
  readonly id: string;
  /** Empty for the general number. */
  readonly label: string;
  readonly number: string;
}

type Env = Partial<
  Pick<
    ImportMetaEnv,
    'VITE_WHATSAPP_NUMBER' | 'VITE_WHATSAPP_BENTO' | 'VITE_WHATSAPP_DUQUE' | 'VITE_WHATSAPP_MATRIZ'
  >
>;

const digits = (value: string | undefined) => (value ?? '').replace(/\D/g, '');

const BRANCHES = [
  { id: 'store-bento', label: 'Filial Bento', key: 'VITE_WHATSAPP_BENTO' },
  { id: 'store-duque', label: 'Filial Duque', key: 'VITE_WHATSAPP_DUQUE' },
  { id: 'store-matriz', label: 'Matriz', key: 'VITE_WHATSAPP_MATRIZ' },
] as const;

/** Number of one branch, falling back to the general number. Empty when nothing is set. */
export function branchNumber(storeId: string, env: Env = import.meta.env): string {
  const branch = BRANCHES.find((b) => b.id === storeId);
  return digits(branch && env[branch.key]) || digits(env.VITE_WHATSAPP_NUMBER);
}

/**
 * Who a product enquiry can go to: the general number if set, else one entry per branch that has
 * a number. Empty = nothing configured (the link then opens WhatsApp's share picker).
 */
export function productTargets(env: Env = import.meta.env): readonly WhatsAppTarget[] {
  const general = digits(env.VITE_WHATSAPP_NUMBER);
  if (general) return [{ id: 'general', label: '', number: general }];
  return BRANCHES.flatMap((b) => {
    const number = digits(env[b.key]);
    return number ? [{ id: b.id, label: b.label, number }] : [];
  });
}

export function whatsappHref(number: string, text: string): string {
  return `https://wa.me${number ? `/${number}` : ''}?text=${encodeURIComponent(text)}`;
}

export function productMessage(
  product: { name: string; brand: string },
  url: string,
  t: Translate,
): string {
  const brand = product.brand ? t('whatsapp.brandOf', { brand: product.brand }) : '';
  return `${t('whatsapp.productMessage', { name: product.name, brand })}\n${url}`;
}

export function storeMessage(store: { name: string }, t: Translate): string {
  return t('whatsapp.storeMessage', { name: store.name });
}
