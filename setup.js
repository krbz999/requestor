import { setup_api } from "./scripts/_api.mjs";
import { setup_chatListeners } from "./scripts/_chatListeners.mjs";
import { setup_cleanupHelpers } from "./scripts/_cleanupHelpers.mjs";
import { setup_popoutHelpers } from "./scripts/_popoutHelpers.mjs";
import { setup_settings } from "./scripts/_settings.mjs";

Hooks.once("init", () => {
	console.log("ZHELL | Initializing Requestor");
	
	setup_api();
	setup_settings();
	setup_chatListeners();
	setup_cleanupHelpers();
	setup_popoutHelpers();
});
