import { MODULE } from "./_constants.mjs";

// create popout if such context is provided.
export function popoutHelpers(message, context) {
  // is popout set true.
  const popout = foundry.utils.getProperty(context, "requestor.popout");
  if (!popout) return;

  // if whispered, you must be a recipient, GM, or creator.
  if (message.whisper.length > 0) {
    const show = [
      game.user.isGM,
      message.whisper.includes(game.user.id),
      message.user === game.user.id
    ].includes(true);

    if (!show) return;
  }

  // passed values, with defaults.
  const {
    scale = 1.25,
    left = (window.innerWidth - Dialog.defaultOptions.width) / 2,
    top = 100
  } = context[MODULE];

  // create chat popout.
  new ChatPopout(message, { scale, left, top }).render(true);
}

// close all popouts of a message.
export function closeAllPopouts(message) {
  for (const value of Object.values(message.apps)) {
    if (value?.popOut && value?.rendered) {
      value.close();
    }
  }
}
