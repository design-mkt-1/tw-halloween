# Seams

Everything a campaign is allowed to wire, and what reads it. `''` always means
"not set", and every consumer treats it as an absence rather than as an empty
value: an unset link is not a dead link, an unset endpoint is not a broken form.

## The `campaign.js` contract

| key | read by | empty means |
|---|---|---|
| `id` | `js/shell.js § track()`, `js/form.js § payload()` | `landing_id` rides as `''` on every payload and event |
| `offer.percent` | `promo.pct` via `{percent}` | the `.tw-promo__pct` node is not rendered |
| `offer.amount` | `promo.amount` via `{amount}` | the amount line is not rendered |
| `offer.currency` | `promo.amount` via `{currency}` | the amount reads without a unit |
| `offer.spins` | `promo.spins` via `{spins}` | the "+ N FS" line is hidden entirely |
| `offer.code` | `js/form.js § payload()` as `bonus`; only off the platform (`endpoint` or demo). `js/platform.js` sends `promocode` from IT's landing instead | nothing; on the platform it is never sent |
| `links.home` | header logo | the logo is not a link — no `href`, no tab stop |
| `links.login` | "Already have an account?" under the CTA; on the platform, `login` from the landing response | fallback only; off the platform the anchor is not a link |
| `links.terms` | consent sentence, first link; on the platform, `rules` from the landing response | fallback only; off the platform **BLOCKS GO-LIVE** |
| `links.privacy` | consent sentence, second link; on the platform, `policy` from the landing response | fallback only; off the platform **BLOCKS GO-LIVE** |
| `links.cta` | the done screen's "GO TO WEBSITE" button | the button is inert |
| `params` | `js/shell.js § params()` → every `links` URL and the payload | no query appended, nothing added to the payload |
| `passthrough` | `js/shell.js`, read once at boot | nothing rides through from the landing URL |
| `analytics.gtmId` | `js/shell.js § injectAnalytics()` | GTM is not injected; no request |
| `analytics.metaPixelId` | same | the pixel is not injected; no request |
| `analytics.debug` | `js/shell.js § track()` | `TW.track()` logs nothing |
| `form.endpoint` | `js/form.js § onSubmit()` | nothing is sent; payload to `console.info` |
| `form.onRegister` | same, checked first | falls through to `endpoint` |
| `form.hiddenFields` | `js/form.js § payload()` | nothing extra on the payload |
| `form.demoDone` | `js/form.js § onSubmit()` | with nothing wired, the done screen is not walked |
| `form.dialCode` | phone prefix, and phone normalisation | defaults to `+380` |
| `form.dialFlag` | the flag beside the prefix — a file path, never an emoji | no flag image |
| `form.phoneDigits` | `js/form.js § phoneDigits()` | defaults to 9 |
| `form.passwordMin` | `js/form.js § CHECK.password` | defaults to 8 |
| `languages` | `js/i18n.js`, `js/shell.js § headerHTML()`, `tools/smoke.py` | defaults to `['ua']`; **the first entry is the default AND the fallback** |
| `brand.logo` | header, footer and the dialog's promo header | broken image in three places |
| `brand.logoAlt` | the same three | defaults to `Top Win` |
| `brand.themeColor` | overwrites the `theme-color` meta at boot | the static meta stands |
| `brand.payments` | `js/shell.js § PAY` table → footer badges | no payment row |
| `header.show` / `footer.show` | `js/shell.js § mountSlot()` | `false` removes the slot entirely |
| `header.mute` | the speaker button's markup | omitted, not disabled — no dead speaker |
| `header.lang` | the language listbox markup | omitted; also omitted with one language |
| `strings` | `js/i18n.js § tableFor()`, merged **over** `TW_STRINGS` | the shell's own copy stands |

Only override a `TW_STRINGS` key here deliberately — a casino campaign wanting
`promo.title` to say casino rather than sports. Anything else repeated here is
a fork waiting to happen.

## The form-submission seam

Precedence, checked in this order in `js/form.js § onSubmit()`:

