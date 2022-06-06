import { CONST } from "./scripts/const.mjs";
import { registerSettings } from "./scripts/settings.mjs";
import { api } from "./scripts/api.mjs";

Hooks.once("init", () => {
	console.log(`${CONST.MODULE_TITLE_SHORT} | Initializing ${CONST.MODULE_TITLE}`);
    registerSettings();
	api.register();
});