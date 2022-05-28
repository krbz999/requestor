# Z's Requestor
A GM can use the built-in methods to create item cards with buttons for players (or the GM) to click.

The main method is `Requestor.request({})`, whose inner object requires at least an array of objects `buttonData`. Example:

```js
Requestor.request({
	whisper: [],
	description: "This is a request.",
	img: "icons/containers/boxes/box-gift-green.webp",
	buttonData: [{
		action: () => { actor.rollSkill("nat") },
		label: "Nature Skill Check"
	}]
});
```
which will display a message with a button that anyone can click and be prompted to roll Nature. The `buttonData` array can take an arbitrary number of objects.

Some helper functions are pre-defined:
* `Requestor.request`: the base function.
* `Requestor.abilitySave`: a request for a saving throw, requires array of ids (strings), three-letter key (string), and DC (integer).
* `Requestor.abilityTest`: a request for an ability check, requires array of ids (strings) and three-letter key (string).
* `Requestor.rollSkill`: a request for an ability check using a skill, requires array of ids (strings) and three-letter key (string).
* `Requestor.itemRoll`: a request for an actor to use one of their items, requires requires array of ids (strings) and the item's name (string).
* `Requestor.itemGrant`: a request for an actor to claim an item or array of items, requires array of ids (strings) and item data or array of item data.
* `Requestor.diceRoll`: a request for a player to roll a set of dice, requires array of ids (strings), an expression (string), and flavor (string). Supports scaling values.
* `Requestor.measureTemplate`: a request for a player to place a template, requires an array of ids (strings) and template data (object, defaults to 20-foot circle). Don't pass a user to the template data.
* `Requestor.grantMuffin`: a request for an actor to be granted a muffin which restores 1d10 hit points when consumed, requires array of ids (strings).

Passing an array of user ids as `whisper` in the object of the `request` will whisper the request to those clients only. If none are passed (or by passing an empty array), the request appears for all.

### Compatibility
* `Better Rolls for 5e`: Unknown.
* `Midi-QoL`: Appears to have no issues.
* `Minimal Rolling Enhancements`: No issues.

### Examples
<details><summary>Muffins!</summary>

```js

Requestor.request({
	description: "Get your muffins here!",
	title: "Muffins!",
	buttonData: [
		{label: "Get Muffin", action: () => actor.createEmbeddedDocuments("Item", [{
			name: "Muffin",
			type: "consumable",
			img: "icons/containers/boxes/box-gift-green.webp",
			data: {
				description: {value: "<p>It's a free muffin!</p>"},
				weight: 0.1,
				price: 50,
				rarity: "common",
				activation: {type: "action", cost: 1},
				target: {type: "self"},
				range: {units: "self"},
				uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
				actionType: "heal",
				damage: {parts: [["1d10","healing"]]},
				consumableType: "food"
			}
		}])},
		{label: "Eat Muffin", action: () => actor.items.getName("Muffin").roll()}
	]
});

```
</details>

<details><summary>Saving Throws</summary>

```js
Requestor.request({
    buttonData: [
        {label: "Strength Saving Throw", action: () => actor.rollAbilitySave("str")},
        {label: "Constitution Saving Throw", action: () => actor.rollAbilitySave("con")},
        {label: "Dexterity Saving Throw", action: () => actor.rollAbilitySave("dex")},
        {label: "Intelligence Saving Throw", action: () => actor.rollAbilitySave("int")},
        {label: "Wisdom Saving Throw", action: () => actor.rollAbilitySave("wis")},
        {label: "Charisma Saving Throw", action: () => actor.rollAbilitySave("cha")}
    ],
    title: "Ability Checks!",
    description: "Roll <em>something</em>."
});

```
</details>
