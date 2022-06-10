import { CONSTS } from "./const.mjs";

export function registerSettings(){
	_registerSettings();
}

function _registerSettings(){
	game.settings.register(CONSTS.MODULE_NAME, CONSTS.SETTING_NAMES.TRUST_MODE, {
		name: "Enable Requesting for non-GMs",
		hint: `
			Enable this to allow non-GMs to make requests as well.
			ONLY DO THIS IF YOU KNOW AND TRUST YOUR PLAYERS.
			By default, players cannot make requests, and requests in the chat log will only work if they have been made by a GM.
			If this setting is enabled, this lock is removed.`,
		scope: "world",
		config: true,
		type: Boolean,
		default: false
	});
}
