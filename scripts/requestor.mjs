import {
  CARD_TITLE,
  EXCLUDE_IMAGE,
  ICON,
  LIMIT,
  MODULE,
  PERMISSION,
  TRUST_MODE,
  TRUST_OPTIONS,
  TYPE
} from "./_constants.mjs";

export async function request(config = {}) {

  // turn functions into strings before they get destroyed below.
  for (const btn of config.buttonData) {
    btn.action = btn.action.toString();
  }

  const params = foundry.utils.expandObject(config);
  const templateData = {};

  // bail out if user is not allowed to make requests.
  const trustMode = game.settings.get(MODULE, TRUST_MODE);
  if (trustMode === TRUST_OPTIONS.GM_ONLY && !game.user.isGM) {
    const string = "REQUESTOR.WARN.NO_PERMISSION";
    const warning = game.i18n.localize(string);
    ui.notifications.warn(warning);
    return;
  }

  // TEMPLATE DATA.
  if (!params.img) {
    const excludeImage = game.settings.get(MODULE, EXCLUDE_IMAGE);
    if (excludeImage) templateData.img = false;
    else templateData.img = ICON;
  } else templateData.img = params.img;
  delete params.img;

  if (params.title) templateData.title = params.title;
  else templateData.title = CARD_TITLE;
  delete params.title;

  if (params.description) templateData.description = params.description;
  else templateData.description = false;
  delete params.description;

  if (params.buttonData?.length) {
    templateData.buttons = params.buttonData.reduce((acc, data, i) => {
      let classList = "requestor-all";
      if (data.permission === PERMISSION.GM) {
        classList = "requestor-gm-only";
      } else if (data.permission === PERMISSION.PLAYER) {
        classList = "requestor-player-only";
      }

      if (data.type === TYPE.TEXT) {
        return acc + `<p class="${classList}">${data.label}</p>`;
      } else if (data.type === TYPE.DIV) {
        return acc + `<hr class="${classList}">`;
      } else {
        if (!data.action) return acc;
        const string = "REQUESTOR.LABELS.CLICK_ME";
        const buttonLabel = data.label ?? game.i18n.localize(string);
        return acc + `
        <button class="${classList}" id="${MODULE}" data-index="${i}">
          ${buttonLabel}
        </button>`;
      }
    }, "");
  } else templateData.buttons = false;

  const template = "/modules/requestor/templates/chatcard.html";
  const content = await renderTemplate(template, templateData);

  // CHAT CARD DATA.
  for (const data of params.buttonData ?? []) {
    if (typeof data === "string") continue;
    else {
      // if action is defined, turn it into a string, escaping appropriate characters.
      if (data.action) data.action = data.action.toString();

      // use button's limit if defined, else card's limit if defined, else free.
      if (data.limit !== undefined) continue;
      else if (params.limit !== undefined) data.limit = params.limit;
      else data.limit = LIMIT.FREE;
    }
  }

  const messageData = foundry.utils.mergeObject({
    content,
    whisper: [],
    sound: null,
    speaker: ChatMessage.getSpeaker(),
    user: game.user.id,
    flags: {
      [MODULE]: { args: foundry.utils.duplicate(params) },
      core: { canPopout: true }
    }
  }, config);

  // add context object.
  const context = params.context ? { [MODULE]: params.context } : {};
  return ChatMessage.create(messageData, context);
}
