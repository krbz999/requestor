import {setupApi} from "./scripts/api.mjs";
import {appendButtonListeners, createMessagePopout} from "./scripts/appendButtonListeners.mjs";
import {cleanUpUser} from "./scripts/cleanUpUser.mjs";
import {settings} from "./scripts/settings.mjs";

Hooks.on("renderChatMessage", appendButtonListeners);
Hooks.once("renderChatLog", cleanUpUser);
Hooks.once("setup", settings);
Hooks.once("setup", setupApi);
Hooks.on("createChatMessage", createMessagePopout);
