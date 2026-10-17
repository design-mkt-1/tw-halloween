# Handoff — tw-halloween

State on 2026-10-17, end of the first build session. Read `docs/BRIEF.md`
first (what was decided and why), then this file (what is left).

- **Live:** https://design-mkt-1.github.io/tw-halloween/ — Pages source is
  "GitHub Actions"; `/tools/`, `/docs/`, `/raw/` return 404 (checked).
- **Repo:** `design-mkt-1/tw-halloween`, branch `main`, last build commit
  `a896e40`. Remotes: `origin` is this repo, `template` is
  `tw-lp-template` (cloned at v1.0.8, `732152e`).
- **Test any day:** `?day=2026-10-25`, any language: `?lang=ru` / `?lang=en`.
- **Orca:** run `run_23cd8398e0b7`, both tasks completed. CARDS owned
  `campaign/main.js`, `campaign/cards.css`, `campaign/assets/cards/`; PAGE owned
  the `<main>` markup, `campaign/main.css`, `campaign/assets/page/`,
  `brand.logo`. Keep that split if two workers run again.

## 1-2. Carousel edge and slide -- DONE (2026-10-17, second session)

- Edge: the `overflow-x: clip` on `.cmp-cards` is gone at every width; the
  hero's own `overflow: hidden` clips at the screen edge. Measured before:
  at 1280 the box starts at x520, the left neighbour at x486 -- cut 34px.
- Slide: each card's pose is one continuous `--q = --p + --drag` in
  `cards.css`; `main.js § swipe` follows the finger 1:1 (60px drag = 60px
  move, was 0), snaps to the nearest card, and a flick over 0.3 px/ms
  moves one card (a 40px flick did nothing before). Rubber band at the
  ends, stacking follows the drag, a tap on Info still flips. Phone
  `--slide` is 340ms. Reduced motion: the drag follows, the snap jumps.
- Before/after GIFs, 375px: `out/edge/swipe-375-before.gif`,
  `out/edge/swipe-375-after.gif` (scripts in `out/edge/`).
- Not watched on a real phone yet (see 3.3).
- Wide screens: above 1440px `campaign/main.js § fit()` sets `zoom` on
  `<html>` to width/1440, as Figma "Desktop - 1920" (27:1072) is the 1440
  frame x1.333. At 2560 the page fills the width and scrolls to the
  payment methods. Checked in Chromium only; Safari and Firefox not yet.

## 3. Still open

| # | item | who |
|---|---|---|
| 1 | `links.cta` is `''` → GET BONUS has no `href`. Fill it in `campaign.js § links` when the affiliate link arrives; `passthrough` already carries `click_id`, `sub1`, `sub2`, `gclid`, `fbclid`, `ttclid`. | owner sends the link |
| 2 | REVERTED (2026-10-17): removing `js/platform.js` broke the deploy -- `.github/workflows/pages.yml` runs `tools/platform_test.py` (both SHARED), which fails without it (`FAIL card: phone tab and phone field are gone`). Owner chose to put it back. To drop it for real: in `tw-lp-template`, make `platform_test.py` skip when index.html does not load platform.js, bump SHARED.lock, pull here. Original note: the page has no registration form, but `index.html` still loads `js/platform.js`, which calls IT's landing API and loads Google reCAPTCHA. That is the source of the flaky `smoke.py` failure (`Framing 'https://www.google.com/' violates … frame-ancestors`, ~1 run in 2). Proposed: remove the `platform.js` script and the reCAPTCHA/IT origins from the CSP. Not done — waiting for the owner's yes. | owner decides |
| 3 | Real devices: iOS Safari and Android Chrome on the live URL (swipe, rubber-band, safe-area, landscape). Never tested. | next session |
| 4 | Reduced motion was checked with Playwright `reduced_motion='reduce'` (flip becomes crossfade, focus moves Info→Back→Info). The carousel slide under reduced motion was not watched by eye. | next session |
| 5 | Contrast deviations from Figma, for the owner to accept: today pill `#0155cb` instead of `#007bff` (white text 3.98:1); GET BONUS text dark (`--accent-ink`) instead of white (white on `#ff8c00` is 2.33:1); mobile step titles 24px not 22px (`#006aff` on `--cmp-bg` is 3.53:1, AA only as large text); flag button 44px not 40.6px. | owner accepts or not |
| 6 | Before 23 Oct every card is "soon"; the centre card says `card.label.later` ("OPENS • OCT 25, 2026") — correct by the BRIEF table, but check the owner is happy with what visitors see before launch. | owner |
| 7 | The fisherman is painted into the hero background raster (Figma has no separate layer), so he cannot move independently of the plate. | known limit |
| 8 | `tools/optimize.py` prints "pillow-avif-plugin not installed" yet writes AVIFs (Pillow 12.3), and exits if `raw/img/` is missing — a template issue, report it upstream, not here. | template |
| 9 | Git warns CRLF→LF on `campaign.js`, `campaign/cards.css`, `campaign/main.js` (written on Windows). Harmless; normalise if it bothers the diff. | optional |

## 4. Gate before calling anything done

```
python tools/drift.py            # 19 shared file(s) match SHARED.lock
python tools/tokens.py --check   # 5 stylesheet(s) clean
python tools/fonts.py --check    # 149 characters, all covered
python tools/smoke.py            # flaky until item 3.2 is decided
```

Then a browser check at 320, 375 and 1440 in ua/ru/en, and the states with
`?day=2026-10-20`, `2026-10-23`, `2026-10-27`, `2026-10-31`, `2026-11-02`
(last session: all five correct). Scratch files go in `out/` (gitignored).
