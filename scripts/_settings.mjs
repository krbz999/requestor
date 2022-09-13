import { EXCLUDE_IMAGE, MODULE, TRUST_MODE, TRUST_OPTIONS } from "./_constants.mjs";

export function setup_settings(){
    
    game.settings.register(MODULE, EXCLUDE_IMAGE, {
        name: game.i18n.localize("REQUESTOR.SETTINGS.EXCLUDE_IMAGE.NAME"),
        hint: game.i18n.localize("REQUESTOR.SETTINGS.EXCLUDE_IMAGE.HINT"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
    
    game.settings.register(MODULE, TRUST_MODE, {
        name: game.i18n.localize("REQUESTOR.SETTINGS.TRUST_MODE.NAME"),
        hint: game.i18n.localize("REQUESTOR.SETTINGS.TRUST_MODE.HINT"),
        scope: "world",
        config: true,
        type: String,
        default: TRUST_OPTIONS.GM_ONLY,
        choices: {
            [TRUST_OPTIONS.GM_ONLY]: game.i18n.localize("REQUESTOR.SETTINGS.TRUST_MODE.OPTION_1"),
            [TRUST_OPTIONS.GM_OWN]: game.i18n.localize("REQUESTOR.SETTINGS.TRUST_MODE.OPTION_2"),
            [TRUST_OPTIONS.FREE]: game.i18n.localize("REQUESTOR.SETTINGS.TRUST_MODE.OPTION_3")
        }
    });
}
