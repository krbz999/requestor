import { MODULE } from "./_constants.mjs";

export function setup_cleanupHelpers() {

  // remove user flags if the message is gone.
  Hooks.on("renderChatLog", async () => {
    // get user flags
    const flags = game.user.getFlag(MODULE, "messageIds");
    if (!flags) return;

    // for each message id, attempt to find the message.
    const updates = Object.keys(flags).reduce((acc, id) => {
      const message = game.messages.get(id);
      if (!message) return acc;
      acc[`flags.${MODULE}.messageIds.-=${id}`] = null;
      return acc;
    }, {});

    const empty = foundry.utils.isEmpty(updates);
    if (empty) return;

    return game.user.update(updates);
  });

  // set up display of player-only and GM-only content.
  Hooks.once("renderChatLog", () => {
    const displayPlayer = game.user.isGM ? "none" : "block";
    const displayGM = game.user.isGM ? "block" : "none";
    const p = "--requestor-display-player";
    const g = "--requestor-display-gm";
    document.documentElement.style.setProperty(p, displayPlayer);
    document.documentElement.style.setProperty(g, displayGM);
  });
}
