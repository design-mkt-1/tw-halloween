# <campaign name>

Fill this in as you go. It is the campaign's own record — what it is, what was
decided, and anything that deviates from the template. An empty deviation
section is the expected state.

---

## What this campaign is

One paragraph. The offer, the audience, where the traffic comes from.

- **Repo:** tw-<campaign>
- **Live:** https://design-mkt-1.github.io/tw-<campaign>/
- **Figma:** <node URL>
- **Started:** <date>

## The offer

| | |
|---|---|
| percent | |
| amount | |
| currency | |
| spins | |
| bonus code | |

## The mechanic

The six answers from step 2 of CAMPAIGN.md:

1. Does the visitor always win?
2. How many interactions before the pop-up?
3. What does the reveal show?
4. Behaviour under `prefers-reduced-motion`?
5. What happens on reload?
6. Layout mode — scrolling / fixed stage / artboard — and why.

## Art

Where each raw file came from, and the command that produced the shipped one.
`raw/` is gitignored, so this section is the only record of how to regenerate
it.

| shipped file | source | command |
|---|---|---|
| | | |

## Integration

| seam | value | filled by | date |
|---|---|---|---|
| form.endpoint | | | |
| links.terms | | | |
| links.privacy | | | |
| links.cta | | | |
| analytics | | | |

## Deviations from the template

Append-only. One line each: date · what deviated · why · who approved.

An entry here means a shared file was changed. That change belongs in
tw-lp-template, not in this clone — say here why it could not wait.

## Open at ship time

The things that cannot be closed from a desk, and anything else still unverified.

- [ ] iOS Safari on the live URL
- [ ] Android Chrome on the live URL
- [ ] Windows High Contrast
