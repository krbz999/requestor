# Z's Requestor
A GM can use the built-in methods to create item cards with buttons for players (or the GM) to click.

The main method is `Requestor.request({})`, whose inner object requires at least an array of objects `buttonData`. Example:

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

<details><summary>Saving Throws</summary>

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
  img: "icons/skills/movement/figure-running-gray.webp"
});
```
![example3](https://user-images.githubusercontent.com/50169243/173181156-6e3fe502-b495-4146-a7ed-99812b978e66.png)

</details>

<details><summary>Options</summary>

```js
await Requestor.request({
  description: "You may pick only one.",
  buttonData: [
    {label: "OPTION 1",    action: () => ui.notifications.info("CLICKED FIRST!"),  limit: 2},
    {label: "OPTION 2",    action: () => ui.notifications.info("CLICKED SECOND!"), limit: 2},
    {label: "OPTION 3",    action: () => ui.notifications.info("CLICKED THIRD!"),  limit: 2},
    {label: "Free Clicks", action: () => ui.notifications.info("Hello World."),    limit: 0}
  ]
});
```
![image](https://user-images.githubusercontent.com/50169243/173451017-dcb23d05-d45a-4316-bec7-e6e09724beb3.png)

</details>
