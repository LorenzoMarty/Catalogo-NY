import { describe, expect, it } from 'vitest';
import { localizedText } from './product';

const product = {
  name: 'Perfume',
  description: 'Descrição',
  translations: { en: { name: 'Fragrance' }, es: { name: '  ', description: 'Descripción' } },
};

describe('localizedText', () => {
  it('uses the translation and falls back to pt per field', () => {
    expect(localizedText(product, 'en')).toEqual({ name: 'Fragrance', description: 'Descrição' });
    expect(localizedText(product, 'es')).toEqual({ name: 'Perfume', description: 'Descripción' });
    expect(localizedText(product, 'pt')).toEqual({ name: 'Perfume', description: 'Descrição' });
    expect(localizedText({ name: 'A', description: 'B' }, 'en')).toEqual({
      name: 'A',
      description: 'B',
    });
  });
});
