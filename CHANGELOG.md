# Changelog

Every change to a file in the `SHARED` list in `tools/drift.py` gets a line
here and a bump to `TEMPLATE-REV` in
`.claude/skills/topwin-lp/SKILL.md`. A change that alters a *decision*, not
just code, also edits `references/decisions.md` in the same commit — same
repo, same commit, same review, so the two cannot drift apart.

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
