import { CONSTANTS } from "./const.mjs";
import { REQUESTOR } from "./requestor.mjs";

export class DEMOS {
	
	static _createCard_SAVE = async ({whisper, ability = "int", dc = 10, limit} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollAbilitySave(this.ability, {event});
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
	
	static _createCard_CHECK = async ({whisper, ability = "int", limit} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollAbilityTest(this.ability, {event});
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
	
	static _createCard_SKILL = async ({whisper, skill = "nat", limit} = {}) => {
		const buttonData = [{
			action: async () => {
				await actor.rollSkill(this.skill, {event});
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
	
	static _createCard_ROLL = async ({whisper, itemName, limit} = {}) => {
		if(!itemName) return;
		const buttonData = [{
			action: async () => {
				await actor.items.getName(this.itemName)?.roll();
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
	
	static _createCard_GRANT = async ({whisper, itemData = [], limit} = {}) => {
		const itemDataArray = itemData instanceof Array ? itemData : [itemData];
		const labelFix = itemDataArray?.length > 1 ? "Items" : itemDataArray[0].name;
		const buttonData = [{
			action: async () => {
				await actor.createEmbeddedDocuments("Item", this.itemDataArray);
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
	
	static _createCard_DICE = async ({whisper, formula = "0", flavor, limit} = {}) => {
		const buttonData = [{
			action: async () => {
				await new Roll(this.formula, actor?.getRollData()).toMessage({
					speaker: ChatMessage.getSpeaker({actor}),
					flavor: this.flavor
				});
			},
			label: "Roll Dice",
			formula,
			flavor
		}];
		return REQUESTOR._createCard({
			whisper: whisper?.length ? whisper : [],
			buttonData,
			limit
		});
	}
	
	static _createCard_TEMPLATE = async ({whisper, templateData, limit} = {}) => {
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
				const template_data = this.template_data;
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
			img: CONSTANTS.MODULE_ICON,
			system: {
				description: {value: "<p>It's a free muffin!</p>"},
				weight: 0.1, price: 50, rarity: "common",
				activation: {type: "action", cost: 1},
				range: {units: "self"},
				target: {type: "self"},
				uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
				actionType: "heal",
				damage: {parts: [["1d10", "healing"]]},
				consumableType: "food"
			}
		}
		return DEMOS._createCard_GRANT({itemData, limit: CONSTANTS.LIMIT.ONCE});
	}
}
