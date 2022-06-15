import { CONSTS } from "./const.mjs";

export function registerSettings(){
	_registerSettings();
}

function _registerSettings(){
	const {TRUST_MODE, GM_ONLY, GM_OWN, FREE, USE_SYSTEM_CLASS} = CONSTS.SETTING_NAMES;
	
	game.settings.register(CONSTS.MODULE_NAME, USE_SYSTEM_CLASS, {
		name: "Use System Cards (experimental)",
		hint: "Attempt to use the system's UI for Requestor chat cards. This may not work for all systems.",
		scope: "world",
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register(CONSTS.MODULE_NAME, TRUST_MODE, {
		name: "Change Permissions",
		hint: `
			DO NOT CHANGE THIS SETTING IF YOU DO NOT FULLY TRUST YOUR PLAYERS.
			This changes the permissions for who can make and accept requests.
			(1) GM ONLY: Only the GM can make requests, and players can only click buttons made by a GM.
			(2) GM and OWN: Anyone can make requests, and players can only click buttons made by a GM or themselves.
			(3) FREE: Anyone can make requests, and anyone can click any buttons.`,
		scope: "world",
		config: true,
		type: String,
		default: GM_ONLY,
		choices: {
			[GM_ONLY]: "[GM ONLY] - Request: GM only. Accept: Only if GM requested",
			[GM_OWN]: "[GM and OWN] - Request: Anyone. Accept: Only if GM or self",
			[FREE]: "[FREE] - Request: Anyone. Accept: Anyone"
		}
	});
}