import { EXCLUDE_IMAGE, MODULE, TRUST_MODE, TRUST_OPTIONS } from "./_constants.mjs";

export function setupSettings() {

  game.settings.register(MODULE, EXCLUDE_IMAGE, {
    name: "REQUESTOR.SETTINGS.EXCLUDE_IMAGE.NAME",
    hint: "REQUESTOR.SETTINGS.EXCLUDE_IMAGE.HINT",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE, TRUST_MODE, {
    name: "REQUESTOR.SETTINGS.TRUST_MODE.NAME",
    hint: "REQUESTOR.SETTINGS.TRUST_MODE.HINT",
    scope: "world",
    config: true,
    type: String,
    default: TRUST_OPTIONS.GM_ONLY,
    choices: {
      [TRUST_OPTIONS.GM_ONLY]: "REQUESTOR.SETTINGS.TRUST_MODE.OPTION_1",
      [TRUST_OPTIONS.GM_OWN]: "REQUESTOR.SETTINGS.TRUST_MODE.OPTION_2",
      [TRUST_OPTIONS.FREE]: "REQUESTOR.SETTINGS.TRUST_MODE.OPTION_3"
    },
    requiresReload: true
  });
}
