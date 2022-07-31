import { CONSTS } from "./const.mjs";

export class REQUESTOR {
	
	// create chat card.
	static _createCard = async (gargs = {}) => {
		
		const args = expandObject(gargs);
		
		// bail out if user is not allowed to make requests.
		const trustMode = game.settings.get(CONSTS.MODULE_NAME, CONSTS.SETTING_NAMES.TRUST_MODE);
		if(trustMode === CONSTS.SETTING_NAMES.GM_ONLY && !game.user.isGM) return console.log("Only the GM is allowed to request.");
		
		// create button data.
		const buttonHTML = args.buttonData?.reduce((acc, {action, label, type}, i) => {
			if(type === CONSTS.TYPE.TEXT){
				return acc + `<p>${label}</p>`;
			}
			else if(type === CONSTS.TYPE.DIV){
				return acc + "<hr>";
			}else{
				if(!action) return acc;
				
				const buttonLabel = label ?? "Click me!";
				return acc + `<button id="${CONSTS.MODULE_NAME}" data-index="${i}">${buttonLabel}</button>`;
			}
		}, ``) ?? "";
		
		const img = args.img ?? CONSTS.MODULE_ICON;
		const title = args.title ?? CONSTS.MODULE_SPEAKER;
		const description = args.description ?? "";
		const footer = args.footer?.reduce((acc, e) => acc += `<span>${e}</span>`, ``) ?? "";
		const whisper = args.whisper?.length > 0 ? args.whisper : [];
		const sound = args.sound ?? "";
		const speaker = args.speaker ?? ChatMessage.getSpeaker();
		
		// define chat card class.
		const systemName = game.system.id;
		const useSystemClass = !!game.settings.get(CONSTS.MODULE_NAME, CONSTS.SETTING_NAMES.USE_SYSTEM_CLASS);
		const divClass = useSystemClass ? systemName : CONSTS.MODULE_NAME;
		
		// construct the header contents, depending on whether an image should be included.
		const excludeDefault = !!game.settings.get(CONSTS.MODULE_NAME, CONSTS.SETTING_NAMES.EXCLUDE_IMAGE);
		const excludeImage = (args.img === CONSTS.STYLE.NO_IMG) || (!args.img && excludeDefault);
		let header = "";
		if(excludeImage) header = `<h3 class="item-name" style="text-align:center">${title}</h3>`;
		else header = `<img src="${img}" title="${title}" width="36" height="36"/> <h3 class="item-name">${title}</h3>`;
		
		// construct message data object.
		const messageData = {speaker, whisper, sound, user: game.user.id, content: `
			<div class="${divClass} chat-card">
				<header class="card-header flexrow"> ${header} </header>
				<div class="card-content"> ${description} </div>
				<div class="card-buttons"> ${buttonHTML} </div>
				<footer class="card-footer"> ${footer} </footer>
			</div>`
		}
		
		// construct message flags.
		messageData[`flags.${CONSTS.MODULE_NAME}.args`] = args;
		messageData["flags.core.canPopout"] = true;
		
		for(let btnData of args.buttonData ?? []){
			if(typeof btnData === "string") continue;
			else{
				// if action is defined, turn it into a string, escaping appropriate characters.
				if(!!btnData.action) btnData.action = "" + btnData.action;
				
				// use button's limit if defined, else card's limit if defined, else free.
				if(btnData.limit !== undefined) continue;
				else if(args.limit !== undefined) btnData.limit = args.limit;
				else btnData.limit = CONSTS.LIMIT.FREE;
			}
		}
		
		// add context object.
		const context = args.context ? {[CONSTS.MODULE_NAME]: args.context} : {};
		
		return ChatMessage.create(messageData, context);
	}
	
