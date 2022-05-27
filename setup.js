import { CONST } from "./scripts/const.mjs";
import { registerSettings } from "./scripts/settings.mjs";
import { api } from "./scripts/api.mjs";

Hooks.on("init", () => {
    registerSettings();
	api.register();
});