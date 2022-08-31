# Requestor
This is a system-agnostic module that a GM can use with the built-in methods to create chat cards with buttons for players (or the GM) to click.

The main method is `Requestor.request()`, whose inner object requires at least an array of objects `buttonData`. Example (for `dnd5e`):

```js
await Requestor.request({
  description: "This is a request.",
  buttonData: [{
    label: "Nature Skill Check",
    action: async () => {
      await actor.rollSkill("nat", {event});
    }
  }]
});
```

<p style="text-align: center">
	<img src="https://i.imgur.com/uQgwh4B.png"/>
</p>

which will display a message with a button that anyone can click and be prompted to roll Nature. The `buttonData` array can take an arbitrary number of objects.

## How to use:
Create the following constants, all of which are optional, then run the main method with the given keys and values:
* `img`; the image to use in the card (defaults to `icons/containers/boxes/box-gift-green.webp`). Set this to 'false' to not display one at all.
* `title`; the title to use in the card (defaults to 'Request').
* `description`; the text description in the card (defaults to an empty string).
* `buttonData`; an array of objects, detailed below.
* `context`; an object used to pop out the message for all users; use `popout: true` to create a popout, and `autoClose: true` to close the popout after any click on a button. Other values include `scale` (default 1.25), `left` (default middle of the window), and `top` (default 100).
* `limit`; the limit of the buttons that do not have their own set limit. The values are `Requestor.LIMIT.FREE` (for buttons that can be clicked as much as a user would want), `.ONCE` (for a button that can be clicked only once), and `.OPTION` (for buttons that can be clicked only once, and also disables all other buttons on the card set to `.OPTION`).
* And of course the standard `whisper` array, `sound` file (string), and `speaker` object.

### buttonData array
The `buttonData` array is an array of objects detailing the buttons that go on the card. Each object should have an `action` (an arrow function) and a `label` (a string). Any special parameters that should be used in the function but are unavailable due to scope can be passed in the object as well and referenced with prefixing `this.`.

You can style the chat card by creating fake 'buttons' by passing one of these two types:

```js
const buttonData = [
  { type: Requestor.TYPE.DIV },
  { type: Requestor.TYPE.TEXT, label: "Some descriptive text." }
];
```
These will be interpreted as a rule or descriptive text between the buttons. Good for grouping optional buttons together or adding a description beyond the base description passed to the card.
The full list of keys (other than 'label' and 'action') to pass to a button include:
* `LIMIT`: `FREE`, `ONCE`, `OPTION` (for an entry that can clicked any number of times, only once, or once between a group of options). Default: `FREE`.
* `TYPE`: `BUTTON`, `DIV`, `TEXT` (for a button, a divider, or a short description). Default: `BUTTON`.
* `PERMISSION`: `GM`, `PLAYER`, `ALL` (for an entry that will only be shown for GMs, only for players, or for all). Default: `ALL`.

## Helper functions

Some helper functions are pre-defined:
* `Requestor.request`: the base function.
* `Requestor.diceRoll({formula, flavor})`: a request for a player to roll a set of dice. Takes a formula and optional flavor text (strings).
* `Requestor.grantItem({itemData})`: a request for an actor to claim an item or array of items. Requires an array of item data objects.

Methods specific to `dnd5e`:
* `Requestor.dnd5e.rollAbilitySave({ability, dc})`: a request for a saving throw. Requires a three-letter key for the type of save (string) and the DC (integer).
* `Requestor.dnd5e.rollAbilityTest({ability})`: a request for an ability check. Requires a three-letter key for the type of ability check (string).
* `Requestor.dnd5e.rollSkill({skill})`: a request for an ability check using a skill. Requires a three-letter key for the type of skill (string).
* `Requestor.dnd5e.useItem({itemName})`: a request for an actor to use one of their items. Requires the name of the item (string).
* `Requestor.dnd5e.placeMeasuredTemplate({templateData})`: a request for a player to place a template. Requires template data (object). Do not pass a user to the template data.
* `Requestor.dnd5e.grantMuffin`: a request for an actor to be granted a muffin which restores 1d10 hit points when consumed.

## Supplied Variables
These variables are declared in any scripts:
* `character`: the assigned character of the user executing the script.
* `token`: the selected token of the user executing the script, or defaulting to the assigned character's active token on the current scene, if any.
* `actor`: the actor of the selected token, if any, or defaulting to the assigned character.
* `scene`: the current scene.
* `this`: an object with all additional variables passed to the function.
