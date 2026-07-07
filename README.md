# Print Simple Proxies

A Flesh & Blood proxy sheet builder. Paste a decklist, match it against the card
database, adjust quantities, and print a cut-ready sheet.

Vue 3 + TypeScript + Vite, no backend — everything runs client-side against a
static `public/cards.json`.

## Development

```bash
npm install
npm run dev
```

## Card database

`public/cards.json` is generated from
[the-fab-cube/flesh-and-blood-cards](https://github.com/the-fab-cube/flesh-and-blood-cards)
by `scripts/build-cards.mjs`, which strips the upstream data down to the fields
the app actually renders. Regenerate it manually with:

```bash
node scripts/build-cards.mjs
```

A scheduled GitHub Action (`.github/workflows/update-cards.yml`) re-runs this
weekly and commits the result if the upstream database changed.
