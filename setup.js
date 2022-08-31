import { CONSTS } from "./scripts/const.mjs";
import { registerSettings } from "./scripts/settings.mjs";
import { api } from "./scripts/api.mjs";

Hooks.once("init", () => {
	console.log(`${CONSTS.MODULE_TITLE_SHORT} | Initializing ${CONSTS.MODULE_TITLE}`);
	registerSettings();
	api.register();
});
