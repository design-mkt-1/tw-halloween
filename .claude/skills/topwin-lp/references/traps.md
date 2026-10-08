# Traps

Bugs already paid for, in this template and in the two landings it replaces.
Every one of them is silent: the page renders, the console is clean, and the
thing is wrong. That is what makes them worth a document.

---

## The hryvnia sign, U+20B4

**Symptom** `₴` renders thin and narrow beside black italic digits, in a face
nobody chose.

**Why it is silent** Roboto has no hryvnia — not at any weight, not at any
width, not in any release — and the Google Fonts API *advertises* U+20B4 in the
`unicode-range` it serves for Roboto's `cyrillic-ext` subset while the file
behind that range does not contain the glyph. Figma cannot draw it either, so
the artboards show a fallback and are no reference. A missing glyph still
renders **something**, from whatever face the system picks. This shipped live on
nine cards in three languages.

**Rule** The declared `unicode-range` in a stylesheet is not evidence. Two
one-glyph Noto Sans Black cuts carry the sign, declared across the full weight
range rather than at 900 alone — a hryvnia in body copy must render too, and a
face declared only at 900 would not be picked for it. Run
`python tools/fonts.py --check` after the final copy; it reads the actual cmap
out of each woff2. See `css/tokens.css § "The hryvnia sign, U+20B4"` and
`tools/fonts.py § module docstring`.

---

## Figma's "Auto" leading is not CSS `normal`

**Symptom** Type sits two pixels off the comp per display line, and every
measurement downstream of it is off by the same amount.

**Why it is silent** Figma's "Auto" for Roboto is (ascender 1900 + descender
500) / 2048 = **1.171875**. CSS `normal` is a different number: Chrome adds the
variable font's line gap on top and lands on **1.1975**. Both look like
leading; neither errors.

**Rule** Never leave a display line on `line-height: normal` and call it
Figma-accurate. This template writes an explicit `line-height` on every node
that has one, so there is no `--lh-auto` token here — nothing is left to
`normal`. Measured in `tw-flip-cards-lp/css/styles.css` at `--fc-auto-lh`.

---

## `font-variation-settings: "wdth" 75` beside `font-stretch: 75%`

**Symptom** The condensed headline is condensed twice and comes out visibly
narrower than the comp.

**Why it is silent** Figma reports `wdth 75` next to the font name, so it reads
like a property to copy. The stylesheet already sets that axis through
`font-stretch`, which is the high-level form of the same axis. Two declarations
of one axis multiply.

**Rule** `font-stretch: 75%` IS "Condensed". `--font-stretch-tight` in
`css/tokens.css` names the coordinate. Never write the low-level form, and never
name "Roboto Condensed" as a family.

---

## `filter` or `box-shadow` on a node that rotates in 3D

**Symptom** A card flip collapses into a sideways squash instead of turning.

**Why it is silent** `filter` forces `transform-style` back to `flat` on the
element it is applied to. Nothing warns; the transform still runs, in the wrong
space. `box-shadow` on the rotating nodes has the same effect. The flip-cards
repo's cards deliberately cast no CSS shadow at all for this reason, and
`overflow: hidden` belongs on the face, never on the flip container.

**Rule** If a node rotates in 3D, it carries no `filter` and no `box-shadow`.
Put either on a wrapper that does not rotate. Stated in
`campaign/main.js § "Rules that still apply"`.

---

## `[hidden]` is `!important`, so show/hide is a two-step

**Symptom** An element that should fade in simply appears, or the transition
"does not run".

**Why it is silent** `css/reset.css` declares `[hidden] { display: none
!important }`, and `display` cannot be transitioned. Removing `hidden` and
adding the transition class in the same tick means the browser has no "before"
to interpolate from.

**Rule** Unhide, let **one frame** pass — two nested `requestAnimationFrame` —
then add the class the transition runs on. Both existing implementations do it:
`js/i18n.js § nextFrame()` and `js/form.js § mark()`. Toggle with `el.hidden`,
not with an inline `display`.

