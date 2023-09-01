import {ICON, LIMIT, MODULE, PERMISSION, SETTINGS, TRUST_OPTIONS} from "./constants.mjs";

/**
 * Create a request message in chat.
 * @param {object[]} buttonData     An array of objects, each with 'permission', 'label', 'limit', 'command', and 'scope'.
 * @param {string} img              The image to use for the message, if any.
 * @param {string} title            The title to use for the message, defaulting to 'Request'.
 * @param {string} description      The text description to display in the message, if any.
 * @param {boolean} popout          If the message should automatically pop out for each user.
 * @param {boolean} autoclose       If the popout message should automatically close when a user clicks any button.
 * @param {number} limit            A fallback 'limit' value for each button, in case one is not specified.
 * @param {string[]} whisper        An array of user ids to whisper the message to.
 * @param {string} sound            The sound for the message to create when rendered.
 * @param {object} messageOptions   Additional options passed directly to the ChatMessage constructor
 * @returns {ChatMessage}           The created chat message.
 */
export async function request({
  buttonData = [],
  img = null,
  title = null,
  description = null,
  popout = false,
  autoclose = true,
  limit = null,
  whisper = [],
  sound = null,
  messageOptions = {}
} = {}) {
  // Bail out if the user does not have permission to use this.
  const gmOnly = game.settings.get(MODULE, SETTINGS.TRUST_MODE) === TRUST_OPTIONS.GM;
  if (gmOnly && !game.user.isGM) {
    ui.notifications.warn("REQUESTOR.WarningNoPermission", {localize: true});
    return null;
  }

  // If an image is not provided, use the default if the setting is true, otherwise show none.
  if (!img) {
    const exclude = game.settings.get(MODULE, SETTINGS.EXCLUDE_IMAGE);
    if (!exclude) img = ICON;
  }

  // If no title was provided, use the default.
  if (!title) title = game.i18n.localize("REQUESTOR.Request");

  const data = {options: {popout, autoclose}};
  const buttons = [];
  for (const button of buttonData) {
    const id = foundry.utils.randomID();
    const cls = {
      [PERMISSION.ALL]: "all",
      [PERMISSION.GM]: "gm",
      [PERMISSION.PLAYER]: "player"
    }[button.permission] || "all";
    const label = button.label ?? game.i18n.localize("REQUESTOR.ClickMe");
    buttons.push({id, cls, label});

    // Set the button's limit, preferring what is in the button, else in the message, else free.
    let buttonLimit = LIMIT.FREE;
    if (Object.values(LIMIT).includes(button.limit)) buttonLimit = button.limit;
    else if (Object.values(LIMIT).includes(limit)) buttonLimit = limit;

    // Set the executed command, with backwards compatibility.
    const command = (button.command || button.action)?.toString() ?? "";
    const scope = button.scope ?? {};
    data[id] = {limit: buttonLimit, command, scope};
  }

  const template = "modules/requestor/templates/chatcard.hbs";
  const content = await renderTemplate(template, {
    buttons, img, title, description
  });

  const messageData = foundry.utils.mergeObject( messageOptions, {
    content,
    whisper,
    sound,
    flags: {[MODULE]: data, core: {canPopout: true}}
  });
  return ChatMessage.create(messageData);
}
