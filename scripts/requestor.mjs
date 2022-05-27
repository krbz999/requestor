import { CONST } from "./const.mjs";
import { SETTING_NAMES } from "./settings.mjs";

export class Requestor {
	
	// create chat card.
	static _createCard = (args = {}) => {
		if(!game.user.isGM) return console.log("Only the GM is allowed to request.");
		const REQUESTOR_card_action = "" + args.action;
		if(!REQUESTOR_card_action) return ui.notifications.error("You must pass a valid action.");
		const REQUESTOR_card_img = args.img ?? CONST.MODULE_ICON;
		const REQUESTOR_card_title = args.title ?? "Requestor";
		const REQUESTOR_card_description = args.description ?? "";
		const REQUESTOR_card_label = args.label ?? "Click me!";
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
					<button id="${CONST.MODULE_NAME}">${REQUESTOR_card_label}</button>
				</div>`
		}
		messageData[`flags.${CONST.MODULE_NAME}.args`] = args;
		messageData[`flags.${CONST.MODULE_NAME}.args.action`] = REQUESTOR_card_action;
		
		ChatMessage.create(messageData);
	}
	
	static _onClickButton = (_chatLog, html) => {
		html[0].addEventListener("click", async (event) => {
			
			// make sure it's a Requestor button.
			const button = event.target;
			if(button?.id !== CONST.MODULE_NAME) return;
			
			// get the chat card.
			const card = button.closest(".chat-card");
			const messageId = card.closest(".message").dataset.messageId;
			const message = game.messages.get(messageId);
			const args = message.getFlag(CONST.MODULE_NAME, "args");
			
			// bail out if the message creator is not a GM.
			if(!message.user.isGM) return;
			
			// turn the card's embedded flag into a function.
			const body = `(async ${message.getFlag(CONST.MODULE_NAME, "args.action")})();`;
			const fn = Function("token", "character", "actor", "args", body);
			
			// define helper variables.
			let character = game.user.character;
			let actor = canvas.tokens.controlled[0]?.actor ?? character;
			let token = canvas.tokens.controlled[0] ?? actor?.token;
			
			// execute.
			try {
				fn.call({}, token, character, actor, args);
			}catch(err){
				ui.notifications.error("Error in function execution.");
			}
			button.removeAttribute("disabled");
		});
	}
	
	static _createCard_SAVE = (whisper, ability, dc) => {
		const action = () => {actor.rollAbilitySave(args.ability)};
		Requestor._createCard({whisper, action, ability, dc,
			label: `Saving Throw DC ${dc ?? 10} ${CONFIG.DND5E.abilities[ability]}`
		});
	}
	
	static _createCard_CHECK = (whisper, ability) => {
		const action = () => {actor.rollAbilityTest(args.ability)};
		Requestor._createCard({whisper, action, ability,
			label: `${CONFIG.DND5E.abilities[ability]} Ability Check`
		});
	}
	
	static _createCard_SKILL = (whisper, skill) => {
		const action = () => {actor.rollSkill(args.skill)};
		Requestor._createCard({whisper, action, skill,
			label: `${CONFIG.DND5E.skills[skill]} Skill Check`
		});
	}
	
	static _createCard_ROLL = (whisper, itemName) => {
		const action = () => {actor.items.getName(args.itemName)?.roll()};
		Requestor._createCard({whisper, action, itemName,
			label: `Use ${itemName}`
		});
	}
	
	static _createCard_GRANT = (whisper, itemData) => {
		const itemDataArray = itemData instanceof Array ? itemData : [itemData];
		const labelFix = itemData instanceof Array ? "Items" : itemData.name;
		const action = () => {actor.createEmbeddedDocuments("Item", args.itemDataArray)};
		Requestor._createCard({whisper, action, itemDataArray,
			label: `Claim ${labelFix}`
		});
	}
	
	static _createCard_DICE = (whisper, expression, flavor) => {
		const action = () => {new Roll(args.expression, actor?.getRollData()).toMessage({speaker: ChatMessage.getSpeaker({actor}), flavor: args.flavor})};
		Requestor._createCard({whisper, action, expression, flavor,
			label: `Roll Dice`
		});
	}
	
	static _createCard_MUFFIN = (whisper) => {
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
				uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
				actionType: "heal",
				damage: {parts: [["1d10", "healing"]]},
				consumableType: "food"
			}
		}
		Requestor._createCard_GRANT(whisper, itemData);
	}
}

Hooks.on("renderChatLog", Requestor._onClickButton);
Hooks.on("renderChatPopout", Requestor._onClickButton);