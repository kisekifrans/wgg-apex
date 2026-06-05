/** Public folder path or remote URL for next/image (never prefix with site origin). */
export function resolveCmsImageSrc(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return path.startsWith("/") ? path : `/${path}`;
}
