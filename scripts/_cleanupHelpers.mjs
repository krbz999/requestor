import { MODULE } from "./_constants.mjs";

export async function cleanUp() {
  // set up display of player-only and GM-only content.
  const displayPlayer = game.user.isGM ? "none" : "block";
  const displayGM = game.user.isGM ? "block" : "none";
  const p = "--requestor-display-player";
  const g = "--requestor-display-gm";
  document.documentElement.style.setProperty(p, displayPlayer);
  document.documentElement.style.setProperty(g, displayGM);

  // remove user flags if the message is gone.
  const flags = game.user.getFlag(MODULE, "messageIds");
  if (!flags) return;
  const updates = Object.keys(flags).reduce((acc, id) => {
    const message = game.messages.get(id);
    if (!message) {
      acc[`flags.${MODULE}.messageIds.-=${id}`] = null;
    }
    return acc;
  }, {});
  return game.user.update(updates);
}
