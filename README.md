# Requestor
This is a system-agnostic module that a GM can use with the built-in methods to create chat cards with buttons for players (or the GM) to click.

The main method is `Requestor.request()`, whose inner object requires at least an array of objects `buttonData`. Example (for `dnd5e`):

```js
await Requestor.request({
  description: "This is a request.",
  buttonData: [{
    label: "Nature Skill Check",
    command: async function(){
      return actor.rollSkill("nat", {event});
    }
  }]
});
```

<p align="center">
  <img src="https://i.imgur.com/uQgwh4B.png"/>
</p>

which will display a message with a button that anyone can click and be prompted to roll Nature. The `buttonData` array can take an arbitrary number of objects.

## How to use:
Create the following constants, all of which are optional, then run the main method with the given keys and values:
* `img`; the image to use in the card (defaults to `icons/containers/boxes/box-gift-green.webp`). Set this to 'false' to not display one at all.
* `title`; the title to use in the card (defaults to 'Request').
* `description`; the text description in the card (defaults to an empty string).
* `buttonData`; an array of objects, detailed below.
* `popout`; whether to create a popout of this message automatically for all users that can see it (true or false).
* `autoclose`; whether the popout (see above) should close automatically when a user clicks any of the buttons (true or false).
* `limit`; the limit of the buttons that do not have their own set limit. The values are `Requestor.LIMIT.FREE` (for buttons that can be clicked as much as a user would want), `.ONCE` (for a button that can be clicked only once), and `.OPTION` (for buttons that can be clicked only once, and also disables all other buttons on the card set to `.OPTION`).
* And of course the standard `whisper` array, `sound` file (string), and `speaker` object.
* The final key `messageOptions` is an object passed directly into the ChatMessage constructor which should contain any additional fields accepted by the constructor that the user may wish to add such as `blind`, `type`,`rolls`, etc. This module makes no guarantees on the behaviour of the options passed here.

### buttonData array
The `buttonData` array is an array of objects detailing the buttons that go on the card. Each object should have `command` (a function) and `label` (a string). Any special parameters that should be used in the function can be added under a third parameter `scope` (an object); these will be directly accessible in the command. Example:

```js
await Requestor.request({
  description: "This is a request.",
  buttonData: [{
    label: "A Skill Check",
    command: async function(){
      return actor.rollSkill(skill, {event});
    },
    scope: {skill: "nat"}
  }]
});
```

The full list of keys (other than `label` and `command`) to pass to a button include `limit` and `permission` with these options:
* `LIMIT`: `FREE`, `ONCE`, `OPTION` (for an entry that can clicked any number of times, only once, or once between a group of options). Default: `FREE`.
* `PERMISSION`: `GM`, `PLAYER`, `ALL` (for an entry that will only be shown for GMs, only for players, or for all). Default: `ALL`.

## Helper functions

Some helper functions are pre-defined:
* `Requestor.request`: the base function.
* `Requestor.diceRoll({formula, flavor})`: a request for a player to roll a set of dice. Takes a formula and optional flavor text (strings). This example requests users to roll `2d4 + 2` with the flavor text "Healing Potion".
```js
await Requestor.diceRoll({formula: "2d4+2", flavor: "Healing Potion"});
```
* `Requestor.grantItem({itemData})`: a request for an actor to claim an item or array of items. Requires an array of item data objects.

Methods specific to `dnd5e`:
* `Requestor.dnd5e.rollAbilitySave({ability, dc})`: a request for a saving throw. Requires a three-letter key for the type of save (string) and the DC (integer). This example requests users for a DC 15 Strength saving throw.
```js
await Requestor.dnd5e.rollAbilitySave({ability: "str", dc: 15});
```
* `Requestor.dnd5e.rollAbilityTest({ability})`: a request for an ability check. Requires a three-letter key for the type of ability check (string). This example requests users for an Intelligence check.
```js
await Requestor.dnd5e.rollAbilityTest({ability: "int"});
```
* `Requestor.dnd5e.rollSkill({skill})`: a request for an ability check using a skill. Requires a three-letter key for the type of skill (string). This example requests users for a Persuasion check.
```js
await Requestor.dnd5e.rollSkill({skill: "per"});
```
* `Requestor.dnd5e.useItem({itemName})`: a request for an actor to use one of their items. Requires the name of the item (string). This example requests users to use the item (or spell) they own with the name "Muffin":
```js
await Requestor.dnd5e.useItem({itemName: "Muffin"});
```
* `Requestor.dnd5e.placeMeasuredTemplate({templateData})`: a request for a player to place a template. Requires template data (object). Do not pass a user to the template data.
* `Requestor.dnd5e.grantMuffin`: a request for an actor to be granted a muffin which restores 1d10 hit points when consumed.

## Supplied Variables
These variables are declared in any executed command:
* `token`: the selected token of the user executing the command, or defaulting to the assigned character's active token on the current scene, if any.
* `character`: the assigned actor of the user executing the command.
* `actor`: the actor of the selected token, if any, or defaulting to the assigned character.
* `event`: the initiating click event when the user clicked the button.
* `this`: an object with all additional variables passed to the function (identical to `scope` above).
If `tokenId` or `actorId` are passed in `scope`, then `token` and `actor` will automatically be set using these ids.
