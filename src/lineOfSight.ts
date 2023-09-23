import { getIntersection } from "./util"

export function hasLineOfSight(target: { l: number, x: number, y: number, id?: number }, cx?: number, cy?: number) {
  cx ??= dw.c.x
  cy ??= dw.c.y

  if (target.l !== dw.c.l) {
    // Wrong world layer
    return false
  }

  const l = dw.c.l

  if (target.x === cx && target.y === cy) {
    // standing on top of it
    return true
  }

  const minX = Math.min(cx, target.x)
  const maxX = Math.max(cx, target.x)
  const minY = Math.min(cy, target.y)
  const maxY = Math.max(cy, target.y)

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (dw.getTerrain(x, y, l) === 0) {
        continue
      }

      if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x, y}, {x: x+1, y})) {
        return false
      }

      if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x, y:y+1}, {x: x+1, y: y+1})) {
        return false
      }

      if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x, y}, {x: x, y:y+1})) {
        return false
      }

      if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x:x+1, y:y+1}, {x: x+1, y:y+1})) {
        return false
      }
    }
  }

  for (let i = 0; i < dw.entities.length; i++) {
    const entity = dw.entities[i]
    if (entity.id === target.id) {
      // Never collide with target
      continue
    }

    if (!(entity.md in dw.md.items) || !dw.md.items[entity.md].collision) {
      // Doesn't have collision
      continue
    }

    const hitbox = dw.md.items[entity.md].hitbox
    const x1 = entity.x - hitbox.w / 2
    const x2 = entity.x + hitbox.w / 2
    const y1 = entity.y - hitbox.h
    const y2 = entity.y

    if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x: x1, y: y1}, {x: x2, y: y1})) {
      return false
    }

    if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x: x2, y: y1}, {x: x2, y: y2})) {
      return false
    }

    if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x: x2, y: y2}, {x: x1, y: y2})) {
      return false
    }

    if (getIntersection({x: cx, y: cy}, {x: target.x, y: target.y}, {x: x1, y: y2}, {x: x1, y: y1})) {
      return false
    }
  }

  return true
}
