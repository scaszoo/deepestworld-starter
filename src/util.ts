interface Coordinates {
  x: number
  y: number
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function getIntersection(a: Coordinates, b: Coordinates, c: Coordinates, d: Coordinates) {
  const bottom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y)
  if (bottom === 0) {
    return null
  }

  const tTop = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
  const uTop = (c.y - a.y) * (a.x - b.x) - (c.x - a.x) * (a.y - b.y)

  const t = tTop / bottom
  const u = uTop / bottom

  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null
  }

  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    t,
    u,
  }
}
