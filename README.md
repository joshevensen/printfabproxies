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

## Contributing

This is a small side project maintained on a best-effort basis — don't expect
fast turnaround. PRs are welcome for bug fixes and small improvements; open an
issue first for anything larger so we're aligned before you put in the work.

## Icon attribution

The card-type watermark icons in `public/icons/` are from
[game-icons.net](https://game-icons.net), licensed
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/):

| File | Author |
| --- | --- |
| `hero.svg` | Cathelineau |
| `legs.svg`, `head.svg`, `chest.svg`, `weapon.svg`, `attack.svg`, `token.svg`, `item.svg`, `aura.svg`, `action.svg` | Lorc |
| `arms.svg`, `instant.svg` | Delapouite |
| `attack-reaction.svg` | Andymeneely |
| `defense-reaction.svg` | Felbrigg |
| `block.svg` | sbed |

## License

MIT — see [LICENSE](LICENSE).
