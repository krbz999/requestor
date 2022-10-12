import { request } from "./requestor.mjs";
import { ICON, LIMIT } from "./_constants.mjs";

export class DEMOS {

  static abilitySave = async ({ whisper, ability = "int", dc = 10, limit } = {}) => {
    const buttonData = [{
      action: async () => {
        await actor?.rollAbilitySave(this.ability, { event });
      },
      label: `Saving Throw DC ${dc} ${CONFIG.DND5E.abilities[ability]}`,
      ability
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static abilityTest = async ({ whisper, ability = "int", limit } = {}) => {
    const buttonData = [{
      action: async () => {
        await actor?.rollAbilityTest(this.ability, { event });
      },
      label: `${CONFIG.DND5E.abilities[ability]} Ability Check`,
      ability
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static skillCheck = async ({ whisper, skill = "nat", limit } = {}) => {
    const label = CONFIG.DND5E.skills[skill]?.label ?? "";
    const buttonData = [{
      action: async () => {
        await actor?.rollSkill(this.skill, { event });
      },
      label: `${label} Skill Check`,
      skill
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static useItem = async ({ whisper, itemName, limit } = {}) => {
    if (!itemName) return;
    const buttonData = [{
      action: async () => {
        await actor?.items.getName(this.itemName)?.use();
      },
      label: `Use ${itemName}`,
      itemName
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static grantItem = async ({ whisper, itemData = [], limit } = {}) => {
    const itemDataArray = itemData instanceof Array ? itemData : [itemData];
    const labelFix = itemDataArray?.length > 1 ? "Items" : itemDataArray[0].name;
    const buttonData = [{
      action: async () => {
        await actor?.createEmbeddedDocuments("Item", this.itemDataArray);
      },
      itemDataArray,
      label: `Claim ${labelFix}`
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static diceRoll = async ({ whisper, formula = "0", flavor, limit } = {}) => {
    const buttonData = [{
      action: async () => {
        const data = actor?.getRollData() ?? {};
        await new Roll(this.formula, data).toMessage({
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: this.flavor
        });
      },
      label: "Roll Dice",
      formula,
      flavor
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static createMeasuredTemplate = async ({ whisper, templateData, limit } = {}) => {
    const { x, y } = canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage);
    const template_data = templateData ?? {
      t: "circle", x, y, distance: 20, direction: 0, angle: 0, width: 1
    }
    const buttonData = [{
      label: "Place Template",
      action: () => {
        const template_data = this.template_data;
        template_data.user = game.user.id;
        const doc = new CONFIG.MeasuredTemplate.documentClass(template_data, { parent: canvas.scene });
        const template = new game.dnd5e.canvas.AbilityTemplate(doc);
        template.drawPreview();
      },
      template_data
    }];
    return request({ whisper: whisper ?? [], buttonData, limit });
  }

  static grantMuffin = async () => {
    const itemData = {
      name: "Free Muffin",
      type: "consumable",
      img: ICON,
      system: {
        description: { value: "<p>It's a free muffin!</p>" },
        weight: 0.1, price: 50, rarity: "common",
        activation: { type: "action", cost: 1 },
        range: { units: "self" },
        target: { type: "self" },
        uses: { value: 1, max: 1, per: "charges", autoDestroy: true },
        actionType: "heal",
        damage: { parts: [["1d10", "healing"]] },
        consumableType: "food"
      }
    }
    return this.grantItem({ itemData, limit: LIMIT.ONCE });
  }
}
