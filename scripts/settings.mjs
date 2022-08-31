import { CONSTS } from "./const.mjs";

export function registerSettings(){
	_registerSettings();
}

function _registerSettings(){
	const {TRUST_MODE, GM_ONLY, GM_OWN, FREE, USE_SYSTEM_CLASS, EXCLUDE_IMAGE} = CONSTS.SETTING_NAMES;
	
	game.settings.register(CONSTS.MODULE_NAME, USE_SYSTEM_CLASS, {
		name: game.i18n.localize("REQUESTOR.Setting.UseSystemClass.Name"),
		hint: game.i18n.localize("REQUESTOR.Setting.UseSystemClass.Hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register(CONSTS.MODULE_NAME, EXCLUDE_IMAGE, {
		name: game.i18n.localize("REQUESTOR.Setting.ExcludeImage.Name"),
		hint: game.i18n.localize("REQUESTOR.Setting.ExcludeImage.Hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register(CONSTS.MODULE_NAME, TRUST_MODE, {
		name: game.i18n.localize("REQUESTOR.Setting.TrustMode.Name"),
		hint: game.i18n.localize("REQUESTOR.Setting.TrustMode.Hint"),
		scope: "world",
		config: true,
		type: String,
		default: GM_ONLY,
		choices: {
			[GM_ONLY]: game.i18n.localize("REQUESTOR.Setting.TrustMode.Choice1"),
			[GM_OWN]: game.i18n.localize("REQUESTOR.Setting.TrustMode.Choice2"),
			[FREE]: game.i18n.localize("REQUESTOR.Setting.TrustMode.Choice3")
		}
	});
}
