import { describe, expect, it } from 'vitest';
import { hreflangLinks } from './hreflang';

describe('hreflangLinks', () => {
  it('links every language plus x-default', () => {
    const html = hreflangLinks('https://x.com/produto/a-1');
    expect(html).toContain('hreflang="pt-BR" href="https://x.com/produto/a-1?lang=pt"');
    expect(html).toContain('hreflang="es" href="https://x.com/produto/a-1?lang=es"');
    expect(html).toContain('hreflang="en" href="https://x.com/produto/a-1?lang=en"');
    expect(html).toContain('hreflang="x-default" href="https://x.com/produto/a-1"');
  });
});
