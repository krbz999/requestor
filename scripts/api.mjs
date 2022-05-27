import { Requestor } from "./requestor.mjs";

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
			grantMuffin: Requestor._createCard_MUFFIN
		}
	}
}