async function autoCombine() {
  const freeCombineSlots = []
  for (let i = 32; i < 40; i++) {
    if (!dw.character.bag[i]) {
      freeCombineSlots.push(i)
    }
  }

  for (let i = 0; i < 32; i++) {
    const item = dw.character.bag[i]
    if (!item || !item.n || item.n === 100) {
      continue
    }

    const freeSlot = freeCombineSlots.shift()
    if (!freeSlot) {
      continue
    }

    dw.moveItem('bag', i, 'bag', freeSlot)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  dw.combine()

  await new Promise((resolve) => setTimeout(resolve, 200))

  const freeInventorySlots = []
  for (let i = 0; i < 32; i++) {
    if (!dw.character.bag[i]) {
      freeInventorySlots.push(i)
    }
  }

  for (let i = 32; i < 40; i++) {
    const item = dw.character.bag[i]
    if (!item || item.n !== 100 && item.n) {
      continue
    }

    const freeSlot = freeInventorySlots.shift()
    if (!freeSlot) {
      continue
    }

    dw.moveItem('bag', i, 'bag', freeSlot)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

autoCombine().catch(console.error)
setInterval(autoCombine, 60 * 1000)
