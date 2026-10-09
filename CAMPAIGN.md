# Starting a new campaign

Ten steps. Nothing here is optional except step 7 and, until someone else has
to host the page, step 10.

---

## 0. Clone the template — do not build from scratch

```bash
gh repo create design-mkt-1/tw-<campaign> --template design-mkt-1/tw-lp-template --private --clone
cd tw-<campaign>
```

No `gh`? Use **Use this template** on the repo page on GitHub, then clone.

Confirm you are starting clean:

```bash
python -m pip install fonttools brotli playwright
python -m playwright install chromium

python tools/drift.py            # → 16 shared file(s) match SHARED.lock
python tools/smoke.py            # → 2 viewport(s) x 3 language(s), all clean
python -m http.server 8000       # → http://127.0.0.1:8000
```

If `drift.py` fails on a fresh clone, the template itself is broken. Fix it
there, not here.

---

## 1. Read the skill first

`.claude/skills/topwin-lp/SKILL.md` came with the clone. It is the decisions
this repo is the consequence of, and it is shorter than the mistakes it
prevents.

---

## 2. Bound the mechanic before writing it

The mechanic is the one genuinely new decision per campaign. Everything else
is already settled.

Answer six things, in writing, before any code:

1. Does the visitor always win? (A campaign funnel usually says yes — both
   earlier landings decided this independently and identically.)
2. How many interactions before the pop-up opens?
3. What does the reveal show?
4. What happens under `prefers-reduced-motion`?
5. What happens on reload? (Nothing persists. That is deliberate for a
   campaign page.)
6. Which layout mode — scrolling, fixed stage, or artboard?

Get that approved. Then write it down in `docs/BRIEF.md`.

---

## 3. Fill in `campaign.js`, top to bottom

It is the only config file. Every key is commented in place.

- `id` — the repo name. Rides on the payload as `landing_id` and on every event.
- `offer` — **numbers only**. `percent`, `amount`, `currency`, `spins`, `code`.
  The words around them live in `strings`, once per locale, and interpolate
  `{percent} {amount} {currency} {spins}`. Changing 225% / 15000 to
  300% / 20000 is a two-value edit here and no language table is touched.
- `links` — `home`, `login`, `terms`, `privacy`, `cta`. With the platform
  connected, `terms`, `privacy` and `login` come from IT's landing response and
  these values are only the fallback if that call fails. **Off the platform,
  `terms` and `privacy` block go-live.** An empty string leaves the anchor with
  no `href` at all, which is the honest state of an unfilled seam; never write
  `"#"`.
- `offer.code` is not sent to the platform: IT sets the promo code on their
  CRM landing and `js/platform.js` sends it as `promocode`.
- `params` — the campaign's UTM block, appended to every link and copied into
  the form payload.
- `passthrough` — query parameters on the landing URL that ride through to the
  outbound click. This is how an affiliate click id survives the page.
- `analytics` — leave empty unless someone named a vendor. Empty means zero
  third-party requests.
- `form.hiddenFields` — anything the platform wants on the payload.
- `header.mute` — `false` unless your mechanic has audio. A dead speaker in the
  bar is worse than no speaker.
- `sounds` — name → file, and it is what actually draws the speaker: empty means
  no `Audio` element is made and no button is rendered **even with
  `header.mute: true`**. A mechanic with audio sets both. It plays a clip with
  `TW.sound('name', 0.9)` and owns no audio code of its own.
- `strings` — only the keys this campaign owns. Anything the header, footer or
  dialog says is already in `js/strings.js` and must not be copied here.

---

## 4. Connect to IT

Every landing is connected to IT's platform by default (`js/platform.js`,
loaded by `index.html`). It needs its own id before it goes live:

1. **Ask IT for this landing's `landing_id`.** Do not guess it and do not copy
   one from another campaign.
2. **On the server only**, copy `config.example.json` to `config.json` next to
   `index.html`. Set `id` to IT's number, and `landing` to
   `…/api/jp/landing/<that same id>`. `config.json` is never committed: the
   template's `.gitignore` names it. The Pages allowlist does not publish it, so
   a Pages-hosted build has no `config.json` and runs as a silent demo.
3. **Never ship id 12.** That is tw-flip-cards-lp's live landing. A copied id
   silently sends registrations to another landing, and the only symptom is
   wrong statistics. Nothing on screen says so.
4. **Test on localhost.** On `localhost`, `127.0.0.1` or `https://land-crm…` the
   page uses `campaign.js` → `platform.dev`, IT's dev landing 8, not your id.
   Run `python tools/platform_test.py`; it is stubbed and sends no request.
   On localhost a real submit gets as far as IT and then fails with
   "reCAPTCHA verification failed" (422). That is expected: see traps.md, "A
   real registration from localhost fails on reCAPTCHA". Prove a real
   registration on `landings.top-win.promo` with your own id before go-live.
5. **Before go-live**, check each of these:
   - the production API is in the CSP `connect-src` (it is, in `index.html`);
   - a reCAPTCHA v3 key for the live domain is registered with Google; the page
     uses the `recaptcha_key` that IT's landing response returns;
   - CORS on IT's landing and registration endpoints allows the live domain;
   - the live URL's browser console shows no `[platform] config.json not found`
     line and no CSP refusal.

