const ASSUMED_IPD_MM = 63

/**
 * Draws glasses onto a canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {{ x: number, y: number }} leftIrisPx   - Left iris in canvas pixels (scale + angle)
 * @param {{ x: number, y: number }} rightIrisPx  - Right iris in canvas pixels (scale + angle)
 * @param {{ x: number, y: number }} noseBridgePx - Nose bridge landmark in canvas pixels (vertical anchor)
 * @param {Object} measurements
 */
export function drawGlasses(ctx, img, leftIrisPx, rightIrisPx, noseBridgePx, measurements) {
  if (!img.complete || img.naturalWidth === 0) return
  if (!leftIrisPx || !rightIrisPx || !noseBridgePx) return

  const { x: lx, y: ly } = leftIrisPx
  const { x: rx, y: ry } = rightIrisPx

  const ipdPx = Math.sqrt((rx - lx) ** 2 + (ry - ly) ** 2)
  if (ipdPx < 10) return

  const pxPerMm = ipdPx / ASSUMED_IPD_MM
  const targetWidthPx = measurements.frame_width_mm * pxPerMm

  const imgW = measurements.svg_viewbox_width ?? img.naturalWidth
  const imgH = measurements.svg_viewbox_height ?? img.naturalHeight

  const frameFraction = measurements.frame_x_fraction ?? 1.0
  const scale = targetWidthPx / (imgW * frameFraction)
  const renderedW = imgW * scale
  const renderedH = imgH * scale

  // Horizontal center: midpoint between irises
  const cx = (lx + rx) / 2
  // Vertical anchor: nose bridge landmark — this is where the glasses arc actually sits,
  // not the iris midpoint which is slightly higher
  const cy = noseBridgePx.y
  const angle = Math.atan2(ry - ly, rx - lx)

  const yOffset = (measurements.y_offset_ratio ?? 0) * renderedH
  const blendMode = measurements.blend_mode ?? 'source-over'

  ctx.save()
  ctx.globalCompositeOperation = blendMode
  ctx.translate(cx, cy + yOffset)
  ctx.rotate(angle)
  ctx.drawImage(img, -renderedW / 2, -renderedH / 2, renderedW, renderedH)
  ctx.restore()
}
