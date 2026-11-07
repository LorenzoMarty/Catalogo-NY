import { LANG_TAGS, LANGS } from './core';

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * `<link rel="alternate" hreflang>` tags for a page URL. The language is picked by `?lang=`
 * (see detectLanguage), so each alternate is the same page with that parameter.
 */
export function hreflangLinks(url: string): string {
  const alternates = LANGS.map(
    (lang) =>
      `<link data-seo rel="alternate" hreflang="${LANG_TAGS[lang]}" href="${esc(`${url}?lang=${lang}`)}" />`,
  );
  alternates.push(`<link data-seo rel="alternate" hreflang="x-default" href="${esc(url)}" />`);
  return alternates.join('\n    ');
}