1. `form.onRegister(payload)` if it is a function. It returns a promise and
   overrides `endpoint`. **Since v1.0.7 the shipped `campaign.js` sets it to
   `TWPlatform.register`**, so every landing registers through
   `js/platform.js` (the contract is in the next section). Resolve with
   `{ login, password }` to fill the confirmation screen; resolve with anything
   else and the screen falls back to what the visitor typed. The platform never
   resolves on success: the page navigates to the casino.
2. `form.endpoint` — a JSON POST with `Content-Type: application/json`. A
   non-2xx throws; the response is parsed as JSON if it parses. `err.network`
   is shown on rejection.
3. Neither. The template no longer ships this path. The validated payload goes
   to `console.info` with the text "not wired to anything", and with
   `form.demoDone: true` the confirmation screen is walked anyway. Loud in the
   console, invisible to the visitor. That string is the one entry on
   `tools/smoke.py`'s console ignore-list.

When `onRegister` is the platform and there is no `config.json`, the platform
takes the demo path itself: the same confirmation screen, and the console line
`[platform] config.json not found: this build is not connected to the
platform.` instead.

The payload carries `method`, `contact`, `email`, `phone`, `password`,
`consent`, `lang` (the **BCP-47 tag**, not the internal code), `bonus`,
`landing_id`, then `hiddenFields`, then `TW.params()`. The password is in it,
which is why `endpoint` must point at the operator's own TLS endpoint and
nowhere else.

## The tracking seam

`params` is appended to every URL in `links` and copied into the form payload.
`passthrough` names query parameters on **this** page's URL that ride through to
the outbound click — it is read once at boot, because a mechanic may replace the
query string later and the affiliate click id has to survive that. Passed-in
values win over the campaign's own on key collision.

`TW.track(event, props)` always runs. It adds `landing_id`, `lang` and the
merged params to every payload, pushes to `dataLayer` if GTM is present, calls
`fbq('trackCustom', …)` if the pixel is present, and logs when
`analytics.debug` is true. With no id configured it does everything except
reach the network.

Events the template fires by itself:

| event | fired at |
|---|---|
| `lp_view` | end of boot, `js/shell.js § boot()` |
| `lang_change` | every language change, with `{ to }` |
| `form_submit` | validation passed, with `{ method }` |
| `form_success` | the send resolved, with `{ method }` |

`game_win` is fired by the demo mechanic in `campaign/main.js`, not by the
shell — it is the example, and a campaign names its own.

`TW.on(name, fn)` subscribes to the four events the shell emits: `register`
(the confirmation screen filled, with the result object), `lang` (the new
code), `formopen`, `formclose`. A listener that throws is caught and reported,
so a campaign hook cannot strand the visitor in a half-open dialog.

## The five URL seams

`home`, `login`, `terms`, `privacy`, `cta`. `js/shell.js § wireLinks()` sets
`href` when `TW.url(name)` returns a string and **removes** the attribute when
it returns null. An element with no `href` is simply not a link — no tab stop,
nothing announced. Never write `href="#"`; `tools/smoke.py` fails on it.

With the platform connected, `terms`, `privacy` and `login` are set from IT's
landing response (`js/platform.js § applyLinks`, after `wireLinks()` on every
language switch), and the `campaign.js` values are only the fallback for a
failed landing call. Off the platform `terms` and `privacy` block go-live. The
page collects an 18+ consent, and dead consent links on a gambling
registration form are a compliance problem.

## The platform contract (`js/platform.js`)

The file is shared (`tools/drift.py`) and copied byte-for-byte from IT's
reference landing, `tw-flip-cards-lp` at `0186bc6`. Its header comment has the
full flow. What it reads and sends:

**`config.json`** next to `index.html` (fetched by the relative path
`config.json`, so on subfolder hosting it is in the subfolder), one per
landing, never committed:

