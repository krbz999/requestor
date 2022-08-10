import { REQUESTOR } from "./requestor.mjs";
import { CONSTANTS } from "./const.mjs";
import { DEMOS } from "./demos.mjs";

export class api {
	
	static register(){
		api.globals();
		
		if(game.system.id === "dnd5e") api.globalsDND5E();
	}
	
	static globals(){
		globalThis.Requestor = {
			LIMIT: CONSTANTS.LIMIT,
			STYLE: CONSTANTS.STYLE,
			TYPE: CONSTANTS.TYPE,
			PERMISSION: CONSTANTS.PERMISSION,
			request: REQUESTOR._createCard,
			itemGrant: DEMOS._createCard_GRANT,
			diceRoll: DEMOS._createCard_DICE
		}
	}
	
	static globalsDND5E(){
		Requestor.dnd5e = {
			abilitySave: DEMOS._createCard_SAVE,
			abilityTest: DEMOS._createCard_CHECK,
			rollSkill: DEMOS._createCard_SKILL,
			measureTemplate: DEMOS._createCard_TEMPLATE,
			grantMuffin: DEMOS._createCard_MUFFIN,
			itemRoll: DEMOS._createCard_ROLL
		}
	}
}
