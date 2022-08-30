import { LIMIT, MODULE, TRUST_MODE, TRUST_OPTIONS } from "./_constants.mjs";
import { closeAllPopouts } from "./_popoutHelpers.mjs";

export function setup_chatListeners(){
    Hooks.on("renderChatLog", onClickButton);
    Hooks.on("renderChatPopout", onClickButton);
    Hooks.on("renderChatMessage", setMessageDisabledStates);
}

// add event listener to chat log.
function onClickButton(chatLog, html){
    html[0].addEventListener("click", async (event) => {
        // make sure it's a Requestor button.
        const button = event.target?.closest(`button[id="${MODULE}"]`);
        if ( !button ) return;
        
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
        const clickedButton = !!game.user.getFlag(MODULE, `messageIds.${messageId}.${buttonIndex}.clicked`);
        if ( ( limit === LIMIT.ONCE ) && clickedButton ) return;
        
        // if it is one of several options, and an option on this message has already been clicked, bail out.
        const clickedCardOption = !!game.user.getFlag(MODULE, `messageIds.${messageId}.clickedOption`);
        if ( ( limit === LIMIT.OPTION) && clickedCardOption ) return;
        
        // bail out if user is not allowed to click this button.
        const trustMode = game.settings.get(MODULE, TRUST_MODE);
        if ( !message.user.isGM ) {
            if ( trustMode === TRUST_OPTIONS.GM_ONLY ) {
                const warning = game.i18n.localize("REQUESTOR.WARN.GM_ONLY");
                ui.notifications.warn(warning);
                return;
            }
            if ( trustMode === TRUST_OPTIONS.GM_OWN ) {
                if ( message.user !== game.user ) {
                    const warning = game.i18n.localize("REQUESTOR.WARN.GM_OR_OWN_ONLY");
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
        if ( limit === LIMIT.FREE ) button.disabled = false;
        
        // if button is limited, flag user as having clicked this button.
        else if ( limit === LIMIT.ONCE ) {
            await game.user.setFlag(MODULE, `messageIds.${messageId}.${buttonIndex}.clicked`, true);
            setMessageDisabledStates(message, [cardHTML]);
        }
        
        // if button is one of several options, flag user as having clicked an option on this card.
        else if ( limit === LIMIT.OPTION ) {
            await game.user.setFlag(MODULE, `messageIds.${messageId}.clickedOption`, true);
            setMessageDisabledStates(message, [cardHTML]);
        }
        
        // if message context is set to close on button clicks, close all popouts.
        if ( message.getFlag(MODULE, "args.context.autoClose") ) closeAllPopouts(message);
        
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
export function setMessageDisabledStates(chatMessage, html){
    return setDisabledState(html[0], chatMessage, chatMessage.id);
}

// set enabled state of buttons depending on user flags.
function setDisabledState(messageHTML, messageDoc, messageId){
    if ( !messageHTML || !messageDoc ) return;
    
    // if the message is found, get all of its buttons.
    const buttons = messageHTML.querySelectorAll(`button[id="${MODULE}"]`);
    
    // for each button, if the button is limited and clicked, set it to be disabled.
    // if a button is an option, and the user has clicked an option on this card, set it to be disabled.
    for ( let button of buttons ) {
        // get the index of the button to find the user's flag.
        const buttonIndex = button.dataset.index;
        
        // this flag only exists if a ONCE button has been clicked.
        if ( game.user.getFlag(MODULE, `messageIds.${messageId}.${buttonIndex}.clicked`) ){
            button.disabled = true;
        }
        
        // if OPTION, and an option has been clicked, disable the button.
        const hasClickedOption = game.user.getFlag(MODULE, `messageIds.${messageId}.clickedOption`);
        const messageButtonDataArray = messageDoc.getFlag(MODULE, "args.buttonData");
        if ( hasClickedOption && messageButtonDataArray.length > 0 ) {
            const {limit} = messageButtonDataArray[buttonIndex];
            if ( limit === LIMIT.OPTION ) {
                button.disabled = true;
            }
        }
    }
}
