import { Requestor } from "./requestor.mjs";
import { CONST } from "./const.mjs";

export class api {
	
	static register(){
		api.globals();
	}
	
	static globals(){
		globalThis.Requestor = {
			request: Requestor._createCard,
			abilitySave: Requestor._createCard_SAVE,
			abilityTest: Requestor._createCard_CHECK,
			rollSkill: Requestor._createCard_SKILL,
			itemRoll: Requestor._createCard_ROLL,
			itemGrant: Requestor._createCard_GRANT,
			diceRoll: Requestor._createCard_DICE,
			measureTemplate: Requestor._createCard_TEMPLATE,
			grantMuffin: Requestor._createCard_MUFFIN,
			CONST: {LIMIT: CONST.LIMIT}
		}
	}
}