Same trap, different hat: the browser's own `dialog:not([open]) { display:
none }` is a bare element selector, so any class-level `display: flex` on
`.tw-dialog` quietly beats it and leaves the **closed** dialog in normal flow —
650px of apparent emptiness under the footer and an autofocus that scrolls the
page to the bottom on load. The flex belongs to `[open]`, and `tools/smoke.py`
asserts it.

---

## The three hand-fixed icons

**Symptom** A fresh Figma export silently reverts one of them.

**Why it is silent** Each is a valid SVG that renders. What is missing is not
an error.

- `flag-ua.svg` and the other two flags are **not exports at all**. The design
  uses flag emoji, and Windows has no flag glyphs — Segoe UI Emoji renders 🇺🇦
  as the bare letters "UA". These are the MIT flag-icons 7.5.0 SVGs, served
  from the repo. `TW_LOCALES.flag` and `form.dialFlag` both take a file path,
  never an emoji. See `assets/img/icons/FLAGS-LICENSE.txt`.
- `eye.svg` is an export **plus one shape**. Figma's export of node 12:523
  carries only the almond; the pupil is a second circle the exporter drops. It
  is restored by hand (r=2.5 at 10,10, measured off Figma's own 20×20 render)
  and the comment at the top of the file says so. A fresh export loses it again.
- `copy.svg` is drawn by hand. Figma composes the copy button out of two frame
  borders (19:2532 / 19:2533) rather than a vector node, so there is nothing
  there to export.

**Rule** Diff any re-exported icon against the committed one before replacing
it, and read the comment at the top of the file first.

---

## A CSP refusal appears only in the console

**Symptom** Analytics is configured, the page looks perfect, and nothing is
sent. Or: a fix "does not apply" and the styles look right anyway.

**Why it is silent** A blocked request produces a console message and no user-
visible effect at all. The policy names the platform's origins (IT's API, ipify,
reCAPTCHA, GA, GTM, Yandex). Anything else is refused and the page looks fine.

**Rule** Meta's origins are not in the policy. Adding `metaPixelId` requires a
hand edit of the CSP `<meta>` in `index.html`, because a `<meta>` policy cannot
be written from JavaScript. Pointing `form.endpoint` at a different origin needs
that origin in `connect-src`, because `default-src 'self'` covers `fetch`.
`style-src` carries `'unsafe-inline'` for the `noscript` block and the style
attributes the shell sets; removing it breaks both silently. See
`index.html § CSP comment block`.

---

## A missing config.json is a silent demo

**Symptom** The live page looks finished. The form validates, the confirmation
screen with a login and a password appears, and nothing reaches IT. Statistics
stay at zero.

**Why it is silent** Without `config.json`, `js/platform.js` takes the demo path
on purpose, so an unconnected build cannot break the page. The only sign is one
console line: `[platform] config.json not found: this build is not connected to
the platform.`

**Rule** Check the console on the live URL before the first campaign goes out.
`config.json` is not in the Pages allowlist, so a Pages build never has one
unless the deploy adds it (see CAMPAIGN.md step 4).

---

## IT's inline analytics scripts are blocked by our CSP

**Symptom** IT's own LP has its analytics pasted inline in its HTML. Copied
as-is, the GA, GTM and Yandex tags never run, and nothing says why.

**Why** Our CSP has no `'unsafe-inline'` in `script-src`. An inline `<script>`
is refused. The refusal goes to the console only.

**Rule** `js/platform.js` does not paste inline. It appends `<script src>`
elements for the same tags, from the same landing response, and checks each ID
first. Keep it that way: a new analytics tag goes through the same route, or
into the CSP, and never as inline text.

---

## A copied landing id sends registrations to the wrong landing

**Symptom** Registrations work and the confirmation or SSO is fine. The IT
statistics for this landing are wrong, or show up under another landing.

**Why it is silent** The id is sent as `landing_id` in the body and as the
`landing/<id>` in the URL. Both are read from `config.json`, and nothing in the
page can tell that the id belongs to a different landing.

**Rule** Never ship id 12, or any id you did not get from IT for this landing.
`config.example.json` carries the placeholder `0`, which fails loudly
(`config.json needs { id, email_registration, landing }`) rather than sending
anything. Get the id from IT before go-live, and test a real registration on
the live domain, not on localhost (see the next-but-one trap).

---

## In Git Bash, `git -C D:\path` loses the backslash

**Symptom** `git -C D:	w-lp-template status` fails, or runs in the wrong place,
when typed in Git Bash.

**Why** In Git Bash the backslashes in `D:\path` do not survive, so the path git
receives is not the one you typed. Observed, not traced further.

**Rule** Use forward slashes: `git -C D:/tw-lp-template status`. The same goes
for any path given to a script run from Git Bash.

---

## A real registration from localhost fails on reCAPTCHA

**Symptom** You test on `localhost` and the page loads fine. The form submits,
then shows the security-check error. The console shows `[platform]
registration failed: reCAPTCHA verification failed. Please try again.` and the
`registration/email` POST answers **422**.

**Measured on 2026-10-08** Both this template and tw-flip-cards-lp behave the
same on localhost, using the same `js/platform.js`. tw-flip-cards-lp registers
fine in production. The steps before it all pass from localhost:
- `GET landing/8` answers 200, so CORS is fine;
- reCAPTCHA loads;
- ipify answers;
- the POST reaches IT.

Only IT's server-side reCAPTCHA check refuses.

**Why (inferred, not confirmed by IT)** On localhost the page uses
`platform.dev`, which is IT's dev landing 8. Its reCAPTCHA key is most likely
not registered with Google for `localhost`, so the token is rejected for the
wrong domain. The code is not at fault.

**Rule** Localhost proves everything up to the POST, and nothing after it. To
prove a real registration and the SSO hand-off, test on a domain IT's key
allows: for Topwin, a test landing on `landings.top-win.promo` with the id IT
gave you, before go-live. Do not "fix" platform.js for this error.

---

## The GitHub Pages source

**Symptom** `tools/`, `raw/` and every dotfile are downloadable from the live
site, and the workflow is green.

**Why it is silent** Left on a branch, the legacy Jekyll builder succeeds and
publishes the **whole repository**, bypassing the `cp` allowlist in
`.github/workflows/pages.yml` entirely. Nothing in the workflow warns you.

**Rule** Set the repository's Pages source to "GitHub Actions" by hand, then
verify by fetching `tools/drift.py` from the live URL — it must 404. This is a
checklist item, not a code fix. See `.github/workflows/pages.yml § header
comment`.

---

## Smaller ones, same shape

- **A container query does not raise specificity.** A bare class inside one
  loses to the same class declared in a later stylesheet. `css/stage.css`
  carries `body` in front of both selectors in its landscape block for exactly
  this reason; `tw-penalty` shipped that bug for an entire port. Do not tidy
  those selectors down to the class alone.
- **A container is measured by its CONTENT box, and cannot be styled by its own
  query.** A 504px card with 24px of padding queries as 454 and never matches a
  480 threshold. The dialog is in the top layer and uses a plain media query
  instead.
- **`width: <px>; max-width: 100%` is a no-op on a grid item that declares its
  width.** `width: min(<px>, 100%)` is the form that works.
- **Any input under 16px makes iOS Safari zoom the page on focus**, which looks
  like a bug mid-registration. Including the ones the design draws at 15.
- **Viewport units break browser zoom.** Text a visitor reads stays in real px
  in all three layout modes, including the artboard one.
- **`python -m http.server` sends no `Cache-Control`,** so Chrome caches
  stylesheets heuristically. A fix that "does not apply" is usually the old file
  still in the page — confirm against `document.styleSheets` before diagnosing.
- **A hidden tab pauses `requestAnimationFrame`.** Driving the page from a
  script in a background tab stalls a mechanic mid-sequence with no error and no
  message. Check `document.visibilityState` before hunting.
- **Two duplicated constants with no link between them** — a sprite sheet's
  `FRAMES`/`COLS`/`SIZE` in the generator and the reader's own copies — do not
  raise when they diverge. The sheet stays a valid image and the reader keeps
  slicing it, from the wrong cells.
- **`navigator.clipboard` needs a secure context** and is undefined over plain
  http or from `file://` — someone will double-click the HTML.
  `js/form.js § copy()` falls back to a selection.
- **`localStorage` throws in private mode.** Every access in `js/i18n.js` is
  wrapped for that reason.
