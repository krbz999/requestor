import {MODULE} from "./constants.mjs";

/**
 * Set up the player-only and gm-only css, and clean any deprecated ids from the user document.
 * @returns {User}      The updated user.
 */
export async function cleanUpUser() {
  // set up display of player-only and GM-only content.
  const style = document.documentElement.style;
  style.setProperty("--requestor-display-player", game.user.isGM ? "none" : "block");
  style.setProperty("--requestor-display-gm", game.user.isGM ? "block" : "none");

  // Remove unneeded flags.
  const data = game.user.flags[MODULE];
  if (!data) return;
  const update = {};
  if (data.clicked?.length) {
    update[`flags.${MODULE}.clicked`] = data.clicked.filter(id => {
      return document.querySelector(`button[data-function-id="${id}"]`);
    });
  }
  if (data.clickedOption?.length) {
    update[`flags.${MODULE}.clickedOption`] = data.clickedOption.filter(id => {
      return game.messages.get(id);
    });
  }
  return game.user.update(update);
}
