import {request} from "./requestor.mjs";
import {ICON, LIMIT} from "./constants.mjs";

export class DEMOS {
  static async abilitySave({whisper = [], ability = "int", dc = 10, limit} = {}) {
    const buttonData = [{
      command: async function() {
        return actor?.rollAbilitySave(ability, {event});
      },
      label: `Saving Throw DC ${dc} ${CONFIG.DND5E.abilities[ability]}`,
      scope: {ability}
    }];
    return Requestor.request({whisper, buttonData, limit});
  }

  static async abilityTest({whisper = [], ability = "int", limit} = {}) {
    const buttonData = [{
      command: async function() {
        return actor?.rollAbilityTest(ability, {event});
      },
      label: `${CONFIG.DND5E.abilities[ability].label} Ability Check`,
      scope: {ability}
    }];
    return request({whisper, buttonData, limit});
  }

  static async skillCheck({whisper = [], skill = "nat", limit} = {}) {
    const label = CONFIG.DND5E.skills[skill]?.label ?? "";
    const buttonData = [{
      command: async function() {
        return actor?.rollSkill(skill, {event});
      },
      label: `${label} Skill Check`,
      scope: {skill}
    }];
    return request({whisper, buttonData, limit});
  }

  static async useItem({whisper = [], itemName, limit} = {}) {
    if (!itemName) return ui.notifications.warn("NO ITEM NAME PROVIDED.");
    const buttonData = [{
      command: async function() {
        return actor?.items.getName(itemName)?.use();
      },
      label: `Use ${itemName}`,
      scope: {itemName}
    }];
    return request({whisper, buttonData, limit});
  }

  static async grantItem({whisper = [], itemData = [], limit} = {}) {
    itemData = (itemData instanceof Array) ? itemData : [itemData];
    const buttonData = [{
      command: async function() {
        return actor?.createEmbeddedDocuments("Item", itemData);
      },
      label: `Claim ${(itemData.length > 1) ? "Items" : itemData[0].name}`,
      scope: {itemData}
    }];
    return request({whisper, buttonData, limit});
  }

  static async diceRoll({whisper = [], formula = "0", flavor, limit} = {}) {
    const buttonData = [{
      command: async function() {
        const data = actor?.getRollData() ?? {};
        return new Roll(formula, data).toMessage({
          speaker: ChatMessage.getSpeaker({actor}),
          flavor: flavor
        });
      },
      label: "Roll Dice",
      scope: {formula, flavor}
    }];
    return request({whisper, buttonData, limit});
  }

  static async createMeasuredTemplate({whisper = [], templateData = null, limit} = {}) {
    const {x, y} = canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage);
    templateData ??= {t: "circle", x, y, distance: 20, direction: 0, angle: 0, width: 1};
    const buttonData = [{
      label: "Place Template",
      command: async function() {
        templateData.user = game.user.id;
        const doc = new CONFIG.MeasuredTemplate.documentClass(templateData, {parent: canvas.scene});
        const template = new game.dnd5e.canvas.AbilityTemplate(doc);
        return template.drawPreview();
      },
      scope: {templateData}
    }];
    return request({whisper, buttonData, limit});
  }

  static async grantMuffin() {
    const itemData = {
      name: "Free Muffin",
      type: "consumable",
      img: ICON,
      system: {
        description: {value: "<p>It's a free muffin!</p>"},
        weight: {value: 0.1},
        price: {value: 50, denomination: "gp"},
        rarity: "common",
        activation: {type: "action", cost: 1},
        range: {units: "self"},
        target: {type: "self"},
        uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
        actionType: "heal",
        damage: {parts: [["1d10", "healing"]]},
        type: {value: "food"}
      }
    };
    return this.grantItem({itemData, limit: LIMIT.ONCE});
  }
}
