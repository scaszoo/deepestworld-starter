const SCALE = 96

function getMonsterBattleScore(monster: DeepestWorld.Monster) {
    // Magic Shrubs don't attack back
    if (monster.md.startsWith('magicShrub')) return 1

    return monster.hp * getMonsterDmg(monster)
}

function getMonsterDmg(monster: DeepestWorld.Monster) {
    return 19 * Math.pow(1.1, monster.level) * (1 + (monster.r ?? 0) * 0.5)
}

function getMyDmg() {
    let maxDmg = 0
    for (const skill of dw.character.skills) {
        if (!skill || skill.md.match(/heal|lifeshield/)) {
            continue
        }

        const dmg = (skill?.phys ?? 0) + (skill?.fire ?? 0) + (skill.acid ?? 0) + (skill.cold ?? 0) + (skill.elec ?? 0)
        if (dmg > maxDmg) {
            maxDmg = dmg
        }
    }

    return maxDmg
}

function getMyBattleScore(useFullHp = false) {
    return getMyDmg() * (useFullHp ? dw.character.hpMax : dw.character.hp)
}

const entitiesSmoothPosition = new Map()
setInterval(function () {
    const currentEntities = new Set()

    for (const entity of dw.findEntities((e) => 'ai' in e)) {
        currentEntities.add(entity.id)

        if (!entitiesSmoothPosition.has(entity.id)) {
            entitiesSmoothPosition.set(entity.id, {x: entity.x, y: entity.y})
        }

        const smoothPosition = entitiesSmoothPosition.get(entity.id)
        if (!smoothPosition) {
            continue
        }

        let dx = entity.x - smoothPosition.x
        let dy = entity.y - smoothPosition.y
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            smoothPosition.x += dx
            smoothPosition.y += dy
        } else {
            smoothPosition.x += dx / 10
            smoothPosition.y += dy / 10
        }
    }

    for (const entityId of entitiesSmoothPosition.keys()) {
        if (!currentEntities.has(entityId)) {
            entitiesSmoothPosition.delete(entityId)
        }
    }
}, 16)

function getSmoothPosition(entity: DeepestWorld.Monster) {
    const smoothPosition = entitiesSmoothPosition.get(entity.id)
    if (smoothPosition) {
        return smoothPosition
    }

    return { x: entity.x, y: entity.y }
}

dw.on('drawEnd', (ctx, cx, cy) => {
    const {width, height} = ctx.canvas
    const mx = width / 2
    const my = height / 2

    const transpose = (wx: number, wy: number) => [
        mx + Math.floor((wx - cx) * SCALE),
        my + Math.floor((wy - cy) * SCALE),
    ]

    for (let i = 0; i < dw.entities.length; i++) {
        const entity = dw.entities[i]
        if (!('ai' in entity) || entity.l !== dw.c.l) {
            continue
        }

        const smoothPosition = getSmoothPosition(entity)

        const [x, y] = transpose(
            smoothPosition.x,
            smoothPosition.y,
        )

        ctx.lineWidth = 2

        if (entity.targetId) {
            if (entity.hp !== entity.hpMax) {
                ctx.fillStyle = "darkred"
                ctx.beginPath()
                ctx.rect(x - SCALE * 0.5, y + 8, SCALE, 8)
                ctx.fill()
            }

            ctx.fillStyle = "red"
            ctx.beginPath()
            ctx.rect(x - SCALE * 0.5, y + 8, SCALE * entity.hp / entity.hpMax, 8)
            ctx.fill()

            ctx.strokeStyle = "black"
            ctx.beginPath()
            ctx.rect(x - SCALE * 0.5, y + 8, SCALE, 8)
            ctx.stroke()
        }

        ctx.lineWidth = 4
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        if (entity.bad) {
            ctx.fillStyle = "orange"
        }

        if (entity.targetId === dw.c.id) {
            ctx.fillStyle = "red"
        }

        ctx.textAlign = "left"
        ctx.font = "14px system-ui"
        ctx.strokeText(entity.md, x, y + 32)
        ctx.fillText(entity.md, x, y + 32)
        ctx.font = "12px system-ui"
        const monsterBattleScore = getMonsterBattleScore(entity).toLocaleString(undefined, {maximumFractionDigits: 0})
        ctx.strokeText(monsterBattleScore, x, y + 48)
        ctx.fillText(monsterBattleScore, x, y + 48)
        ctx.textAlign = "center"
        const skulls = '💀'.repeat(entity.r ?? 0) + (entity.md.includes('Healer') ? '❤️‍🩹' : '') + (entity.md.includes('alarm') ? '🔔' : '')
        if (skulls.length > 0) {
            ctx.strokeText(skulls, x, y + 68)
            ctx.fillText(skulls, x, y + 68)
        }
        ctx.font = "32px system-ui"
        ctx.textAlign = "right"
        ctx.strokeText(`${entity.level}`, x - 8, y + 48)
        ctx.fillText(`${entity.level}`, x - 8, y + 48)
    }

    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"

    ctx.textAlign = "left"
    ctx.font = "14px system-ui"
    ctx.strokeText(dw.c.name, mx, my - 112)
    ctx.fillText(dw.c.name, mx, my - 112)
    ctx.font = "12px system-ui"
    const myBattleScore = getMyBattleScore(true).toLocaleString(undefined, {maximumFractionDigits: 0})
    ctx.strokeText(myBattleScore, mx, my - 96)
    ctx.fillText(myBattleScore, mx, my - 96)
    ctx.font = "32px system-ui"
    ctx.textAlign = "right"
    ctx.strokeText(`${dw.c.level}`, mx - 8, my - 96)
    ctx.fillText(`${dw.c.level}`, mx - 8, my - 96)
})
