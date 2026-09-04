# Audit: the two Top Win landings against the template

Date: 2026-09-04 · Template: `tw-lp-template` v1.0.0 (`cd6f7b7`)
Audited: `tw-penalty` `752fceb` · `tw-flip-cards-lp` `07844ab`, both `main`.

Method: the template's own four guards, repointed at a fresh clone of each
landing. Nothing in either repository was changed — no commit, no branch, no
push. The audit script lives outside both repos; only this report is committed.

---

## Verdict

**`tw-penalty` is behind the template, not forked from it.** All 72 of its
design tokens exist in the template with byte-identical values; the template
simply has 15 more, all of them the header chrome and shadow values `tw-penalty`
never needed. Adoption is a pull, not a port.

**`tw-flip-cards-lp` shares nothing with the template's colour layer** — 0 of 87
token names — and its three-HTML-file translation model is structurally
incompatible with `js/i18n.js`. Adoption is a rewrite of the shell, keeping the
card mechanic.

**One finding is live and worth fixing regardless of the template:**
`tw-flip-cards-lp` ships four `href="#"` links on all three languages, including
Terms of Use, Privacy Policy and the orange "go to site" button on the
confirmation screen. `tw-penalty` ships none.

---

## Scoreboard

| Dimension | template | `tw-penalty` | `tw-flip-cards-lp` | Produced by |
|---|---|---|---|---|
| Shared files present / byte-identical | 14 / 14 | 7 / 0 | 3 / 0 | `drift.verify()`, `ROOT` repointed |
| Token names shared with the template | 87 | 72 | 0 | name/value diff vs `css/tokens.css` |
| Token values identical where shared | 87 | 72 | 0 | same |
| Colour literals outside `tokens.css` | 0 | 44 | 59 | `tokens.main()` |
| Distinct characters / missing glyphs | 128 / 0 | 127 / 0 | 120 / 0 | `fonts.main()` |
| Browser pass: runs / failures | 6 / 0 | 6 / 0 | 6 / 6 | portable subset of `smoke.py` |
| Dead `href="#"` links | 0 | 0 | 4 per page | `smoke.py:119-121` |
| `raw/` committed to a public repo | no | no | **30 files, 4.2 MB** | `git ls-files raw/` |
| Pages live / private paths exposed | — | yes / none | yes / none | `urllib` status codes |
| Adoption cost | — | **pull** | **port** | — |

---

## `tw-penalty`

### Shared files

Seven of the fourteen locked filenames exist; none matches `SHARED.lock`,
because the template moved on after being distilled from it. Divergence, with
line endings normalised the way `tools/drift.py:61-65` normalises them:

| File | template lines | lines that differ |
|---|---|---|
| `css/reset.css` | 63 | 9 |
| `css/tokens.css` | 307 | 85 |
| `css/stage.css` | 167 | 225 |
| `.github/workflows/pages.yml` | 95 | 66 |
| `css/form.css` | 791 | 661 |
| `js/i18n.js` | 331 | 407 |
| `js/form.js` | 402 | 723 |

Absent entirely: `css/shell.css`, `js/strings.js`, `js/shell.js`, and all four
guard scripts. `tools/` holds `ball_sheet.py`, `cutout.py`, `sfx.py` instead.

### Colours

`css/tokens.css` is a strict subset of the template's: 72 names, all 72 with
identical values. The 15 the template adds are the ones the `CHANGELOG` records
as "previously hex literals in other stylesheets" — `--chrome-bar`,
`--chrome-menu`, `--scrim`, `--shadow-cta`, `--plate-shadow` and the rest of the
header chrome.

Forty-four colour literals still sit outside the token file:

| File | literals |
|---|---|
| `css/game.css` | 39 |
| `css/form.css` | 3 |
| `css/footer.css` | 2 |

`css/reset.css` and `css/stage.css` are clean.

### Fonts

Clean. 127 distinct characters in the copy, all carried by the 6 shipped Roboto
faces. The hryvnia sign is not a problem here.

### Browser

Six runs (2 viewports × 3 languages), zero failures on the portable checks:
opens at the top, nothing below the footer, no unresolved `data-i18n` key, no
dead link, no tap target under 24×24, no console error or warning.

Four of `smoke.py`'s nine assertions are **not applicable**: they name
`.tw-hdr`/`.tw-ftr`, `#tw-signup`, `TW.openForm()` and `TW.config.languages`.
`tw-penalty` has `.hdr`/`.ftr`, a hand-written focus trap and no `<dialog>` at
all, so those four measure the template's shell, not this page.

### CI and deploy

`.github/workflows/pages.yml` fires on `push: [main]` and `workflow_dispatch`
only — **no `pull_request` trigger and no guard job**. Two jobs, `build` then
`deploy`, with `cp -r index.html .nojekyll css js assets _site/`. Nothing
checks a change before it is merged; the build allowlist is correct.

### Live

`https://design-mkt-1.github.io/tw-penalty/` → 200. `tools/cutout.py`,
`docs/ART.md`, `docs/NEXT-SESSION.md` → 404 each. The "Pages source left on a
branch" trap did not fire.

---

## `tw-flip-cards-lp`

### Shared files

Three of the fourteen filenames exist — `tools/fonts.py`, `tools/smoke.py` and
`.github/workflows/pages.yml` — and none matches the lock. The stylesheets and
scripts have no filename in common with the template at all: `css/` holds one
file, `styles.css` (54 KB); `js/` holds one file, `flip.js`.

