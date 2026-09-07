# Changelog

Every change to a file in the `SHARED` list in `tools/drift.py` gets a line
here and a bump to `TEMPLATE-REV` in
`.claude/skills/topwin-lp/SKILL.md`. A change that alters a *decision*, not
just code, also edits `references/decisions.md` in the same commit — same
repo, same commit, same review, so the two cannot drift apart.

## v1.0.4

- `js/shell.js` — the offer's hero figure is a campaign decision, not a
  hard-coded percent. `dialogHTML()` reads `offer.hero` (`'percent'` or
  `'amount'`, defaulting to the percent when there is one), gives that node
  `.tw-promo__pct` and the rest `.tw-promo__sub`. New `fitHero()` counts the
  rendered string after i18n and on every language change, and above five
  non-space characters adds `.tw-promo__pct--long`.
- `css/form.css` — `.tw-promo__pct--long`, 50/42/60px against the hero's
  84/68/100. Found by putting the casino landing's offer on this card: it has
  no percent, so it arrived with no large figure at all, and the only fix
  available to a campaign was editing this file. The reasoning is in
  `references/decisions.md § 7a`.
- `campaign.js` — the `hero` key, and the note that an amount which leads wants
  `promo.amount` overridden to the figure alone.

## v1.0.3

- `.github/workflows/pages.yml` — the build deletes `campaign/smoke.py` and any
  `__pycache__` from `_site` after the copy. `campaign/` is on the allowlist
  because the mechanic lives there, and the campaign's own Playwright check
  sits beside it: served on the live URL, that is the same mistake as
  publishing `tools/`, arriving through a door that is meant to be open. Found
  when a `.pyc` turned up in the preview build.
- `tools/handoff.py` — the same two exclusions, and its closing assert now
  fails on them too, so the archive IT receives cannot carry them either.

## v1.0.2

- `css/shell.css` — the bar is 52px, and 64px above 700px, down from 56 and 74;
  the logo 22px and 28px, down from 24 and 34. The 44px controls are untouched:
  the tap target was not what was too big. The height is now `--tw-hdr-h`,
  declared beside the bar, because `css/fold.css` subtracts it.
- `css/fold.css` — NEW, and shared. The third page shape: `#tw-main` is a
  definite box of `92svh` minus the header, the page scrolls, and the footer
  starts below the fold with only its top edge showing. A campaign links this
  or `css/stage.css`, never both.
- `js/audio.js` — NEW, and shared. The sound pool `tw-penalty` carried in its
  own campaign folder: nothing loads until the visitor's first gesture, the
  mute state persists through a `try`, a clip that fails to load never plays.
  `js/shell.js` wires the speaker it already drew and exposes `TW.sound(name,
  volume)` and `TW.muted()`; `campaign.js § sounds` is the map, empty by
  default, and an empty map means no speaker at all.
- `tools/drift.py` — the `SHARED` list gains both new files: 16 entries.

## v1.0.1

- `css/reset.css` — `ul, ol { list-style: none }`. The reset removed the
  indent and left the marker, and `css/shell.css` had quietly set this on its
  own two lists, so the gap only ever showed up in a campaign: the flip-cards
  retrofit drew nine cards on a grid with a white dot beside each of them.
  Found while porting that landing onto the template.
- `tools/handoff.py` — new, and not a shared file. Zips exactly what
  `.github/workflows/pages.yml` stages, by reading that workflow's own
  `cp -r ... _site/` line rather than restating the list, and writes a
  README-IT.md beside it: the five link seams, the form endpoint, the
  passthrough parameters an affiliate click id rides on, and the browser floor.

## v1.0.0

First version. Built from `tw-penalty` and `tw-flip-cards-lp`, taking the
better half of each where they disagreed.

- `css/tokens.css` — the penalty token system verbatim: 11-step ramps derived
  from Orange Fire `#ff4500` and Midnight Navy `#191970`, a semantic layer, and
  the two brandbook contradictions resolved in writing. Added the two one-glyph
  Noto cuts for the hryvnia sign, and named the header-chrome, dialog-shadow
  and scrim values that were previously hex literals in other stylesheets.
- `css/shell.css` — the penalty header, lifted out of its game stylesheet, and
  the penalty footer. Every `cqh`/`cqw` converted to px and one 700px
  breakpoint, so neither bar depends on a layout any more.
- `css/form.css` — the penalty card's content on the flip-cards `<dialog>`
  mechanics. Top layer, so the pop-up is layout-neutral.
- `css/stage.css` — the penalty no-scroll stage, generalised to `body` and
  `#tw-main` and made opt-in with one `<link>`.
- `js/i18n.js` — the penalty runtime engine plus `{}` interpolation, a
  `?lang=` override, and a merge with the campaign's own string table.
- `js/shell.js` — new. Builds the header, footer and dialog from the config,
  wires the five URL seams with UTM and affiliate passthrough, and exposes
  `window.TW`.
- `js/form.js` — the penalty validation and confirmation screen, rehosted on
  the native dialog. The hand-written focus trap and `inert` bookkeeping are
  gone; `showModal()` does it.
- `campaign.js` — new. The single config surface.
- `tools/tokens.py` — new. The guard that would have caught every colour
  divergence in this project's history.
- `tools/drift.py` — new. Replaces the three-file parity job, which had
  nothing left to compare.
- `tools/fonts.py` — coverage check only, reading real cmaps rather than
  declared unicode-ranges.
- `tools/smoke.py` — the flip-cards Playwright harness, generalised, with five
  assertions only a template needs.
