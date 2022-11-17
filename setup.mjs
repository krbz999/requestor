import { setupApi } from "./scripts/_api.mjs";
import { initialDisable, onClickButton, setMessageDisabledStates } from "./scripts/_chatListeners.mjs";
import { cleanUp } from "./scripts/_cleanupHelpers.mjs";
import { popoutHelpers } from "./scripts/_popoutHelpers.mjs";
import { setupSettings } from "./scripts/_settings.mjs";

Hooks.once("init", () => {
  console.log("ZHELL | Initializing Requestor");
});

Hooks.once("setup", setupApi);
Hooks.once("setup", setupSettings);
Hooks.once("ready", initialDisable);
Hooks.once("renderChatLog", cleanUp);
Hooks.on("renderChatLog", onClickButton);
Hooks.on("renderChatPopout", onClickButton);
Hooks.on("renderChatMessage", setMessageDisabledStates);
Hooks.on("createChatMessage", popoutHelpers);
