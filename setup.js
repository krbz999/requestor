import { CONSTS } from "./scripts/const.mjs";
import { registerSettings } from "./scripts/settings.mjs";
import { api } from "./scripts/api.mjs";
import { REQUESTOR } from "./scripts/requestor.mjs";

Hooks.once("init", () => {
	console.log(`${CONSTS.MODULE_TITLE_SHORT} | Initializing ${CONSTS.MODULE_TITLE}`);
	registerSettings();
	api.register();
});

Hooks.on("renderChatLog", REQUESTOR._onClickButton);
Hooks.on("renderChatPopout", REQUESTOR._onClickButton);

Hooks.on("renderChatMessage", REQUESTOR._setDisabledStateMessageRender);
Hooks.on("renderChatLog", REQUESTOR._removeDeprecatedFlags);

Hooks.on("createChatMessage", REQUESTOR._popoutFocusMessage);
