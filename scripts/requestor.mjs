import { CONSTS } from "./const.mjs";

export class REQUESTOR {
	
	// create chat card.
	static _createCard = async (args = {}) => {
		
		const {GM_ONLY, TRUST_MODE, USE_SYSTEM_CLASS} = CONSTS.SETTING_NAMES;
		const {MODULE_NAME, MODULE_ICON, MODULE_SPEAKER} = CONSTS;
		
		// bail out if user is not allowed to make requests.
		const trustMode = game.settings.get(MODULE_NAME, TRUST_MODE);
		if(trustMode === GM_ONLY && !game.user.isGM) return console.log("Only the GM is allowed to request.");
		
		// create button data.
		const buttonHTML = args.buttonData?.reduce((acc, {label, action}, i) => {
			if(!action) return acc;
			const buttonLabel = label ?? "Click me!";
			return acc + `<button id="${MODULE_NAME}" data-index="${i}">${buttonLabel}</button>`;
		}, ``) ?? "";
			
		
		const img = args.img ?? MODULE_ICON;
		const title = args.title ?? MODULE_SPEAKER;
		const description = args.description ?? "";
		const footer = args.footer?.reduce((acc, e) => acc += `<span>${e}</span>`, ``) ?? "";
		const whisper = args.whisper?.length > 0 ? args.whisper : [];
		const sound = args.sound ?? "";
		const speaker = args.speaker ?? ChatMessage.getSpeaker();
		
		// define chat card class.
		const systemName = game.system.data.name;
		const useSystemClass = !!game.settings.get(MODULE_NAME, USE_SYSTEM_CLASS);
		const divClass = useSystemClass ? systemName : MODULE_NAME;
		
		// construct message data object.
		const messageData = {
			speaker,
			user: game.user.id,
			whisper,
			sound,
			content: `
				<div class="${divClass} chat-card">
					<header class="card-header flexrow">
						<img src="${img}" title="${title}" width="36" height="36"/>
						<h3 class="item-name">${title}</h3>
					</header>
					<div class="card-content">
						${description}
					</div>
					<div class="card-buttons">
						${buttonHTML}
					</div>
					<footer class="card-footer">
						${footer}
					</footer>
				</div>`
		}
		
		// construct message flags.
		messageData[`flags.${MODULE_NAME}.args`] = args;
		messageData["flags.core.canPopout"] = true;
		
		for(let btnData of args.buttonData ?? []){
			btnData.action = "" + btnData.action;
			// use button's limit if defined, else card's limit if defined, else free.
			btnData.limit = btnData.limit !== undefined ? btnData.limit : (args.limit !== undefined) ? args.limit : CONSTS.LIMIT.FREE;
		}
		
		// add context object.
		const context = args.context ? {[MODULE_NAME]: args.context} : {};
		
		return ChatMessage.create(messageData, context);
	}
	
