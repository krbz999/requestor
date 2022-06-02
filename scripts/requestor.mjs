import { CONST } from "./const.mjs";
import { SETTING_NAMES } from "./settings.mjs";

export class Requestor {
	
	// create chat card.
	static _createCard = (args = {}) => {
		if(!game.user.isGM) return console.log("Only the GM is allowed to request.");
		
		// create button data.
		const REQUESTOR_card_button_data = args.buttonData; // array of objects.
		let buttonHTML = "";
		for(let i = 0; i < REQUESTOR_card_button_data.length; i++){
			const REQUESTOR_card_action = "" + REQUESTOR_card_button_data[i].action;
			if(!REQUESTOR_card_action) return ui.notifications.error("You must pass a valid action.");
			const REQUESTOR_card_label = REQUESTOR_card_button_data[i].label ?? "Click me!";
			buttonHTML += `<button id="${CONST.MODULE_NAME}" data-index="${i}">${REQUESTOR_card_label}</button>`;
		}
		
		const REQUESTOR_card_img = args.img ?? CONST.MODULE_ICON;
		const REQUESTOR_card_title = args.title ?? "Requestor";
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
		messageData[`flags.${CONST.MODULE_NAME}.args`] = args;
		messageData[`flags.${CONST.MODULE_NAME}.limit`] = args.limit ?? CONST.LIMIT.FREE;
		for(let i = 0; i < REQUESTOR_card_button_data.length; i++){
			messageData[`flags.${CONST.MODULE_NAME}.args`].buttonData[i].action = "" + REQUESTOR_card_button_data[i].action;
		}
		
		ChatMessage.create(messageData);
	}
	
	static _onClickButton = (_chatLog, html) => {
		html[0].addEventListener("click", async (event) => {
			
			// make sure it's a Requestor button.
			const button = event.target;
			if(!button?.id?.includes(CONST.MODULE_NAME)) return;
			
			// get the button index (starting at 0).
			const buttonIndex = Number(button.getAttribute("data-index"));
			
			// get the chat card.
			const card = button.closest(".chat-card");
			const messageId = card.closest(".message").dataset.messageId;
			const message = game.messages.get(messageId);
			const args = message.getFlag(CONST.MODULE_NAME, "args.buttonData")[buttonIndex];
			
			// bail out if the message creator is not a GM.
			if(!message.user.isGM) return;
			
			// turn the card's embedded flag into a function.
			const body = `(${args.action})();`;
			const fn = Function("token", "character", "actor", "event", "args", body);
			
			// define helper variables.
			let character = game.user.character;
			let actor = canvas.tokens.controlled[0]?.actor ?? character;
			let token = canvas.tokens.controlled[0] ?? actor?.token;
			
			// execute.
			await fn.call({}, token, character, actor, event, args);
			await game.user.setFlag(CONST.MODULE_NAME, "buttonClick", messageId);
			const limit = message.getFlag(CONST.MODULE_NAME, "limit");
			if(limit === CONST.LIMIT.FREE) button.removeAttribute("disabled");
		});
	}
	

	static _createCard_SAVE = ({whisper = [], ability = "int", dc = 10, limit = CONST.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: () => {actor.rollAbilitySave(args.ability, {event})},
			label: `Saving Throw DC ${dc} ${CONFIG.DND5E.abilities[ability]}`,
			ability
		}];
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_CHECK = ({whisper = [], ability = "int", limit = CONST.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: () => {actor.rollAbilityTest(args.ability, {event})},
			label: `${CONFIG.DND5E.abilities[ability]} Ability Check`,
			ability
		}];
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_SKILL = ({whisper = [], skill = "nat", limit = CONST.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: () => {actor.rollSkill(args.skill, {event})},
			label: `${CONFIG.DND5E.skills[skill]} Skill Check`,
			skill
		}];
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_ROLL = ({whisper = [], itemName = "", limit = CONST.LIMIT.FREE} = {}) => {
		if(!itemName) return;
		const buttonData = [{
			action: () => {actor.items.getName(args.itemName)?.roll()},
			label: `Use ${itemName}`,
			itemName
		}];
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_GRANT = ({whisper = [], itemData = [], limit = CONST.LIMIT.FREE} = {}) => {
		const itemDataArray = itemData instanceof Array ? itemData : [itemData];
		const labelFix = itemDataArray?.length > 1 ? "Items" : itemDataArray[0].name;
		const buttonData = [{
			action: () => {actor.createEmbeddedDocuments("Item", args.itemDataArray)},
			itemDataArray,
			label: `Claim ${labelFix}`
		}];
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_DICE = ({whisper = [], expression = "0", flavor = "", limit = CONST.LIMIT.FREE} = {}) => {
		const buttonData = [{
			action: () => {new Roll(args.expression, actor?.getRollData()).toMessage({speaker: ChatMessage.getSpeaker({actor}), flavor: args.flavor})},
			label: `Roll Dice`,
			expression,
			flavor
		}];
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_TEMPLATE = ({whisper = [], templateData, limit = CONST.LIMIT.FREE} = {}) => {
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
		Requestor._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_MUFFIN = () => {
		const itemData = {
			name: "Free Muffin",
			type: "consumable",
			img: CONST.MODULE_ICON,
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
		Requestor._createCard_GRANT({itemData, limit: CONST.LIMIT.ONCE});
	}
}

Hooks.on("renderChatLog", Requestor._onClickButton);
Hooks.on("renderChatPopout", Requestor._onClickButton);