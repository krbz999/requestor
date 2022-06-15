import { REQUESTOR } from "./requestor.mjs";
import { CONSTS } from "./const.mjs";

export class api {
	
	static register(){
		api.globals();
	}
	
	static globals(){
		globalThis.Requestor = {
			CONST: {LIMIT: CONSTS.LIMIT},
			request: REQUESTOR._createCard,
			itemGrant: REQUESTOR._createCard_GRANT,
			diceRoll: REQUESTOR._createCard_DICE
		}
	}
	
	static globalsDND5E(){
		Requestor.abilitySave = REQUESTOR._createCard_SAVE;
		Requestor.abilityTest = REQUESTOR._createCard_CHECK;
		Requestor.rollSkill = REQUESTOR._createCard_SKILL;
		Requestor.measureTemplate = REQUESTOR._createCard_TEMPLATE;
		Requestor.grantMuffin = REQUESTOR._createCard_MUFFIN;
		Requestor.itemRoll = REQUESTOR._createCard_ROLL;
	}
}