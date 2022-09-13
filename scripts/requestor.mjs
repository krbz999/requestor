import { CARD_TITLE, EXCLUDE_IMAGE, ICON, LIMIT, MODULE, PERMISSION, TRUST_MODE, TRUST_OPTIONS, TYPE } from "./_constants.mjs";

export async function request(config = {}){
    
    const params = foundry.utils.expandObject(config);
    const templateData = {};
    
    // bail out if user is not allowed to make requests.
    const trustMode = game.settings.get(MODULE, TRUST_MODE);
    if ( trustMode === TRUST_OPTIONS.GM_ONLY && !game.user.isGM ){
        const warning = game.i18n.localize("REQUESTOR.WARN.NO_PERMISSION");
        ui.notifications.warn(warning);
        return;
    }
    
    // TEMPLATE DATA.
    if ( !params.img ) {
        const excludeImage = game.settings.get(MODULE, EXCLUDE_IMAGE);
        if ( excludeImage ) templateData.img = false;
        else templateData.img = ICON;
    } else templateData.img = params.img;
    delete params.img;
    
    if ( params.title ) templateData.title = params.title;
    else templateData.title = CARD_TITLE;
    delete params.title;

    if ( params.description ) templateData.description = params.description;
    else templateData.description = false;
    delete params.description;
    
    if ( params.buttonData?.length ) {
        templateData.buttons = params.buttonData.reduce((acc, {action, label, type, permission}, i) => {
            let classList = "requestor-all";
            if ( permission === PERMISSION.GM ) classList = "requestor-gm-only";
            else if ( permission === PERMISSION.PLAYER) classList = "requestor-player-only";
            
            if ( type === TYPE.TEXT ) return acc + `<p class="${classList}">${label}</p>`;
            else if ( type === TYPE.DIV ) return acc + `<hr class="${classList}">`;
            else {
                if ( !action ) return acc;
                const buttonLabel = label ?? game.i18n.localize("REQUESTOR.LABELS.CLICK_ME");
                return acc + `<button class="${classList}" id="${MODULE}" data-index="${i}">${buttonLabel}</button>`;
            }
        }, "");
    } else templateData.buttons = false;
    
    const template = "/modules/requestor/templates/chatcard.html";
    const content = await renderTemplate(template, templateData);

    // CHAT CARD DATA.
    for ( let data of params.buttonData ?? [] ) {
        if (typeof data === "string" ) continue;
        else {
            // if action is defined, turn it into a string, escaping appropriate characters.
            if ( data.action ) data.action = data.action.toString();
            
            // use button's limit if defined, else card's limit if defined, else free.
            if ( data.limit !== undefined ) continue;
            else if ( params.limit !== undefined ) data.limit = params.limit;
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
            [MODULE]: {args: foundry.utils.duplicate(params)},
            core: {canPopout: true}
        }
    }, config);
    
    // add context object.
    const context = params.context ? {[MODULE]: params.context} : {};
    return ChatMessage.create(messageData, context);
}
