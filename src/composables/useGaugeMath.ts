// ===== Gauge math =====
// Single source of truth for converting score → (x, y) on the open-ring.
// The ring is a 270° arc starting at SVG angle 135° (bottom-left),
// sweeping clockwise through the top (270° in SVG cos/sin terms),
// ending at SVG angle 45° (bottom-right).

export interface GaugeGeometry {
  cx: number       // ring centre x
  cy: number       // ring centre y
  radius: number   // ring radius (midline of stroke)
  strokeW: number  // stroke width
}

const START_ANGLE_DEG = 135  // bottom-left
const SWEEP_DEG       = 270  // total arc

/** Convert score (0–100) to an SVG angle (degrees), where 0=right, +y=down. */
export function scoreToSvgAngle(score: number): number {
  const clamped = Math.max(0, Math.min(100, score))
  return START_ANGLE_DEG + (clamped / 100) * SWEEP_DEG
}

/** Polar (svg-angle-deg, radius) → (x, y) given a centre. */
export function polarToXY(cx: number, cy: number, angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

/** Endpoints for a radial tick at a given score, between rInner and rOuter. */
export function radialTickEndpoints(
  geom: GaugeGeometry,
  score: number,
  rInner: number,
  rOuter: number
) {
  const angle = scoreToSvgAngle(score)
  const a = polarToXY(geom.cx, geom.cy, angle, rInner)
  const b = polarToXY(geom.cx, geom.cy, angle, rOuter)
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
}

/** Start / end points of the full 270° arc, for the path's M and A coords. */
export function arcEndpoints(geom: GaugeGeometry) {
  const start = polarToXY(geom.cx, geom.cy, START_ANGLE_DEG, geom.radius)
  const end   = polarToXY(geom.cx, geom.cy, START_ANGLE_DEG + SWEEP_DEG, geom.radius)
  return { start, end }
}

/** SVG path string for the sub-arc from scoreStart → scoreEnd along the ring. */
export function arcPathBetween(geom: GaugeGeometry, scoreStart: number, scoreEnd: number): string {
  const a0 = scoreToSvgAngle(scoreStart)
  const a1 = scoreToSvgAngle(scoreEnd)
  const p0 = polarToXY(geom.cx, geom.cy, a0, geom.radius)
  const p1 = polarToXY(geom.cx, geom.cy, a1, geom.radius)
  const sweepDelta = ((scoreEnd - scoreStart) / 100) * SWEEP_DEG
  const largeArc = Math.abs(sweepDelta) > 180 ? 1 : 0
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${geom.radius} ${geom.radius} 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
}

/** ease-out with a small overshoot near the end — the "rev" feel. */
export function easeOutRev(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  if (t < 0.72) {
    const u = t / 0.72
    // ease-out cubic, peaks at 1.07
    return (1 - Math.pow(1 - u, 3)) * 1.07
  }
  // settle from 1.07 back to 1.0
  const u = (t - 0.72) / 0.28
  const eased = 1 - Math.pow(1 - u, 2)
  return 1.07 - 0.07 * eased
}
