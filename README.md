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
* `Requestor.grantMuffin`: a request for an actor to be granted a muffin which restores 1d10 hit points when consumed, requires array of ids (strings).

Passing an array of user ids as `whisper` in the object of the `request` will whisper the request to those clients only. If none are passed (or by passing an empty array), the request appears for all.

### Compatibility
* `Better Rolls for 5e`: Unknown.
* `Midi-QoL`: Appears to have no issues.
* `Minimal Rolling Enhancements`: No issues.
