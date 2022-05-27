import { Requestor } from "./requestor.mjs";

export class api {
	
	static register(){
		api.globals();
	}
	
	static globals(){
		globalThis.Requestor = {
			request: Requestor._createCard,
			requestSave: Requestor._createCard_SAVE,
			requestCheck: Requestor._createCard_CHECK,
			requestSkill: Requestor._createCard_SKILL,
			requestItemRoll: Requestor._createCard_ROLL,
			requestItemGrant: Requestor._createCard_GRANT,
			requestDiceRoll: Requestor._createCard_DICE,
			grantMuffin: Requestor._createCard_MUFFIN
		}
	}
}