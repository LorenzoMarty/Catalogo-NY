const rawAssetUrls = import.meta.glob('/src/assets/{products,ui}/**/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

const ABSOLUTE_URL_PATTERN = /^(?:data:|https?:\/\/|\/)/i;

export function resolveAssetPath(path: string | null | undefined): string {
  if (!path) {
    return '';
  }

  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/\\/g, '/').replace(/^\.\//, '');
  const sourcePath = normalizedPath.startsWith('assets/')
    ? `/src/${normalizedPath}`
    : `/src/assets/${normalizedPath}`;

  return rawAssetUrls[sourcePath] ?? path;
}

export function resolveSrcSet(srcset: string | null | undefined): string | undefined {
  if (!srcset) {
    return undefined;
  }

  return srcset
    .split(',')
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      return [resolveAssetPath(url), ...descriptor].join(' ');
    })
    .join(', ');
}