Not needed, but possible: a CSP `form-action` for the SSO origin. It is absent,
so the `/api/welcome` POST is not restricted. If IT adds one, it must allow the
origin of the `redirectUrl` in the registration response (for TopWin, the
tracker mirror, not the casino), and the origin of the landing's `rules` URL
only if a response can come back without `redirectUrl`. README-IT section 3
says the same.

---

## 5. Pick the layout mode

| mode | what you do |
|---|---|
| **scrolling page** — hero, sections, footer | nothing |
| **fixed stage** — full screen, never scrolls | uncomment `<link rel="stylesheet" href="css/stage.css">` in `index.html` |
| **the fold** — one screen of mechanic, footer below it | uncomment `<link rel="stylesheet" href="css/fold.css">` instead. Never both |
| **artboard unit** — pixel-exact Figma hero | define `--u` in `campaign/main.css` (there is a worked example in its header) |

Write which one, and why, in `docs/BRIEF.md`.

---

## 6. Build the mechanic

Three files and one markup block:

```
campaign/main.js       replace the demo
campaign/main.css      replace the demo styles
campaign/assets/       your art
index.html <main>      your markup, with data-i18n on every string
```

It must end in `TW.openForm()`. Do not reach into the dialog, do not
re-implement it, do not call `showModal()` yourself.

Raw exports go in `raw/img/` — gitignored on purpose — and become shipped
assets with:

```bash
python tools/optimize.py hero.png --widths 375,1280,1920
```

Never ship the Figma PNG.

---

## 7. Only if you set analytics.metaPixelId

GA, GTM and Yandex come from the landing response, through `js/platform.js`,
and need no edit. Meta's origins are not in the CSP. Adding `metaPixelId` means
hand-editing the CSP `<meta>` in `index.html` to allow the origins that
`js/shell.js § injectAnalytics` loads. This is the one campaign edit that
cannot live in `campaign.js`: a meta policy cannot be written from JavaScript,
and a CSP refusal appears only in the console. The page looks fine and silently
sends nothing.

---

## 8. Finish the head

In `index.html`: the `<title>` fallback text, `<meta name="description">`, and
`theme-color` if the campaign's ground colour differs. The default-locale copy
in `<main>` should be the real words, so the right text paints before any
script runs.

Leave the icon line alone. `assets/img/favicon_topwin.svg` is the brand mark
and ships on every Top Win landing — it is not the campaign's to change, and
it is not `logo-topwin.svg`, which is 247×44 of horizontal type and unreadable
at 16px.

---

## 9. The gate

Run all four. Each one prints its own evidence; none of them passes on
assertion.

```bash
python tools/drift.py            # you have not edited shared code
python tools/tokens.py --check   # no colour literal outside css/tokens.css
python tools/fonts.py --check    # run AFTER the final copy, including any ₴
python tools/smoke.py            # a real browser, every viewport, every language
```

Then, by hand, in a browser at 320px and at desktop:

- the pop-up opens when the mechanic completes, Escape closes it, the close
  button is visible and reachable, focus returns where it came from
- errors move focus to the **first** bad field only, and are announced
- every language switches every visible string and survives a reload
- `prefers-reduced-motion`: motion degrades, nothing disappears, press
  feedback survives
- one `<h1>`, no duplicate ids, no positive `tabindex`

Then ship:

```bash
git add -A && git commit -m "campaign: <name>" && git push
```

**Repository → Settings → Pages → Source: GitHub Actions.** Left on a branch,
the legacy builder publishes the entire repository and the `_site` allowlist
never runs. Afterwards, confirm on the live URL that `tools/`, `docs/` and
`raw/` all 404.

---

## 10. Only if someone else hosts it

```bash
python tools/handoff.py          # → dist/<id>-<date>.zip
```

The archive holds exactly what the deploy publishes — the script reads the
`cp -r … _site/` line out of `.github/workflows/pages.yml` instead of restating
the list, so the two cannot disagree — minus `campaign/smoke.py` and any
`__pycache__`, which arrive through a door that is meant to be open. Beside the
files it writes a `README-IT.md`: the five link seams, the form endpoint, the
passthrough parameters, and the browser floor.

Send the zip. Do not send the repository: it carries `tools/`, `docs/` and the
guards, none of which are anyone else's problem.

---

## What cannot be closed from a desk

Report these as open. Never as passed.

- **iOS Safari and Android Chrome, on the live URL**: rubber-band scrolling,
  the soft keyboard, landscape, `env(safe-area-inset-*)` on a notched device,
  pinch zoom.
- **Windows High Contrast** (`forced-colors`): the active tab still reads as
  selected, the consent tick is visible.

Both earlier landings declared these limits honestly rather than claiming
them. Do the same.

---

## If you need to change a shared file

Change it in `tw-lp-template`, bump `SHARED.lock` there, note it in that
repo's `CHANGELOG.md`, and pull it down. A decision that changes as well as
code edits `.claude/skills/topwin-lp/references/decisions.md` in the same
commit.

Fixing it here instead is precisely how two landings ended up with four
different oranges.