- `id` (number): the landing's id from IT. Sent in the body as `landing_id`.
- `email_registration`: the POST URL, `https://<api>/api/jp/registration/email`.
- `landing`: the GET URL, `https://<api>/api/jp/landing/<id>`.
- `trackingId` exists in IT's config. Nothing in `js/platform.js` reads it.
- Missing (404) means demo, with the console warning. A malformed file
  rejects, and the next submit tries again.

**`campaign.js` § platform**: `configUrl`, `supportEmail`, and `dev`, which is
IT's test landing (id 8). `dev` is used only on localhost, 127.0.0.1 or an
origin starting with `https://land-crm`.

**GET landing** returns `{ data: … }`. Fields the page uses: `active` (false
shows the "unavailable" card and nothing else happens), `recaptcha_key`, `rules`
(the Terms link, and the casino's host for the SSO fallback), `policy` (Privacy),
`login`, `redirect_link` (the SSO fallback path), `country`, `currency`,
`promocode`, and `analytics_google`, `analytics_yandex`, `gtm_tag` (IDs, each
checked before use). Analytics load even when `active` is false, as IT's LP does.

**POST registration** body, in this order, so a field of the same name
elsewhere cannot overwrite it: `hiddenFields` and the whitelisted URL params
(`campaign.js § passthrough`), then `email`, `password`, `landing_id`,
`language` (`uk`, `ru` or `en`, the BCP-47 tag), `currency`, `country`,
`promocode`, `receivePromos: true`, `clientIp` (from `api.ipify.org`), and
`g-recaptcha-response` (reCAPTCHA v3, action `register`).

**Response**: `data.accessToken` and `data.redirectUrl`.

**SSO hand-off**: the token is POSTed as a form to
`<origin of redirectUrl>/api/welcome` with `tmpToken` and `redirect` =
`redirectUrl` plus the page's query. Without `redirectUrl` it goes to
`<casino>/api/welcome`, with `redirect` = `<casino>/<lang>/<redirect_link>` plus
the query. The password is never in this POST.

**Errors**: `{ errors: [msg] }`. A message containing "already registered" or
"recaptcha" gets its own translated line (`err.exists`, `err.recaptcha` in
`campaign.js § strings`). Anything else is the generic `err.network`.

## The analytics CSP swap

`index.html` names the analytics origins in its CSP (GA, GTM, Yandex Metrika),
because `js/platform.js` loads them from the landing response. Meta's origins
are **not** in the CSP. Setting `analytics.metaPixelId` therefore needs a hand
edit of the `<meta>` in `index.html`, adding the origins that the snippet in
`js/shell.js § injectAnalytics` loads.

This cannot live in `campaign.js`: **a `<meta>` policy cannot be written from
JavaScript.** It is parsed with the document, long before any script runs. A
refusal appears only in the console, so the page looks fine and silently sends
nothing.

`form-action` is deliberately absent from both policies, and it does not fall
back to `default-src` — that is what leaves the form free to POST wherever IT
wires `form.endpoint`. `frame-ancestors` is absent because browsers ignore it in
a meta policy; writing it would only look like protection.

## `window.TW` — the complete surface

Read out of `js/shell.js § window.TW`. This is all of it; the mechanic reaches
the shell through this object and nothing else.

```
TW.config                 the parsed campaign.js
TW.t(key, vars)           translated string, {name} filled from vars and offer
TW.lang()                 current internal code, '' before i18n boots
TW.setLang(code)          change it
TW.url(name)              links.<name> with params appended, or null
TW.params()               campaign params merged with the passthrough
TW.openForm()             open the registration dialog
TW.closeForm()
TW.showDone(res)          fill and show the confirmation screen directly
TW.track(event, props)
TW.on(name, fn)           'register' | 'lang' | 'formopen' | 'formclose'
TW.emit(name, data)
TW.ready(fn)              run once the chrome is mounted and i18n applied
```

`window.TWForm` (`mount`, `open`, `close`, `showDone`, `isOpen`) and
`window.TWI18n` (`init`, `t`, `set`, `apply`, `langs`, `current`, `tag`,
`onChange`) exist because the shared files talk to each other. A campaign uses
`TW`.
