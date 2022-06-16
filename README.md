# Z's Requestor
A GM can use the built-in methods to create chat cards with buttons for players (or the GM) to click.

The main method is `Requestor.request({})`, whose inner object requires at least an array of objects `buttonData`. Example (for `dnd5e`):

```js
Requestor.request({
  whisper: [],
  description: "This is a request.",
  img: "icons/containers/boxes/box-gift-green.webp",
  buttonData: [{
    label: "Nature Skill Check",
    action: async () => {
      await actor.rollSkill("nat", {event});
    }
  }]
});
```
![example1](https://user-images.githubusercontent.com/50169243/173181059-698b4d65-9257-482d-a18a-34c34c9e16a1.png)

which will display a message with a button that anyone can click and be prompted to roll Nature. The `buttonData` array can take an arbitrary number of objects.

## How to use:
Create the following constants, all of which are optional:
* img; the image to use in the card (defaults to a core FA icon).
* title; the title to use in the card (defaults to 'Requestor').
* description; the text description in the card (defaults to an empty string).
* footer; an array of strings to be displayed beneath the buttons of the card (defaults to empty).
* whisper; an array of user ids that the message will be shown to (defaults to all users).
* sound; a sound to play when the message is created (defaults to no sound).
* speaker; standard speaker object (defaults to user).
* buttonData; an array of objects, detailed below.
* context; an object used to pop out the message for all users; use `popout: true` to create a popout, and `autoClose: true` to close the popout after any click on a button. Other values include `scale` (default 1.5), `left` (default `screen.width/3`), and `top` (default 100).
* limit; the limt of the buttons that do not have their own set limit. The values are `Requestor.CONST.LIMIT.FREE` (for buttons that can be clicked as much as a user would want), `.ONCE` (for a button that can be clicked only once), and `.OPTION` (for buttons that can be clicked only once, and also disables all other buttons on the card set to `.OPTION`).

### buttonData array
The `buttonData` array is an array of objects detailing the buttons that go on the card. Each object should have an `action` (an arrow function) and a `label` (a string). Any special parameters that should be used in the function but are unavailable due to scope can be passed in the object as well and referenced with prefixing `args.`.

Example:

```js

const actorName = actor.name;

const buttonData = [{
  action: async () => {
    await ChatMessage.create({content: `${args.actorName} clicked a button.`});
  },
  label: "Create a message",
  actorName
}];
```

## Helper functions

Some helper functions are pre-defined:
* `Requestor.request`: the base function.
* `Requestor.diceRoll`: a request for a player to roll a set of dice, requires array of ids (strings), an expression (string), and flavor (string). Supports scaling values.
* `Requestor.itemGrant`: a request for an actor to claim an item or array of items, requires array of ids (strings) and item data or array of item data.

Methods specific to `dnd5e`:
* `Requestor.abilitySave`: a request for a saving throw, requires array of ids (strings), three-letter key (string), and DC (integer).
* `Requestor.abilityTest`: a request for an ability check, requires array of ids (strings) and three-letter key (string).
* `Requestor.rollSkill`: a request for an ability check using a skill, requires array of ids (strings) and three-letter key (string).
* `Requestor.itemRoll`: a request for an actor to use one of their items, requires requires array of ids (strings) and the item's name (string).
* `Requestor.measureTemplate`: a request for a player to place a template, requires an array of ids (strings) and template data (object, defaults to 20-foot circle). Don't pass a user to the template data.
* `Requestor.grantMuffin`: a request for an actor to be granted a muffin which restores 1d10 hit points when consumed, requires array of ids (strings).

Passing an array of user ids as `whisper` in the object of the `request` will whisper the request to those clients only. If none are passed (or by passing an empty array), the request appears for all.

## Compatibility
As of v1.1.0, Requestor is system-agnostic.

* `dnd5e`: Unknown compatibility with `Better Rolls`; `Midi-QoL` and `Minimal Rolling Enhancements` have no issues.
* `pf2e`: Confirmed to work.
* `nova`: Confirmed to work.

## Examples
<details><summary>Muffins! (dnd5e)</summary>

```js
Requestor.request({
  description: "Get your muffins here!",
  title: "Muffins!",
  buttonData: [{
    label: "Get Muffin",
    action: async () => {
      await actor.createEmbeddedDocuments("Item", [{
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
      }]);
    }
  },
  {
    label: "Eat Muffin",
    action: async () => await actor.items.getName("Muffin").roll({configureDialog: false});
  }]
});
```
![example2](https://user-images.githubusercontent.com/50169243/173181048-16d5d230-4cb2-4934-9c19-11122cc35a2e.png)

</details>

<details><summary>Saving Throws (dnd5e)</summary>

Setting the `limit` of a button to 1 makes it able to be clicked only once. In this example, the buttons don't have a limit defined; they then default to the card's limit.

```js
Requestor.request({
  buttonData: [
    {label: "DC 14 Strength Saving Throw",     action: async () => {await actor.rollAbilitySave("str", {event})}},
    {label: "DC 12 Constitution Saving Throw", action: async () => {await actor.rollAbilitySave("con", {event})}},
    {label: "DC 29 Dexterity Saving Throw",    action: async () => {await actor.rollAbilitySave("dex", {event})}},
    {label: "DC 11 Intelligence Saving Throw", action: async () => {await actor.rollAbilitySave("int", {event})}},
    {label: "DC 16 Wisdom Saving Throw",       action: async () => {await actor.rollAbilitySave("wis", {event})}},
    {label: "DC 4 Charisma Saving Throw",      action: async () => {await actor.rollAbilitySave("cha", {event})}}
  ],
  title: "Saving Throws!",
  description: "Roll <em>something</em>.",
  img: "icons/skills/movement/figure-running-gray.webp",
  limit: Requestor.CONST.LIMIT.ONCE
});
```
![example3](https://user-images.githubusercontent.com/50169243/173181156-6e3fe502-b495-4146-a7ed-99812b978e66.png)

</details>

<details><summary>Options</summary>

Setting the `limit` of a group of buttons to 2 makes each of them exclusive; a user can click only one of them.

```js
await Requestor.request({
  description: "You may pick only one.",
  buttonData: [
    {label: "OPTION 1",    action: () => ui.notifications.info("CLICKED FIRST!"),  limit: Requestor.CONST.LIMIT.OPTION},
    {label: "OPTION 2",    action: () => ui.notifications.info("CLICKED SECOND!"), limit: Requestor.CONST.LIMIT.OPTION},
    {label: "OPTION 3",    action: () => ui.notifications.info("CLICKED THIRD!"),  limit: Requestor.CONST.LIMIT.OPTION},
    {label: "Free Clicks", action: () => ui.notifications.info("Hello World."),    limit: Requestor.CONST.LIMIT.FREE}
  ]
});
```
![image](https://user-images.githubusercontent.com/50169243/173451017-dcb23d05-d45a-4316-bec7-e6e09724beb3.png)

</details>
