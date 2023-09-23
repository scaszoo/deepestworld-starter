// import { character } from 'dw'
import './drawNamesPlates'
import './drawLineOfSight'
import './autoCombine'

const attackMode = true
dw.debug = true
const LEADER = 'Ganjaman'
let lastUsedPortal = -1

async function attack(target: DeepestWorld.Entity) {
  if (!attackMode) {
    return
  }

  // const target = dw.findClosestMonster()
  if (!target) {
    // No target found
    return
  }

  // Show target in game UI
  dw.setTarget(target.id)

  // const skillIndex = dw.character.skills.findIndex(
  //   (skill) => skill && skill.md === 'attackRune' // physbolt1 / attackRun
  // )

  // let's find the best skill
  let maxDmg = 0
  let indexMaxDmg = 0
  dw.character.skills.forEach((skill, index) => {
    if (skill && (skill.md === 'attackRune' || skill.md === 'physbolt1')) {
      const dmg = ((skill.phys || 0) + (skill.cold || 0) + (skill.elec || 0) + (skill.fire || 0) + (skill.acid || 0))
      if (maxDmg < dmg) {
        maxDmg = dmg
        indexMaxDmg = index
      }
    }
  })
  const skillIndex = indexMaxDmg
  console.log('chosen weapon: ', dw.character.skills[indexMaxDmg].md, maxDmg) // JSON.stringify(dw.character.skills[indexMaxDmg], null, 2),

  if (skillIndex === -1) {
    // No attackRune found
    return
  }

  if (!dw.isSkillInRange(skillIndex, target.x, target.y)) {
    // Too far away
    dw.move(target.x, target.y)
    return
  }

  if (!dw.isSkillReady(skillIndex)) {
    // Skill is on cooldown
    return
  }

  dw.useSkill(skillIndex, target.id)
}

setInterval(async function () {
  if (dw.character.party!.length < 1){
    console.log('SOLO MODE')
    // Solo mode
    const target = dw.findClosestMonster()
    if (!target) {
      // Empty entity array, undefined target
      return
    }
    await attack(target)

    return
  }

  const partyLeaderName = dw.character.party!.find((character) => character.leader)?.name

  if (!partyLeaderName) {
    dw.partyPromote(LEADER)
    return
  }

  const partyLeader = dw.findEntities((entity) => 'player' in entity && entity.name === partyLeaderName).shift()

  if (!dw.character.combat && !partyLeader) {

    return
  }
  if (!partyLeader) {
    let portal: any = dw.findEntities(
      (e) => e.md === 'portal' && e.charDbId === dw.character.charDbId && portal.id != lastUsedPortal
    ).shift()

    if (!portal) {
      const portalScrollIndex = dw.character.bag.findIndex((i) => i && i.md === 'portalScroll')
      if (portalScrollIndex === -1) {
        dw.log('No more portal scrolls')
        return
      }
      console.log('### portalScrollIndex', portalScrollIndex)

      dw.openPortal(portalScrollIndex, LEADER)
      await new Promise((resolve) => setTimeout(resolve, 100))

      portal = dw.findEntities(
        (e) => e.md === 'portal' && e.charDbId === dw.character.charDbId
      ).shift()
    }

    dw.enterPortal(portal.id)
    console.log('Departing portal id:', portal.id)
    await new Promise((resolve) => setTimeout(resolve, 10))

    // Find the arrival portal id
    const arrivalPortal = dw.findEntities(
      (e) => e.md === 'portal' && e.charDbId === dw.character.charDbId
    ).shift()
    console.log('Destination portal id:', arrivalPortal?.id)
    lastUsedPortal = arrivalPortal?.id || -1

    return
  }

  // stay close !
  dw.move(partyLeader.x, partyLeader.y)

  const debug = dw.findEntities((e) => 'ai' in e && !!e.targetId && !!e.targetId && !!dw.character.party?.some((c) => c.id === e.targetId))
  let target = dw.findEntities((e) => 'ai' in e && !!e.targetId && !!e.targetId && !!dw.character.party?.some((c) => c.id === e.targetId)).shift()
  if (!target) {
    // Empty entity array, undefined target
    return
  }
  const debug2 = debug.filter(t => 'ai' in t).map(t => {return {targetId: t.targetId, id: t.id, partyLeader: t.targetId === partyLeader.id}})
  console.log('Combat:', JSON.stringify(debug2, null, 2),
    '\nparty leader under attack?:', debug.some((e) => 'ai' in e && !!e.targetId && e.targetId === partyLeader.id),
    '\nAm I under attack?:', debug.some((e) => 'ai' in e && !!e.targetId && e.targetId === dw.character.id))

  await attack(target)

  console.log('######################################\n')
  // dw.emit('talkParty', {m: 'Ick glob ja wohl et hackt, Keule!'})
}, 250)
