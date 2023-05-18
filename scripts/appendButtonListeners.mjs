import {LIMIT, MODULE} from "./constants.mjs";

/**
 * Add event listener to rendered chat message.
 * @param {ChatMessage} message     The rendered chat message.
 * @param {HTMLElement} html        The element of the message.
 */
export function appendButtonListeners(message, html) {
  html[0].querySelectorAll("button[data-action='requestor']").forEach(n => {
    n.addEventListener("click", clickButton.bind(message));
    applyDisabled.call(message, n);
  });
}

/**
 * Apply 'disabled' attribute to a button if it should be disabled for a user.
 * @param {HTMLElement} button      The button element.
 */
function applyDisabled(button) {
  const id = button.dataset.functionId;
  const limit = this.flags[MODULE][id].limit;
  if (limit === LIMIT.ONCE) {
    // If the user has already clicked this once-only button, disable it.
    let clicked = game.user.flags[MODULE]?.clicked;
    if (!(clicked instanceof Array)) clicked = [];
    if (clicked.includes(id)) button.disabled = true;
  } else if (limit === LIMIT.OPTION) {
    // If the user has already clicked one of these option buttons, disable it.
    let clicked = game.user.flags[MODULE]?.clickedOption;
    if (!(clicked instanceof Array)) clicked = [];
    if (clicked.includes(this.id)) button.disabled = true;
  }
}

/**
 * Execute the embedded function when clicking a button. Note that 'this' is the message that has the button.
 * @param {PointerEvent} event      The initiating click event.
 */
async function clickButton(event) {
  const button = event.currentTarget;
  button.disabled = true;

  // The id of the function to call.
  const functionId = button.dataset.functionId;

  // The script and its arguments.
  const data = this.flags[MODULE][functionId];

  // Bail out due to limitation settings.
  if (data.limit === LIMIT.ONCE) {
    // If the user has already clicked this once-only button, bail out.
    let clicked = game.user.flags[MODULE]?.clicked;
    if (!(clicked instanceof Array)) clicked = [];
    if (clicked.includes(functionId)) return;
    else {
      clicked.push(functionId);
      await game.user.setFlag(MODULE, "clicked", clicked);
    }
  } else if (data.limit === LIMIT.OPTION) {
    // If the user has already clicked one of these option buttons, bail out.
    let clicked = game.user.flags[MODULE]?.clickedOption;
    if (!(clicked instanceof Array)) clicked = [];
    if (clicked.includes(this.id)) return;
    else {
      clicked.push(this.id);
      await game.user.setFlag(MODULE, "clickedOption", clicked);
    }
  }

  // Create the function to call.
  const body = `(
    ${data.command || data.action}
  )()`;
  const fn = Function("token", "character", "actor", "event", ...Object.keys(data.scope), body);

  // Define the helper variables.
  const character = game.user.character;

  // If 'tokenId' is passed as an argument, 'token' is instead that token on the canvas.
  let token;
  if ("tokenId" in data.scope) token = canvas?.tokens.get(data.scope.tokenId);
  else token = canvas?.tokens.controlled[0] ?? game.user.character?.getActiveTokens()[0];

  // If 'actorId' is passed as an argument, 'actor' is instead that actor
  let actor;
  if ("actorId" in data.scope) actor = game.actors.get(data.scope.actorId);
  else actor = token?.actor ?? game.user.character;

  // Close all popouts that belong to this chat message.
  if (this.flags[MODULE]?.options?.autoclose === true) {
    for (const value of Object.values(this.apps)) {
      if (value.popOut && value.rendered) value.close();
    }
  }

  // Enable the button again.
  if ((data.limit !== LIMIT.ONCE) && (data.limit !== LIMIT.OPTION)) button.disabled = false;

  // Execute the embedded function.
  return fn.call(data.scope, token, character, actor, event, ...Object.values(data.scope));
}

/**
 * Create a popout of a message if called for, and if the user can view it.
 * @param {ChatMessage} message     The created chat message.
 * @returns {ChatPopout}            The created popout.
 */
export function createMessagePopout(message) {
  if ((message.flags[MODULE]?.options?.popout !== true) || !message.visible) return;
  return new ChatPopout(message).render(true);
}
