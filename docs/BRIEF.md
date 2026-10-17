# Halloween Cards

A daily bonus calendar for the Top Win sportsbook, 23–31 October 2026. One
card per day; only today's card can be claimed. The visitor reads the terms on
the back of the card (Info), presses GET BONUS and goes straight to the
affiliate link. There is no registration pop-up.

- **Repo:** tw-halloween
- **Live:** https://design-mkt-1.github.io/tw-halloween/
- **Figma:** https://www.figma.com/design/s2CqwGqe0O0FcALhBNlTRe/Top-Win?node-id=21-332
  (desktop `21:533`, mobile `21:587`, card states `21:668`, art `21:599`)
- **Copy:** Google Sheet "Halloween" `1RnGESPaRzY78pir-NH0oHaljVWsZkKCgJgG3nA4gfXE`
  (UA + RU; EN translated by us)
- **Started:** 2026-10-17

## The offer

Nine offers, one per day, in `campaign.js § calendar`. Numbers live there; the
words around them are `face.top.*` / `face.bot.*` in `strings`. The back of
each card is `terms.<date>`, verbatim from the sheet.

| day | face (UA) |
|---|---|
| 23 | 100% до / 2 000 UAH / Free Bet |
| 24 | Free Bet / 1 000 UAH / за програну ставку |
| 25 | 25% до / 2 500 UAH / Cashback |
| 26 | 30% до / 3 000 UAH / на депозит |
| 27 | 20% до / 2 500 UAH / Cashback |
| 28 | 30% до / 2 000 UAH / Cashback |
| 29 | 30% до / 1 500 UAH / на депозит |
| 30 | Free Bet / 666 UAH / за ставку 1 500 UAH |
| 31 | 100% до / 2 000 UAH / Free Bet + Cashback 20% |

Face lines approved by the owner, 2026-10-17.

## The mechanic

1. Does the visitor always win? There is no game. Today's card is always open.
2. How many interactions before the pop-up? None — there is no pop-up. GET
   BONUS is an `<a href>` to `TW.url('cta')` (affiliate link + passthrough).
3. What does the reveal show? Info flips the card; the back shows `terms.<date>`.
4. `prefers-reduced-motion`: the flip becomes a crossfade; the carousel slide
   becomes an instant move; press feedback stays.
5. Reload: nothing persists. The state comes from the date alone.
6. Layout: A, a scrolling page. The hero is a carousel over art, then "How does
   it work?", then the shell footer.

### Card state by date

"Today" is the calendar date in Europe/Kyiv. `?day=2026-10-25` overrides it.

| card date vs today | state | label | button |
|---|---|---|---|
| before | past (grey) | `card.label.past` | `card.past`, disabled |
| equal | today (blue) | `card.label.today` | `card.cta`, the link |
| tomorrow | soon (navy, lock) | `card.label.next` | `card.soon`, disabled |
| later | soon | `card.label.later` | `card.soon`, disabled |

Before 23 Oct the first card is "tomorrow"/"later"; after 31 Oct all are past.
The carousel starts centred on today (or on the nearest card).

## Deviations from the template

- **No registration dialog.** The owner chose a plain affiliate redirect. The
  mechanic never calls `TW.openForm()`; GET BONUS links to `links.cta`.
- **`links.cta` is empty** until the affiliate link arrives. Per the template,
  an unset link has no `href`: the button is visible but not a link.
- **Figures inside copy.** `terms.*` are the client's sentences verbatim and
  contain amounts. Splitting them into fragments would break the wording.
- **Card back is not in Figma.** Drawn by us in the card's own style.
- **Halloween logo.** `brand.logo` points at the campaign's own pumpkin logo in
  `campaign/assets/`; `assets/img/logo-topwin.svg` is untouched.

## Art

Exported from Figma `21:599` into `raw/` (gitignored), optimised with
`python tools/optimize.py` into `campaign/assets/`.