	// add event listener to chat log.
	static _onClickButton = (_chatLog, html) => {
		html[0].addEventListener("click", async (event) => {
			// make sure it's a Requestor button.
			const button = event.target?.closest(`button[id="${CONSTS.MODULE_NAME}"]`);
			if(!button) return;
			
			// get the button index (starting at 0).
			const buttonIndex = Number(button.getAttribute("data-index"));
			
			// get the chat card.
			const card = button.closest(".chat-card");
			const cardHTML = card.closest(".message");
			const messageId = cardHTML.dataset.messageId;
			const message = game.messages.get(messageId);
			
			// get whether the user has clicked this button already.
			const clickedButton = !!game.user.getFlag(CONSTS.MODULE_NAME, `messageIds.${messageId}.${buttonIndex}.clicked`);
			
			// get whether the user has clicked an OPTION button on this card already.
			const clickedCardOption = !!game.user.getFlag(CONSTS.MODULE_NAME, `messageIds.${messageId}.clickedOption`);
			
			// get the args.
			const args = message.getFlag(CONSTS.MODULE_NAME, "args.buttonData")[buttonIndex];
			const thisargs = duplicate(args);
			
			// if it is only allowed to be clicked once, and is already clicked, bail out.
			if((args.limit === CONSTS.LIMIT.ONCE) && clickedButton) return;
			
			// if it is one of several options, and an option on this message has already been clicked, bail out.
			if((args.limit === CONSTS.LIMIT.OPTION) && clickedCardOption) return;
			
			// bail out if user is not allowed to click this button.
			const trustMode = game.settings.get(CONSTS.MODULE_NAME, CONSTS.SETTING_NAMES.TRUST_MODE);
			if(trustMode === CONSTS.SETTING_NAMES.GM_ONLY && !message.user.isGM) return console.log("The GM did not make this request.");
			if(trustMode === CONSTS.SETTING_NAMES.GM_OWN && !(message.user.isGM || message.user === game.user)) return console.log("You are only allowed to click GM's requests or your own.");
			
			// turn the card's embedded flag into a function.
			const body = `(${args.action})();`;
			const fn = Function("token", "character", "actor", "event", "args", body);
			
			// define helper variables.
			let character = game.user.character;
			let actor = canvas.tokens.controlled[0]?.actor ?? character;
			let token = canvas.tokens.controlled[0] ?? actor?.token;
			
			// if button is unlimited, remove disabled attribute.
			if(args.limit === CONSTS.LIMIT.FREE) button.removeAttribute("disabled");
				
			// if button is limited, flag user as having clicked this button.
			if(args.limit === CONSTS.LIMIT.ONCE){
				await game.user.setFlag(CONSTS.MODULE_NAME, `messageIds.${messageId}.${buttonIndex}.clicked`, true);
				await REQUESTOR._setDisabledStateMessageRender(message, [cardHTML]);
			}
			
			// if button is one of several options, flag user as having clicked an option on this card.
			if(args.limit === CONSTS.LIMIT.OPTION){
				await game.user.setFlag(CONSTS.MODULE_NAME, `messageIds.${messageId}.clickedOption`, true);
				
				// render the card again to disable other options.
				await REQUESTOR._setDisabledStateMessageRender(message, [cardHTML]);
			}
			
			// if message context is set to close on button clicks, close all popouts.
			if(message.getFlag(CONSTS.MODULE_NAME, "args.context.autoClose")) REQUESTOR._closeAllPopouts(message);
			
			// remove unwanted fields from thisargs.
			delete thisargs.limit;
			delete thisargs.action;
			delete thisargs.label;
			
			// execute the embedded function.
			await fn.call(thisargs, token, character, actor, event, thisargs);
		});
	}
	
	// remove user flags if the message is gone.
	static _removeDeprecatedFlags = async (_chatLog, html) => {
		// get user flags
		const flags = game.user.getFlag(CONSTS.MODULE_NAME, "messageIds");
		if(!flags) return;
		const messageIds = Object.keys(flags);
		
		const updates = {};
		
		// for each message id, attempt to find the message.
		for(let id of messageIds){
			let message = game.messages.get(id);
			if(!message) updates[`flags.${CONSTS.MODULE_NAME}.messageIds.-=${id}`] = null;
		}
		await game.user.update(updates);
	}
	
	/* trigger enable/disable of buttons when a message is rendered.
	   each message is rendered individually when the chatLog is rendered. */
	static _setDisabledStateMessageRender = async (chatMessage, html) => {
		
		const messageHTML = html[0];
		const messageDoc = chatMessage;
		const messageId = chatMessage.id;
		
		this._setDisabledState(messageHTML, messageDoc, messageId);
	}
	
	// set enabled state of buttons depending on user flags.
	static _setDisabledState = async (html, doc, id) => {
		const messageHTML = html;
		const messageDoc = doc;
		const messageId = id;
		
		if(!messageHTML || !messageDoc) return;
		
		// if the message is found, get all of its buttons.
		const buttons = messageHTML.querySelectorAll(`button[id="${CONSTS.MODULE_NAME}"]`);
		
		// for each button, if the button is limited and clicked, set it to be disabled.
		// if a button is an option, and the user has clicked an option on this card, set it to be disabled.
		for(let button of buttons){
			// get the index of the button to find the user's flag.
			let buttonIndex = button.getAttribute("data-index");
			
			// this flag only exists if a ONCE button has been clicked.
			if(game.user.getFlag(CONSTS.MODULE_NAME, `messageIds.${messageId}.${buttonIndex}.clicked`)) button.setAttribute("disabled", "");
			
			// if OPTION, and an option has been clicked, disable the button.
			const user_has_clicked_option = game.user.getFlag(CONSTS.MODULE_NAME, `messageIds.${messageId}.clickedOption`);
			const message_buttonData_array = messageDoc.getFlag(CONSTS.MODULE_NAME, "args.buttonData");
			if(user_has_clicked_option && !!message_buttonData_array.length){
				let {limit} = message_buttonData_array[buttonIndex];
				if(limit === CONSTS.LIMIT.OPTION){
					button.setAttribute("disabled", "");
				}
			}
		}
	}
	
	// create popout if such context is provided.
	static _popoutFocusMessage = (message, context, userId) => {
		// is popout set true.
		const should_popout = !!getProperty(context, "requestor.popout");
		if(!should_popout) return;
		
		// is it whispered.
		const whisper = message.data.whisper;
		if(whisper.length > 0){
			// if whispered, bail out if you are not a GM, a recipient, or the creator (creator not always included in whisper array).
			if(!game.user.isGM && !whisper.includes(game.user.id) && message.data.user !== game.user.id) return;
		}
		
		// passed values, with defaults.
		const {
			scale = 1.25,
			left = (window.innerWidth - Dialog.defaultOptions.width)/2,
			top = 100
		} = context["requestor"];
		
		// create chat popout.
		new ChatPopout(message, {scale, left, top}).render(true);
	}
	
	// close all popouts of a message.
	static _closeAllPopouts = (message) => {
		for(let value of Object.values(message.apps)){
			if(value?.popOut && value?.rendered) value?.close();
		}
	}
	
}
