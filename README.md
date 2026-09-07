# tw-lp-template

The starting point for every Top Win campaign landing page. Clone it, edit
`campaign.js`, build the mechanic, ship.

Plain HTML, CSS and JavaScript. **No package.json, no bundler, no build step,
no Node.** Open `index.html` over a local server and it runs; GitHub Actions
copies the same files to Pages.

```bash
python -m http.server 8000     # then http://127.0.0.1:8000
```

---

## Why this exists

Two Top Win landings were built before this one, `tw-penalty` and
`tw-flip-cards-lp`. Both are good. They also solved the same problems twice,
differently:

| the same problem | one answer | the other |
|---|---|---|
| an orange that passes AA as small text | `#d63a00` | `#d93900` |
| an AA-safe green | `#006e3d` | `#00874a` |
| a muted grey | `#5f6673` | `#656d7e` |
| typography | one Roboto variable family | Roboto Flex **+** Inter Var |
| three languages | a runtime table, one HTML file | three HTML files and two CI jobs to keep them equal |
| the registration modal | a hand-written focus trap | a native `<dialog>` |
| a header | one, welded into the game's stylesheet | none at all |

`css/tokens.css` in the older of the two already records the *previous*
generation of the same failure — three greens invented by hand, `#30d158`,
`#3dd629`, `#3fd62b`, in three stylesheets, all meant to be the same green.
The next landing invented a fourth orange anyway.

Prose does not stop that. So the shared files are hashed and the hashes are
committed, and four guards run on every pull request.

---

## What is shared and what is yours

**Never edit these in a campaign clone.** `python tools/drift.py` fails CI if
you do, and the list is the `SHARED` array in `tools/drift.py`:

```
css/reset.css   css/tokens.css   css/shell.css   css/form.css   css/stage.css
css/fold.css    js/strings.js    js/i18n.js      js/form.js     js/audio.js
js/shell.js     tools/drift.py   tools/tokens.py tools/fonts.py tools/smoke.py
.github/workflows/pages.yml
```

Sixteen files. Two scripts in `tools/` are deliberately outside the lock:
`optimize.py`, for the reason written at `tools/drift.py:58`, and `handoff.py`,
which packages a build rather than defining what a correct one is.

**These are the campaign** — this is what a campaign *is*:

```
campaign.js            the offer, the links, the tracking, the languages, the copy
campaign/main.js       the mechanic
campaign/main.css      its styles, and the layout mode
campaign/assets/       its art
index.html <main>      the mechanic's markup
docs/BRIEF.md          what this campaign is
```

If you need a change in the first list, make it **in this template**, bump
`SHARED.lock`, and pull it down. Fixing it in the clone is the exact move that
produced the two divergent repos.

---

## How the shell gets onto the page

`index.html` carries two empty markers and a `<main>`:

```html
<div data-tw="header"></div>
<main id="tw-main"> … your campaign … </main>
<div data-tw="footer"></div>
```

`js/shell.js` replaces the markers with the header and the footer and appends
the registration `<dialog>` to `<body>`. There is no bundler, so there is no
`import`: the markup is a template string in that file, and `defer` on the seven
scripts keeps them in source order — `campaign.js`, `strings`, `i18n`, `form`,
`audio`, `shell`, then `campaign/main.js` last.

The cost, stated rather than defended: the chrome needs JavaScript, and it is
not in view-source. Both existing landings are already dead without JavaScript
— there is no game and no form — and `<title>`, the description and the
campaign hero stay static in the HTML where a crawler and the first paint want
them.

### The one seam

```js
TW.openForm()
```

That is the entire coupling between a mechanic and the shell. The rest of
`window.TW` — `ready`, `t`, `lang`, `setLang`, `url`, `track`, `on`, `config` —
is documented at the top of `campaign/main.js`.

---

## Layout: pick one of four

The shell is layout-neutral. Both bars are ordinary blocks measured in px;
there is no `cqh`, no `cqw`, no `--u` and no `vh` in `css/shell.css`, because
those units are exactly what welded the last two landings to their own pages.

| you want | you do | files |
|---|---|---|
| a scrolling page with sections | nothing | 0 |
| a full-screen page that never scrolls | uncomment `<link href="css/stage.css">` in `index.html` | 1, shipped |
| one screen of mechanic, the footer below the fold | uncomment `<link href="css/fold.css">` instead | 1, shipped |
| an artboard-exact hero | define `--u` in `campaign/main.css` | 0 |

`css/stage.css` and `css/fold.css` answer the same question, so a campaign links
**at most one**. Whichever loaded second would win, and neither file expects the
other's box.

---

## Languages

`js/strings.js` holds the shell's ~50 strings per language; `campaign.js`
holds the handful the campaign owns. `js/i18n.js` merges them, campaign
winning.

