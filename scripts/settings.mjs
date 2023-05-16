import {MODULE, SETTINGS, TRUST_OPTIONS} from "./constants.mjs";

export function settings() {
  game.settings.register(MODULE, SETTINGS.EXCLUDE_IMAGE, {
    name: "REQUESTOR.SettingsExcludeImage",
    hint: "REQUESTOR.SettingsExcludeImageHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE, SETTINGS.TRUST_MODE, {
    name: "REQUESTOR.SettingsTrustMode",
    hint: "REQUESTOR.SettingsTrustModeHint",
    scope: "world",
    config: true,
    type: Number,
    default: TRUST_OPTIONS.GM,
    choices: {
      [TRUST_OPTIONS.GM]: "REQUESTOR.SettingsTrustModeOptionGM",
      [TRUST_OPTIONS.OWN]: "REQUESTOR.SettingsTrustModeOptionOwn",
      [TRUST_OPTIONS.FREE]: "REQUESTOR.SettingsTrustModeOptionFree"
    },
    requiresReload: true
  });
}