### Colours

No `tokens.css` exists. All 59 colour literals live in `styles.css`, including
both `#ff4500` and `#d93900` — the two oranges the template was built to settle.
Its 36 custom properties are `--fc-*`, `--artboard-w`, `--cu`: zero overlap with
the template's 87 names.

### Fonts

Clean. 120 distinct characters, all carried by the 7 shipped faces — which
already include the two one-glyph Noto hryvnia cuts the template adopted.

### Browser

Six runs, six failures, all the same finding: four `href="#"` links per page,
in every language and both viewports.

```
[desktop index.html] dead link(s): Умови Використання, Політику конфіденційност, Увійти, fc-submit
[desktop en.html]    dead link(s): Terms of Use, Privacy Policy, Sign in, fc-submit
```

Confirmed on the live site, not just the clone:

```
<a href="#" id="fc-terms">Умови Використання
<a href="#" id="fc-privacy">Політику конфіденційності
<a href="#" id="fc-login">Увійти
<a class="fc-submit" id="fc-go" href="#" data-i18n="done.cta">Перейти на сайт
```

Root cause is a deliberate choice at `js/flip.js:847-852`: the map sets an
`href` only `if (el && url)`, and `js/flip.js:50` states "Empty means the link
stays `href="#"` and does nothing." The four URLs — `termsUrl`, `privacyUrl`,
`loginUrl`, `siteUrl` — are all `''`.

The template made the opposite call. `js/shell.js:364-370`:

```js
if (href) el.setAttribute('href', href);
else el.removeAttribute('href');
```

An unset seam leaves no `href`, so it is not a control at all. `href="#"` takes
focus, is announced as a link, and does nothing. `tw-penalty` already does it
the template's way — `<a data-i18n="agree.terms">Terms of Use</a>`, no `href`.

The other five portable checks pass: opens at the top, nothing below the footer,
no unresolved key, no undersized tap target, no console error.

### CI and deploy

Better than `tw-penalty`'s. Fires on `push` **and** `pull_request` to `main`;
jobs `parity` and `smoke` (Playwright) gate `build` via `needs: [parity, smoke]`.
The parity job keeps the three HTML files structurally identical by comparing
tag sequences — a check that exists only because the three-file model exists.

### Repo hygiene

`raw/` is committed: 30 files, 4.2 MB, in a public repository, including seven
Google Fonts source `woff2` files. Its `.gitignore` lists only `Thumbs.db`,
`.DS_Store`, `*.log`, `__pycache__/`. The template's `.gitignore` adds `raw/`
with a comment naming this exact incident at a sibling repo.

### Live

`https://design-mkt-1.github.io/tw-flip-cards-lp/` → 200. `tools/optimize.py`,
`tools/smoke.py`, `README.md` → 404 each. Deploy allowlist correct.

---

## What a retrofit would break

**`tw-penalty`** — little. Its tokens are a subset with identical values, so
`css/tokens.css` can be replaced outright. The real work is `css/game.css`: 39
colour literals to move onto semantic tokens, and the game stylesheet still
carries the header that `css/shell.css` now owns. `js/form.js` and `js/i18n.js`
are different implementations of the same contract — replaceable, but not by
copy.

**`tw-flip-cards-lp`** — the shell, entirely. `js/i18n.js` switches language at
runtime against one HTML file; this landing serves three files and keeps them in
sync with a CI tag-count check. Adopting the template means deleting `ru.html`
and `en.html`, moving their copy into a string table, and dropping the `parity`
job that guards a problem that would no longer exist. The 59 colour literals and
36 `--fc-*` properties have to be re-expressed against the template's semantic
layer. The card mechanic itself would survive as `campaign/main.js`.

## What is already right

- Both deploy through an explicit allowlist. Neither leaks `tools/`, `docs/` or
  `raw/` on the live URL.
- Both pass the glyph check. The hryvnia bug is closed in both.
- `tw-flip-cards-lp` already ships the two Noto hryvnia cuts and already gates
  merges on a Playwright job — the template took both ideas from it.
- `tw-penalty` already leaves unset links with no `href`, which is the rule the
  template later wrote down.

## Not checked

- iOS Safari, Android Chrome, Windows High Contrast. These cannot be closed from
  a desk and are reported open, per `CAMPAIGN.md § "What cannot be closed from a
  desk"`.
- No visual diff, no performance measurement, no accessibility sweep beyond tap
  target size and the dead-link check.
- The four `smoke.py` assertions that name the template's shell. They are
  inapplicable to both landings, not failing.

## Reproducing this

```
git clone --depth 1 https://github.com/design-mkt-1/tw-penalty.git
git clone --depth 1 https://github.com/design-mkt-1/tw-flip-cards-lp.git
python audit_lp.py
```

The audit script imports `drift`, `tokens`, `fonts` and `smoke` from
`tw-lp-template/tools`, then repoints their module globals — `drift.ROOT`,
`tokens.ROOT`/`tokens.CSS`, `fonts.ROOT`/`fonts.FONTS`/`fonts.SOURCES`,
`smoke.ROOT` — at the clone. `drift.LOCK` deliberately stays the template's:
that is the comparison. Only `smoke.py` needed a substitute, and only for the
four assertions listed above.
