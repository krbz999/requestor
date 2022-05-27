# Z's Requestor
A GM can use the built-in methods to create item cards with buttons for players (or the GM) to click.

The main method is `Requestor.request({})`, which takes at least an `action`, defined as such:
```js
() => { /* function goes here */ }
```

Keep in mind that variables passed in the `args` object must be prepended with `args.` in the client-side function. Example:

```js
Requestor.request({
	skill: "per",
	action: () => { actor.rollSkill(args.skill) },
	label: `${CONFIG.DND5E.skills["per"]} Skill Check`
});
```
which will display a message with a button that anyone can click and be prompted to roll Persuasion.

Some helper functions are pre-defined:
* `Requestor.request`: the base function.
* `Requestor.requestSave`: a request for a saving throw, requires three-letter key (string) and DC (integer).
* `Requestor.requestCheck`: a request for an ability check, requires three-letter key (string).
* `Requestor.requestSkill`: a request for an ability check using a skill, requires three-letter key (string).
* `Requestor.requestItemRoll`: a request for an actor to use one of their items, requires the item's name (string).
* `Requestor.requestItemGrant`: a request for an actor to claim an item or array of items, requires item data or array of item data.
* `Requestor.requestDiceRoll`: a request for a player to roll a set of dice, requires an expression (string) and flavor (string). Supports scaling values.
* `Requestor.grantMuffin`: a request for an actor to be granted a muffin which restores 1d10 hit points when consumed.

Passing an array of user ids as `whisper` in the `args` whispers the request to those clients only. If none are passed, the request appears for all.

### Compatibility
It is unknown how the buttons function with these modules.
* `Better Rolls for 5e`
* `Midi-QoL`