import { LIMIT, MODULE, TRUST_MODE, TRUST_OPTIONS } from "./_constants.mjs";
import { closeAllPopouts } from "./_popoutHelpers.mjs";

// add event listener to chat log.
export function onClickButton(chatLog, html) {
  html[0].addEventListener("click", async (event) => {
    // make sure it's a Requestor button.
    const button = event.target?.closest(`button[id="${MODULE}"]`);
    if (!button) return;

    // get the button index (starting at 0).
    const buttonIndex = Number(button.dataset.index);

    // get the chat card.
    const card = button.closest(".chat-card");
    const cardHTML = card.closest(".message");
    const messageId = cardHTML.dataset.messageId;
    const message = game.messages.get(messageId);

    // get the args.
    const args = message.getFlag(MODULE, "args.buttonData")[buttonIndex];
    const limit = args.limit;

    // if it is only allowed to be clicked once, and is already clicked, bail out.
    const clickedKey = `messageIds.${messageId}.${buttonIndex}.clicked`;
    const clickedButton = !!game.user.getFlag(MODULE, clickedKey);
    if ((limit === LIMIT.ONCE) && clickedButton) return;

    // if it is one of several options, and an option on this message has already been clicked, bail out.
    const clickedOptionKey = `messageIds.${messageId}.clickedOption`;
    const clickedCardOption = !!game.user.getFlag(MODULE, clickedOptionKey);
    if ((limit === LIMIT.OPTION) && clickedCardOption) return;

    // bail out if user is not allowed to click this button.
    const trustMode = game.settings.get(MODULE, TRUST_MODE);
    if (!message.user.isGM) {
      if (trustMode === TRUST_OPTIONS.GM_ONLY) {
        const string = "REQUESTOR.WARN.GM_ONLY";
        const warning = game.i18n.localize(string);
        ui.notifications.warn(warning);
        return;
      }
      if (trustMode === TRUST_OPTIONS.GM_OWN) {
        if (message.user !== game.user) {
          const string = "REQUESTOR.WARN.GM_OR_OWN_ONLY";
          const warning = game.i18n.localize(string);
          ui.notifications.warn(warning);
          return;
        }
      }
    }

    // turn the card's embedded flag into a function.
    const body = `(
            ${args.action}
        )();`;
    const fn = Function("token", "character", "actor", "scene", "event", "args", body);

    // define helper variables.
    let character = game.user.character;
    let token = canvas.tokens.controlled[0] ?? character?.getActiveTokens()[0];
    let actor = token?.actor ?? character;
    let scene = canvas?.scene;

    // if button is unlimited, remove disabled attribute.
    if (limit === LIMIT.FREE) button.disabled = false;

    // if button is limited, flag user as having clicked this button.
    else if (limit === LIMIT.ONCE) {
      const key = `messageIds.${messageId}.${buttonIndex}.clicked`;
      await game.user.setFlag(MODULE, key, true);
      setMessageDisabledStates(message, [cardHTML]);
    }

    // if button is one of several options, flag user as having clicked an option on this card.
    else if (limit === LIMIT.OPTION) {
      const key = `messageIds.${messageId}.clickedOption`;
      await game.user.setFlag(MODULE, key, true);
      setMessageDisabledStates(message, [cardHTML]);
    }

    // if message context is set to close on button clicks, close all popouts.
    if (message.getFlag(MODULE, "args.context.autoClose")) {
      closeAllPopouts(message);
    }

    // set up 'this'
    const THIS = foundry.utils.duplicate(args);
    delete THIS.limit;
    delete THIS.action;
    delete THIS.label;

    // execute the embedded function.
    return fn.call(THIS, token, character, actor, scene, event, THIS);
  });
}

// set disabled state of buttons when a message is rendered.
export function setMessageDisabledStates(message) {
  if (!message) return;
  document.querySelectorAll(`[data-message-id="${message.id}"]`).forEach(node => {

    // if the message is found, get all of its buttons.
    const buttons = node.querySelectorAll(`button[id="${MODULE}"]`);

    // for each button, if the button is limited and clicked, set it to be disabled.
    // if a button is an option, and the user has clicked an option on this card, set it to be disabled.
    for (const button of buttons) {
      // get the index of the button to find the user's flag.
      const buttonIndex = button.dataset.index;

      // this flag only exists if a ONCE button has been clicked.
      const keyClicked = `messageIds.${message.id}.${buttonIndex}.clicked`;
      if (game.user.getFlag(MODULE, keyClicked)) button.disabled = true;

      // if OPTION, and an option has been clicked, disable the button.
      const keyOption = `messageIds.${message.id}.clickedOption`;
      const hasClickedOption = game.user.getFlag(MODULE, keyOption);
      const messageButtonDataArray = message.getFlag(MODULE, "args.buttonData");
      if (hasClickedOption && messageButtonDataArray.length > 0) {
        const { limit } = messageButtonDataArray[buttonIndex];
        if (limit === LIMIT.OPTION) button.disabled = true;
      }
    }
  });
}

// initial disabled state of buttons when logging in.
export function initialDisable() {
  const ids = Object.keys(game.user.getFlag(MODULE, "messageIds") ?? {});
  for (const id of ids) {
    const message = game.messages.get(id);
    if (!message) continue;
    const messageHTML = document.querySelector(`[data-message-id="${id}"]`);
    const buttons = messageHTML.querySelectorAll(`button[id="${MODULE}"]`);
    for (const button of buttons) {
      const buttonIndex = button.dataset.index;
      const keyClicked = `messageIds.${id}.${buttonIndex}.clicked`;
      if (game.user.getFlag(MODULE, keyClicked)) button.disabled = true;

      const keyOption = `messageIds.${id}.clickedOption`;
      const hasClickedOption = game.user.getFlag(MODULE, keyOption);
      const messageButtonDataArray = message.getFlag(MODULE, "args.buttonData");
      if (hasClickedOption && messageButtonDataArray.length) {
        const { limit } = messageButtonDataArray[buttonIndex];
        if (limit === LIMIT.OPTION) button.disabled = true;
      }
    }
  }
}
