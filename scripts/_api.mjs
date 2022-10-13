import { request } from "./requestor.mjs";
import { DEMOS } from "./demos.mjs";
import { LIMIT, PERMISSION, TYPE } from "./_constants.mjs";

export function setup_api() {
  globalThis.Requestor = {
    LIMIT: LIMIT,
    TYPE: TYPE,
    PERMISSION: PERMISSION,
    request: request,
    grantItem: DEMOS.grantItem,
    diceRoll: DEMOS.diceRoll
  }

  if (game.system.id === "dnd5e") {
    Requestor.dnd5e = {
      rollAbilitySave: DEMOS.abilitySave,
      rollAbilityTest: DEMOS.abilityTest,
      rollSkill: DEMOS.skillCheck,
      placeMeasuredTemplate: DEMOS.createMeasuredTemplate,
      grantMuffin: DEMOS.grantMuffin,
      useItem: DEMOS.useItem
    }
  }
}
