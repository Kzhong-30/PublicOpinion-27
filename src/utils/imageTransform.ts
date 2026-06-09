export interface ImageRect {
  dx: number
  dy: number
  dw: number
  dh: number
}

export function calcImageRect(
  backgroundImage: HTMLImageElement | null,
  pageWidth: number,
  pageHeight: number
): ImageRect {
  if (!backgroundImage) return { dx: 0, dy: 0, dw: pageWidth, dh: pageHeight }
  const imgRatio = backgroundImage.width / backgroundImage.height
  const canvasRatio = pageWidth / pageHeight
  let dw: number, dh: number, dx: number, dy: number
  if (imgRatio > canvasRatio) {
    dh = pageHeight
    dw = backgroundImage.width * (pageHeight / backgroundImage.height)
    dx = (pageWidth - dw) / 2
    dy = 0
  } else {
    dw = pageWidth
    dh = backgroundImage.height * (pageWidth / backgroundImage.width)
    dx = 0
    dy = (pageHeight - dh) / 2
  }
  return { dx, dy, dw, dh }
}

export function remapPixelsToImageRect<
  T extends { x: number; y: number }
>(
  pixels: T[],
  srcPageWidth: number,
  srcPageHeight: number,
  rect: ImageRect
): T[] {
  const scaleX = rect.dw / srcPageWidth
  const scaleY = rect.dh / srcPageHeight
  return pixels.map(p => ({
    ...p,
    x: rect.dx + p.x * scaleX,
    y: rect.dy + p.y * scaleY
  }))
}
