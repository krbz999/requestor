import { CONSTS } from "./const.mjs";

export class Requestor {
	
	// create chat card.
	static _createCard = async (args = {}) => {
		
		// bail out if user is not allowed to make requests.
		const {GM_ONLY, TRUST_MODE} = CONSTS.SETTING_NAMES;
		const trustMode = game.settings.get(CONSTS.MODULE_NAME, TRUST_MODE);
		if(trustMode === GM_ONLY && !game.user.isGM) return console.log("Only the GM is allowed to request.");
		
		// create button data.
		const REQUESTOR_card_button_data = args.buttonData ?? []; // array of objects.
		let buttonHTML = "";
		for(let i = 0; i < REQUESTOR_card_button_data.length; i++){
			const REQUESTOR_card_action = "" + REQUESTOR_card_button_data[i].action;
			if(!REQUESTOR_card_action) return ui.notifications.error("You must pass a valid action.");
			const REQUESTOR_card_label = REQUESTOR_card_button_data[i].label ?? "Click me!";
			buttonHTML += `<button id="${CONSTS.MODULE_NAME}" data-index="${i}">${REQUESTOR_card_label}</button>`;
		}
		
		const REQUESTOR_card_img = args.img ?? CONSTS.MODULE_ICON;
		const REQUESTOR_card_title = args.title ?? CONSTS.MODULE_SPEAKER;
		const REQUESTOR_card_description = args.description ?? "";
		const REQUESTOR_card_whisper = args.whisper?.length > 0 ? args.whisper : [];
		
		const messageData = {
			speaker: ChatMessage.getSpeaker(),
			user: game.user.id,
			whisper: REQUESTOR_card_whisper,
			content: `
				<div class="dnd5e chat-card item-card">
				<header class="card-header flexrow">
					<img src="${REQUESTOR_card_img}" title="${REQUESTOR_card_title}" width="36" height="36"/>
					<h3 class="item-name">${REQUESTOR_card_title}</h3>
				</header>
				<div class="card-content">
					${REQUESTOR_card_description}
				</div>
				<div class="card-buttons">
					${buttonHTML}
				</div>`
		}
		messageData[`flags.${CONSTS.MODULE_NAME}.args`] = args;
		messageData[`flags.${CONSTS.MODULE_NAME}.limit`] = args.limit ?? CONSTS.LIMIT.FREE;
		for(let i = 0; i < REQUESTOR_card_button_data.length; i++){
			messageData[`flags.${CONSTS.MODULE_NAME}.args`].buttonData[i].action = "" + REQUESTOR_card_button_data[i].action;
			
			// if button has been given no limit, use card's limit.
			if(!messageData[`flags.${CONSTS.MODULE_NAME}.args`].buttonData[i].limit){
				messageData[`flags.${CONSTS.MODULE_NAME}.args`].buttonData[i].limit = messageData[`flags.${CONSTS.MODULE_NAME}.limit`];
			}
		}
		
		return ChatMessage.create(messageData);
	}
	
	static _onClickButton = (_chatLog, html) => {
		html[0].addEventListener("click", async (event) => {
			
			// make sure it's a Requestor button.
			const button = event.target?.closest(`button[id="${CONSTS.MODULE_NAME}"]`);
			if(!button) return;
			
			// get the button index (starting at 0).
			const buttonIndex = Number(button.getAttribute("data-index"));
			
			// get the chat card.
			const card = button.closest(".chat-card");
			const messageId = card.closest(".message").dataset.messageId;
			const message = game.messages.get(messageId);
			
			// get whether the user has clicked this button already.
			const buttonFlag = game.user.getFlag(CONSTS.MODULE_NAME, `${CONSTS.MESSAGE_IDS}.${messageId}.${buttonIndex}`);
			const clicked = !!buttonFlag?.clicked;
			
			// get the args.
			const args = message.getFlag(CONSTS.MODULE_NAME, "args.buttonData")[buttonIndex];
			
			// if it is only allowed to be clicked once, bail out.
			if(args.limit === CONSTS.LIMIT.ONCE && clicked) return;
			
			// bail out if user is not allowed to click this button.
			const {GM_ONLY, GM_OWN, FREE, TRUST_MODE} = CONSTS.SETTING_NAMES;
			const trustMode = game.settings.get(CONSTS.MODULE_NAME, TRUST_MODE);
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
			if(args.limit === CONSTS.LIMIT.FREE) button.removeAttribute("disabled");
			else await game.user.setFlag(CONSTS.MODULE_NAME, `${CONSTS.MESSAGE_IDS}.${messageId}.${buttonIndex}.${CONSTS.CLICKED}`, true);
			
			// execute.
			await fn.call({}, token, character, actor, event, args);
		});
	}
	
	// remove user flags if the message is gone.
	// set disabled attribute if message exists and is limited.
	static _setDisabledState = async (_chatLog, html) => {
		// get user flags
		const flags = game.user.getFlag(CONSTS.MODULE_NAME, CONSTS.MESSAGE_IDS);
		if(!flags) return;
		const messageIds = Object.keys(flags);
		const updates = {};
		
		// for each message id, find chatLog.collection.get(id)
		for(let id of messageIds){
			let message = html[0].querySelector(`[data-message-id="${id}"]`);
			if(!message) updates[`flags.${CONSTS.MODULE_NAME}.${CONSTS.MESSAGE_IDS}.-=${id}`] = null;
			else{
				let buttons = message.querySelectorAll(`button#${CONSTS.MODULE_NAME}`);
				for(let button of buttons){
					let buttonIndex = button.getAttribute("data-index");
					if(game.user.getFlag(CONSTS.MODULE_NAME, `${CONSTS.MESSAGE_IDS}.${id}.${buttonIndex}.${CONSTS.CLICKED}`)){
						button.setAttribute("disabled", "");
					}
				}
			}
		}
		
		// if message not found, unset game.user.data.flags.requestor.messageIds.id
		game.user.update(updates);
	}
	
	static _createCard_SAVE = async ({whisper = [], ability = "int", dc = 10, limit = CONSTS.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollAbilitySave(args.ability, {event});
			},
			label: `Saving Throw DC ${dc} ${CONFIG.DND5E.abilities[ability]}`,
			ability
		}];
		return Requestor._createCard({
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
		return Requestor._createCard({
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
		return Requestor._createCard({
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
		return Requestor._createCard({
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
		return Requestor._createCard({
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
		return Requestor._createCard({
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
		return Requestor._createCard({
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
		return Requestor._createCard_GRANT({itemData, limit: CONSTS.LIMIT.ONCE});
	}
}

Hooks.on("renderChatLog", Requestor._onClickButton);
Hooks.on("renderChatPopout", Requestor._onClickButton);

Hooks.on("renderChatLog", Requestor._setDisabledState);
Hooks.on("renderChatPopout", Requestor._setDisabledState);