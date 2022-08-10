import { CONSTANTS } from "./scripts/const.mjs";
import { registerSettings } from "./scripts/settings.mjs";
import { api } from "./scripts/api.mjs";
import { REQUESTOR } from "./scripts/requestor.mjs";

Hooks.once("init", () => {
	console.log(`${CONSTANTS.MODULE_TITLE_SHORT} | Initializing ${CONSTANTS.MODULE_TITLE}`);
	registerSettings();
	api.register();
});

Hooks.on("renderChatLog", REQUESTOR._onClickButton);
Hooks.on("renderChatPopout", REQUESTOR._onClickButton);

Hooks.on("renderChatMessage", REQUESTOR._setDisabledStateMessageRender);
Hooks.on("renderChatLog", REQUESTOR._removeDeprecatedFlags);

Hooks.on("createChatMessage", REQUESTOR._popoutFocusMessage);

Hooks.once("renderChatLog", () => {
	const displayPlayer = game.user.isGM ? "none" : "block";
	const displayGM = game.user.isGM ? "block" : "none";
	document.documentElement.style.setProperty("--requestor-display-player", displayPlayer);
	document.documentElement.style.setProperty("--requestor-display-gm", displayGM);
});
