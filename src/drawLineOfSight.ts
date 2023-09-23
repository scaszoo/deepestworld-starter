import {hasLineOfSight} from "./lineOfSight";

dw.on('drawEnd', (ctx, cx, cy) => {
  const {width, height} = ctx.canvas
  const mx = width / 2
  const my = height / 2

  const transpose = (wx: number, wy: number) => [
    mx + Math.floor((wx - cx) * 96),
    my + Math.floor((wy - cy) * 96),
  ]

  dw.entities.forEach((entity) => {
    if (!('ai' in entity)) {
      return
    }

    const [x, y] = transpose(entity.x, entity.y)
    ctx.strokeStyle = hasLineOfSight(entity) ? "#00ff0080" : "#ff000080"
    ctx.beginPath()
    ctx.moveTo(mx, my)
    ctx.lineTo(x, y)
    ctx.stroke()
  })
})
