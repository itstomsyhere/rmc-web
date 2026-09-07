/* Logo helpers (R.017): the real Resique lockup ships as transparent PNG at 1x + @2x (no vector was supplied;
   tracing a raster mark with a face would distort it). Uploaded logos (data: URLs) have no @2x. */
export function srcSet2x(src: string): string | undefined {
  if (!src || !src.startsWith('/img/') || !/\.png$/.test(src)) return undefined
  return `${src} 1x, ${src.replace(/\.png$/, '@2x.png')} 2x`
}
