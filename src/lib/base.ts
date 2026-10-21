// The site can live in a sub-folder (GitHub Pages: /repository-name/). Vite gives that folder in BASE_URL.
// Data files keep plain paths such as "/images/photo.svg": this adds the folder in front of them.

const ASSET_FOLDERS = ['/images/', '/files/', '/icons/', '/fonts/']

/** Adds the base folder to a path of a file in `public/`. Other values are returned as they are. */
export function withBase(value: string, base: string = import.meta.env.BASE_URL): string {
  const folder = base.replace(/\/+$/, '')
  if (folder === '' || !ASSET_FOLDERS.some((start) => value.startsWith(start))) return value
  return folder + value
}

/** The same value, with every asset path inside it passed through `withBase`. */
export function prefixAssets<T>(value: T, base: string = import.meta.env.BASE_URL): T {
  if (typeof value === 'string') return withBase(value, base) as T
  if (Array.isArray(value)) return value.map((item) => prefixAssets(item, base)) as T
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, prefixAssets(item, base)])) as T
  }
  return value
}
