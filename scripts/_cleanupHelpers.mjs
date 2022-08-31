import { MODULE } from "./_constants.mjs";

export function setup_cleanupHelpers(){

    // remove user flags if the message is gone.
    Hooks.on("renderChatLog", async () => {
        // get user flags
        const flags = game.user.getFlag(MODULE, "messageIds");
        if ( !flags ) return;
        const updates = {};
        
        // for each message id, attempt to find the message.
        for ( let id in flags ) {
            let message = game.messages.get(id);
            if ( !message ) updates[`flags.${MODULE}.messageIds.-=${id}`] = null;
        }
        return game.user.update(updates);
    });

    // set up display of player-only and GM-only content.
    Hooks.once("renderChatLog", () => {
        const displayPlayer = game.user.isGM ? "none" : "block";
        const displayGM = game.user.isGM ? "block" : "none";
        document.documentElement.style.setProperty("--requestor-display-player", displayPlayer);
        document.documentElement.style.setProperty("--requestor-display-gm", displayGM);
    });
}