Adding a language is **two object literals and one array entry** — one in
`js/strings.js`, one in `campaign.js`, plus the code in `languages`. No new
file, no new `<script>`, no HTML, no CSS, no component touched. Translate
`js/strings.js` once and every future campaign inherits that language.

Order of detection: `?lang=ru` → `localStorage['tw-lang']` → `navigator.language`
→ the first entry in `languages`.

`ua` is the internal code the design and the menu use; `uk` is the real
language tag and is what `<html lang>` gets. Without that map every Ukrainian
browser (`uk-UA`) misses the table and lands on the fallback — and only *looks*
right, because the fallback is Ukrainian.

---

## The seams nobody has filled in

Every one of these ships empty and is honest about it.

| seam | empty means |
|---|---|
| `form.endpoint` | nothing is sent; the payload goes to `console.info` and `demoDone` walks the confirmation screen |
| `analytics.gtmId`, `metaPixelId` | no script is injected and **not one third-party request is made** |
| `links.*` | the anchor gets **no `href` at all** — not a tab stop, not announced, not clickable. Never `href="#"` |
| `offer.spins` | the "+ N FS" line is not rendered |
| `sounds` | nothing is loaded and the header draws **no speaker at all** — a dead mute button is worse than none. It needs `header.mute: true` *and* a non-empty map |

Two of them block go-live: `links.terms` and `links.privacy`. The page collects
an 18+ consent, and dead consent links on a gambling registration form are a
compliance problem, not a cosmetic one.

Setting an analytics id also needs the CSP `<meta>` in `index.html` swapped for
the commented one — a meta policy cannot be written from JavaScript. A CSP
refusal appears only in the console; the page looks fine and sends nothing.

---

## The guards

```bash
python tools/drift.py           # the shared files are the template's
python tools/tokens.py --check  # no colour literal outside css/tokens.css
python tools/fonts.py --check   # every rendered character exists in a shipped face
python tools/smoke.py           # a real browser, 2 viewports x every language
```

They need `fonttools brotli playwright` and one `python -m playwright install
chromium`. All four run on every pull request as well as every push — in the
landing this workflow came from they lived inside the build job, which only ran
after a merge, so every guard reported a problem that was already on `main`.
That is how the hryvnia bug reached production.

`tools/fonts.py` is the one that catches the next hryvnia: Roboto has no `₴` at
any weight, Google's API advertises `U+20B4` in a subset whose file does not
contain the glyph, and Figma cannot draw it either. Nothing fails loudly,
because a missing glyph still renders *something*.

### The two that are not guards

```bash
python tools/optimize.py hero.png --widths 375,1280,1920   # raw/ → assets/, WebP
python tools/handoff.py                                    # the archive IT receives
```

`handoff.py` zips exactly what the deploy publishes, by reading the `cp -r …
_site/` line out of `.github/workflows/pages.yml` rather than restating the
list, and writes a `README-IT.md` beside it: the five link seams, the form
endpoint, the passthrough parameters an affiliate click id rides on, and the
browser floor. Run it when someone else has to host the page.

---

## Deploying

GitHub Actions → Pages, on push to `main`. The build step is an explicit
allowlist, never `cp -r .`:

```
index.html campaign.js .nojekyll css js campaign assets
```

**Set the repository's Pages source to "GitHub Actions".** Left on a branch,
the legacy Jekyll builder succeeds and publishes the whole repository —
`tools/`, `docs/`, `raw/` and all — bypassing that allowlist entirely, and
nothing warns you.

---

## Browser support

Floor: **Chrome/Edge 105, Safari 16, Firefox 110.** Full motion from
**Chrome/Edge 117, Safari 17.4, Firefox 129.**

| feature | where | below the floor |
|---|---|---|
| `<dialog>` + `showModal()` | `css/form.css`, `js/form.js` | the pop-up does not open — hard fail |
| `container: … / size` | `css/stage.css` **only** | the landscape footer-drop never applies; the page still works |
| `@starting-style`, `allow-discrete` | `css/form.css` | the dialog appears without its entry animation |
| `backdrop-filter` | `css/shell.css`, `css/form.css` | the header bar is a flat colour |

Only stage-mode campaigns carry the container query, so a scrolling campaign
runs down to Safari 15.4.

Nobody has run this on a browser at the floor. The numbers are read off the
features, not off a device.

---

## For agents

`.claude/skills/topwin-lp/` travels with every clone. It carries the decisions
this repo is the consequence of: what was chosen, what was rejected, what is
never to be re-litigated, and the pre-ship checklist. Read it before changing
anything here.

---

## Next steps

`CAMPAIGN.md` is the checklist for starting a new campaign.