	static _onClickButton = (_chatLog, html) => {
		html[0].addEventListener("click", async (event) => {
			
			const {LIMIT, MODULE_NAME, MESSAGE_IDS, CLICKED, CLICKED_OPTION} = CONSTS;
			
			// make sure it's a Requestor button.
			const button = event.target?.closest(`button[id="${MODULE_NAME}"]`);
			if(!button) return;
			
			// get the button index (starting at 0).
			const buttonIndex = Number(button.getAttribute("data-index"));
			
			// get the chat card.
			const card = button.closest(".chat-card");
			const cardHTML = card.closest(".message");
			const messageId = cardHTML.dataset.messageId;
			const message = game.messages.get(messageId);
			
			// get whether the user has clicked this button already.
			const clickedButton = !!game.user.getFlag(MODULE_NAME, `${MESSAGE_IDS}.${messageId}.${buttonIndex}.${CLICKED}`);
			
			// get whether the user has clicked an OPTION button on this card already.
			const clickedCardOption = !!game.user.getFlag(MODULE_NAME, `${MESSAGE_IDS}.${messageId}.${CLICKED_OPTION}`);
			
			// get the args.
			const args = message.getFlag(MODULE_NAME, "args.buttonData")[buttonIndex];
			
			// if it is only allowed to be clicked once, and is already clicked, bail out.
			if((args.limit === LIMIT.ONCE) && clickedButton) return;
			
			// if it is one of several options, and an option on this message has already been clicked, bail out.
			if((args.limit === LIMIT.OPTION) && clickedCardOption) return;
			
			// bail out if user is not allowed to click this button.
			const {GM_ONLY, GM_OWN, FREE, TRUST_MODE} = CONSTS.SETTING_NAMES;
			const trustMode = game.settings.get(MODULE_NAME, TRUST_MODE);
			if(trustMode === GM_ONLY && !message.user.isGM) return console.log("The GM did not make this request.");
			if(trustMode === GM_OWN && !(message.user.isGM || message.user === game.user)) return console.log("You are only allowed to click GM's requests or your own.");
			
			// turn the card's embedded flag into a function.
			const body = `(${args.action})();`;
			const fn = Function("token", "character", "actor", "event", "args", body);
			
			// define helper variables.
			let character = game.user.character;
			let actor = canvas.tokens.controlled[0]?.actor ?? character;
			let token = canvas.tokens.controlled[0] ?? actor?.token;
			
			// if button is unlimited, remove disabled attribute.
			if(args.limit === LIMIT.FREE) button.removeAttribute("disabled");
				
			// if button is limited, flag user as having clicked this button.
			if(args.limit === LIMIT.ONCE){
				await game.user.setFlag(MODULE_NAME, `${MESSAGE_IDS}.${messageId}.${buttonIndex}.${CLICKED}`, true);
				await REQUESTOR._setDisabledStateMessageRender(message, [cardHTML]);
			}
			
			// if button is one of several options, flag user as having clicked an option on this card.
			if(args.limit === LIMIT.OPTION){
				await game.user.setFlag(MODULE_NAME, `${MESSAGE_IDS}.${messageId}.${CLICKED_OPTION}`, true);
				
				// render the card again to disable other options.
				await REQUESTOR._setDisabledStateMessageRender(message, [cardHTML]);
			}
			
			// if message context is set to close on button clicks, close all popouts.
			if(message.getFlag(MODULE_NAME, "args.context.autoClose")) REQUESTOR._closeAllPopouts(message);
			
			// execute the embedded function.
			await fn.call({}, token, character, actor, event, args);
		});
	}
	
	// remove user flags if the message is gone.
	static _removeDeprecatedFlags = async (_chatLog, html) => {
		const {MODULE_NAME, MESSAGE_IDS, CLICKED, CLICKED_OPTION, LIMIT} = CONSTS;
		
		// get user flags
		const flags = game.user.getFlag(MODULE_NAME, MESSAGE_IDS);
		if(!flags) return;
		const messageIds = Object.keys(flags);
		
		const updates = {};
		
		// for each message id, attempt to find the message.
		for(let id of messageIds){
			let message = game.messages.get(id);
			if(!message) updates[`flags.${MODULE_NAME}.${MESSAGE_IDS}.-=${id}`] = null;
		}
		await game.user.update(updates);
	}
	
	// trigger enable/disable of buttons when a message is rendered.
	// each message is rendered individually when the chatLog is rendered.
	static _setDisabledStateMessageRender = async (chatMessage, html) => {
		
		const messageHTML = html[0];
		const messageDoc = chatMessage;
		const messageId = chatMessage.id;
		
		this._setDisabledState(messageHTML, messageDoc, messageId);
	}
	
	// set enabled state of buttons depending on user flags.
	static _setDisabledState = async (html, doc, id) => {
		const {MODULE_NAME, MESSAGE_IDS, CLICKED, CLICKED_OPTION, LIMIT} = CONSTS;
		
		const messageHTML = html;
		const messageDoc = doc;
		const messageId = id;
		
		if(!messageHTML || !messageDoc) return;
		
		// if the message is found, get all of its buttons.
		let buttons = messageHTML.querySelectorAll(`button#${MODULE_NAME}`);
		
		// for each button, if the button is limited and clicked, set it to be disabled.
		// if a button is an option, and the user has clicked an option on this card, set it to be disabled.
		for(let button of buttons){
			// get the index of the button to find the user's flag.
			let buttonIndex = button.getAttribute("data-index");
			
			// this flag only exists if a ONCE button has been clicked.
			if(game.user.getFlag(MODULE_NAME, `${MESSAGE_IDS}.${messageId}.${buttonIndex}.${CLICKED}`)) button.setAttribute("disabled", "");
			
			// if OPTION, and an option has been clicked, disable the button.
			if(game.user.getFlag(MODULE_NAME, `${MESSAGE_IDS}.${messageId}.${CLICKED_OPTION}`)){
				if(messageDoc.getFlag(MODULE_NAME, "args.buttonData")?.[buttonIndex]?.limit === LIMIT.OPTION) button.setAttribute("disabled", "");
			}
		}
	}
	
