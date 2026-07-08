// Flesh and Blood keyword glossary — trimmed from the-fab-cube/flesh-and-blood-cards
// name + plain-text reminder description (only keywords with real rules text included)
export interface KeywordEntry {
  name: string;
  description: string;
}

export const KEYWORDS: KeywordEntry[] = [
  { name: "Amp", description: "The next time you would deal arcane damage this turn, instead deal that much plus X. This happens before prevention effects." },
  { name: "Arcane Barrier", description: "If you would be dealt arcane damage you may pay X resource points instead to prevent X arcane damage that source will deal." },
  { name: "Battleworn", description: "Equipment that wears down each time it's used to defend. If you defend with it, put a -1 defense counter on it when the combat chain closes." },
  { name: "Blade Break", description: "Equipment that is fragile and breaks after being used to defend. Destroy it when the combat chain closes." },
  { name: "Blood Debt", description: "Exists on Shadow cards. At the end of your turn, you lose 1 life for each blood debt card in your banished zone." },
  { name: "Bond", description: "Attach related tokens or resources together." },
  { name: "Boost", description: "A Mechanologist mechanic that allows an attack action card to gain go again." },
  { name: "Channel", description: "Uses Element cards to maintain a powerful aura that requires a larger commitment each turn to maintain." },
  { name: "Charge", description: "As an additional cost, you may put a card from hand into your hero's soul. Doing so turns on effects that care whether you charged this turn." },
  { name: "Clash", description: "To clash with a hero, each player reveals the top card of their deck; the player whose card has the greater power wins the clash. A card with no power loses to any card that has one." },
  { name: "Cloaked", description: "Equip this face-down." },
  { name: "Combo", description: "A Ninja mechanic that cares about the last attack played in the combat chain." },
  { name: "Contract", description: "When a player is contracted, they're given instructions; performing them completes the contract." },
  { name: "Crush", description: "A Guardian mechanic — when an attack with crush deals 4 or more damage to a hero, an effect is applied." },
  { name: "Dominate", description: "This attack cannot be defended with more than 1 card from the defending hero's hand." },
  { name: "Ephemeral", description: "If this card would be put into a graveyard from anywhere, instead it ceases to exist." },
  { name: "Essence", description: "Exists on Elemental hero cards, showing which Elements that hero specializes in." },
  { name: "Freeze", description: "A frozen object can't be played or activated." },
  { name: "Fusion", description: "Fuses one or more elements with an elemental card to give an additional effect." },
  { name: "Go again", description: "Gives the controller 1 extra action point when it resolves, allowing another action to be played this turn." },
  { name: "Guardwell", description: "Equipment that spends its defense as it's used. When the combat chain closes, if it defended, put -1 defense counters on it equal to its current defense (nothing happens if it's already at 0 defense)." },
  { name: "Heave", description: "At end phase, if this is in hand and your arsenal is empty, you may pay X and put this into your arsenal, creating X Seismic Surge tokens." },
  { name: "Intimidate", description: "A Brute mechanic — removes a random card from the defending hero's hand, making it harder to defend." },
  { name: "Legendary", description: "You may only have 1 copy of this card in your deck." },
  { name: "Material", description: "An Illusionist mechanic that applies effects if this is under another permanent." },
  { name: "Negate", description: "Negating a card on the chain prevents it from resolving." },
  { name: "Opt", description: "Look at the top X cards of your deck and put any number of them on the top and/or bottom, in any order." },
  { name: "Overpower", description: "The defending hero can't defend this with more than one action card." },
  { name: "Perched", description: "Can be equipped in addition to a 2H weapon. Can't be attacked while equipped." },
  { name: "Phantasm", description: "If defended by a 6+ power non-Illusionist attack action card, this is destroyed and the combat chain closes." },
  { name: "Piercing", description: "If this is defended by an equipment, it gets +X power." },
  { name: "Quell", description: "If your hero would be dealt damage, you may pay X resource points to prevent X of it, then destroy this at end phase." },
  { name: "Reload", description: "A Ranger mechanic — put a card from hand face down into your arsenal when this resolves." },
  { name: "Reprise", description: "A Warrior mechanic — effects turn on if the defending hero defended with a card from their hand." },
  { name: "Rupture", description: "A Draconic mechanic with effects that apply if this is played at chain link 4 or higher." },
  { name: "Specialization", description: "You may only include this card in your deck if your hero is the specified hero." },
  { name: "Spectra", description: "When an Aura with spectra is attacked, destroy it and close the combat chain — the attack doesn't resolve." },
  { name: "Spellvoid", description: "A one-time-use effect, primarily on equipment or items, that prevents arcane damage." },
  { name: "Surge", description: "Applies if a card deals more arcane damage than its printed amount." },
  { name: "Temper", description: "Equipment usually high in defense — at 1 defense, choose to defend once more and see it destroyed, or save it for its ability." },
  { name: "Unfreeze", description: "Removes Freeze from an object." },
  { name: "Ward", description: "If your hero would be dealt damage, prevent X of it and destroy this." },
];

export const RARITY_NAMES: Record<string, string> = {
  C: "Common", R: "Rare", S: "Super Rare", M: "Majestic", L: "Legendary",
  F: "Fabled", T: "Token", B: "Basic", V: "Marvel", P: "Promo",
};
