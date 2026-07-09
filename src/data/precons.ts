export interface Precon {
  id: string;
  label: string;
  decklistText: string;
}

// Card lists + quantities sourced from each deck's official fabtcg.com
// decklist page (fabtcg.com/decklists/<slug>/) — the-fab-cube's card data
// can identify which cards belong to a precon's set, but doesn't carry
// per-deck quantities, so these are transcribed from the source of truth.
export const PRECONS: Precon[] = [
  {
    id: "sar-arakni-web-of-deceit",
    label: "Silver Age Chapter 2 - Arakni, Web of Deceit",
    decklistText: `1 Arakni, Web of Deceit
1 Blade Beckoner Boots
1 Blossom of Spring
1 Danger Digits
2 Mark of the Huntsman
1 Nullrune Robe
1 Prey Spotters
1 Stalker's Steps
1 Topsy Turvy
2 Art of Desire: Body (red)
2 Concoct Disorder (red)
2 Den of the Spider (red)
2 Frailty Trap (red)
2 Hyper Inflation (red)
2 Inertia Trap (red)
2 Infect (red)
2 Lair of the Spider (red)
2 Mark of the Black Widow (red)
2 Mark of the Funnel Web (red)
2 Mark the Prey (red)
2 Orb-Weaver Spinneret (red)
2 Pick Up the Point (red)
2 Scar Tissue (red)
2 Spike with Bloodrot (red)
2 Stains of the Redback (red)
2 Two Sides to the Blade (red)
2 Up Sticks and Run (red)
2 Art of Desire: Mind (blue)
2 Mark of the Black Widow (blue)
2 Night's Embrace (blue)
2 Reaper's Call (blue)
2 Shred (blue)`,
  },
];