	// create popout if such context is provided.
	static _popoutFocusMessage = (message, context) => {
		const {MODULE_NAME} = CONSTS;
		if(!!context[MODULE_NAME]?.popout){
			new ChatPopout(message, {
				scale: context[MODULE_NAME].scale ?? 1.5,
				left: context[MODULE_NAME].left ?? screen.width/3,
				top: context[MODULE_NAME].top ?? 100
			}).render(true);
		}
	}
	
	// close all popouts of a message.
	static _closeAllPopouts = (message) => {
		for(let value of Object.values(message.apps)){
			if(value?.popOut && value?.rendered) value?.close();
		}
	}
	
	static _createCard_SAVE = async ({whisper = [], ability = "int", dc = 10, limit = CONSTS.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollAbilitySave(args.ability, {event});
			},
			label: `Saving Throw DC ${dc} ${CONFIG.DND5E.abilities[ability]}`,
			ability
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_CHECK = async ({whisper = [], ability = "int", limit = CONSTS.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollAbilityTest(args.ability, {event});
			},
			label: `${CONFIG.DND5E.abilities[ability]} Ability Check`,
			ability
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_SKILL = async ({whisper = [], skill = "nat", limit = CONSTS.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollSkill(args.skill, {event});
			},
			label: `${CONFIG.DND5E.skills[skill]} Skill Check`,
			skill
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_ROLL = async ({whisper = [], itemName = "", limit = CONSTS.LIMIT.FREE} = {}) => {
		if(!itemName) return;
		const buttonData = [{
			action: async () => {
				await actor.items.getName(args.itemName)?.roll();
			},
			label: `Use ${itemName}`,
			itemName
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_GRANT = async ({whisper = [], itemData = [], limit = CONSTS.LIMIT.FREE} = {}) => {
		const itemDataArray = itemData instanceof Array ? itemData : [itemData];
		const labelFix = itemDataArray?.length > 1 ? "Items" : itemDataArray[0].name;
		const buttonData = [{
			action: async () => {
				await actor.createEmbeddedDocuments("Item", args.itemDataArray);
			},
			itemDataArray,
			label: `Claim ${labelFix}`
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_DICE = async ({whisper = [], expression = "0", flavor = "", limit = CONSTS.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: async () => {
				await new Roll(args.expression, actor?.getRollData()).toMessage({
					speaker: ChatMessage.getSpeaker({actor}),
					flavor: args.flavor
				});
			},
			label: `Roll Dice`,
			expression,
			flavor
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_TEMPLATE = async ({whisper = [], templateData, limit = CONSTS.LIMIT.FREE} = {}) => {
		const template_data = templateData ?? {
			t: "circle",
			x: canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage).x,
			y: canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage).y,
			distance: 20,
			direction: 0,
			angle: 0,
			width: 1
		}
		const buttonData = [{
			label: "Place Template",
			action: () => {
				const template_data = args.template_data;
				template_data.user = game.user.id;
				const doc = new CONFIG.MeasuredTemplate.documentClass(template_data, {parent: canvas.scene});
				const template = new game.dnd5e.canvas.AbilityTemplate(doc);
				template.drawPreview();
			},
			template_data
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_MUFFIN = async () => {
		const itemData = {
			name: "Free Muffin",
			type: "consumable",
			img: CONSTS.MODULE_ICON,
			data: {
				description: {value: "<p>It's a free muffin!</p>"},
				weight: 0.1,
				price: 50,
				rarity: "common",
				activation: {type: "action", cost: 1},
				range: {units: "self"},
				target: {type: "self"},
				uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
				actionType: "heal",
				damage: {parts: [["1d10", "healing"]]},
				consumableType: "food"
			}
		}
		return REQUESTOR._createCard_GRANT({itemData, limit: CONSTS.LIMIT.ONCE});
	}
}

Hooks.on("renderChatLog", REQUESTOR._onClickButton);
Hooks.on("renderChatPopout", REQUESTOR._onClickButton);

Hooks.on("renderChatMessage", REQUESTOR._setDisabledStateMessageRender);
Hooks.on("renderChatLog", REQUESTOR._removeDeprecatedFlags);

Hooks.on("createChatMessage", REQUESTOR._popoutFocusMessage);