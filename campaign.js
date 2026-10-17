/* ═══════════════════════════════════════════════════════════════
   THE CAMPAIGN FILE

   This is the only file a new campaign edits, apart from campaign/main.js
   (the mechanic), campaign/assets/ (its art) and the <main> block in
   index.html.

   Nothing in js/ or css/ should be touched. `python tools/drift.py` fails CI
   if it is, and a change that genuinely belongs to every campaign belongs in
   the template repo, not in a clone — that is exactly how the last two
   landings ended up with four different oranges.

   Every key below ships with a working default and a comment saying what it
   does. Empty string means "not set", and every consumer treats it as an
   absence rather than as an empty value: an unset link is not a dead link,
   an unset endpoint is not a broken form.
   ═══════════════════════════════════════════════════════════════ */

window.TW_CAMPAIGN = {

  /* ── Identity ─────────────────────────────────────────────────
     `id` rides on the form payload as landing_id and on every analytics
     event. Use the repo name. */
  id: 'tw-halloween',

  /* ── The calendar ─────────────────────────────────────────────
     One card per day, 23–31 Oct 2026. "Today" is the date in `timeZone`;
     ?day=YYYY-MM-DD on the URL overrides it for testing.

     The face is three lines drawn from numbers here and words in `strings`:
       face.top.<top>     small line above   ({percent} filled from `percent`)
       the amount         large, formatted per locale, plus `currency`
       face.bot.<bottom>  small line below   ({stake} / {cb} filled from here)
     The back (Info) is `terms.<date>` in `strings`, verbatim from the
     client's sheet. */
  calendar: {
    timeZone: 'Europe/Kyiv',
    currency: 'UAH',
    days: [
      { date: '2026-10-23', top: 'upto',    percent: 100, amount: 2000, bottom: 'fb' },
      { date: '2026-10-24', top: 'freebet',               amount: 1000, bottom: 'lost' },
      { date: '2026-10-25', top: 'upto',    percent: 25,  amount: 2500, bottom: 'cb' },
      { date: '2026-10-26', top: 'upto',    percent: 30,  amount: 3000, bottom: 'dep' },
      { date: '2026-10-27', top: 'upto',    percent: 20,  amount: 2500, bottom: 'cb' },
      { date: '2026-10-28', top: 'upto',    percent: 30,  amount: 2000, bottom: 'cb' },
      { date: '2026-10-29', top: 'upto',    percent: 30,  amount: 1500, bottom: 'dep' },
      { date: '2026-10-30', top: 'freebet',               amount: 666,  bottom: 'stake', stake: 1500 },
      { date: '2026-10-31', top: 'upto',    percent: 100, amount: 2000, bottom: 'fbcb', cb: 20 }
    ]
  },

  /* ── The offer ────────────────────────────────────────────────
     NUMBERS ONLY. The words around them live in `strings` below, once per
     locale, and interpolate {percent} {amount} {currency} {spins}.

     Written here once and never repeated per language. Changing the offer
     from 225% / 15000 to 300% / 20000 is a two-value edit in this block and
     no language table is touched.

     currency: 'UAH' is safe everywhere. '₴' also works — the template ships
     the two one-glyph Noto cuts that carry U+20B4, because Roboto has none at
     any weight and a missing glyph still renders something. If you change
     currency, run `python tools/fonts.py --check`.

     spins: '' hides the "+ N FS" line entirely.

     hero: which figure is drawn large, in Orange Fire, with the rest under it.
     'percent' or 'amount'; leave it out and the percent leads if there is one,
     otherwise the amount. A sportsbook leads with 225%, a casino with
     250.000 ₴ — same card, one key apart. Spins are never the hero.
     The shell drops the hero to a smaller step above five characters, so a
     long amount does not have to be shortened by hand.

     If the amount leads, override `promo.amount` in `strings` below to the
     figure alone — '{amount} {currency}'. The shipped wording is
     'up to {amount} {currency}', which is a qualifier under a headline, not a
     headline. */
  offer: {
    percent:  '225%',
    amount:   '15000',
    currency: 'UAH',
    spins:    '',
    hero:     '',            // '' = percent if there is one, else amount
    code:     ''             // NOT sent to IT's platform; see below
  },

  /* offer.code is read by js/form.js § payload() as the field `bonus`, and
     that payload only leaves the page when the form is NOT on the platform:
     form.endpoint, or the console in demo mode. js/platform.js builds its own
     body and sends `promocode` from IT's landing response, so on a connected
     landing the promo code is set by IT, on their CRM landing, and this value
     goes nowhere. Fill it only for a landing that posts to its own endpoint,
     and only with a code the client gave. It is also {code} in `strings`. */

  /* ── Where the buttons go ─────────────────────────────────────
     '' leaves the anchor WITHOUT an href, so it is not a link at all: no tab
     stop, nothing announced, nothing to click. Never write href="#" — a mark
     that takes focus and then does nothing reads as a broken control.

       home     header logo
       login    "Already have an account? Log in", under the CTA  ← platform
       terms    consent sentence, first link                       ← platform
       privacy  consent sentence, second link                      ← platform
       cta      the done screen's "GO TO WEBSITE" button

     With the platform connected, terms, privacy and login come from IT's
     landing response (`rules`, `policy`, `login`; js/platform.js § applyLinks)
     and IT does nothing for them. The values here are only a fallback for when
     the landing call fails; '' then leaves the anchor without an href.

     A landing that is NOT on the platform has no other source: there terms
     and privacy block go-live, because the page collects an 18+ consent and
     dead consent links on a gambling registration form are a compliance
     problem, not a cosmetic one. */
  links: {
    home:    '',
    login:   '',
    terms:   '',
    privacy: '',
    cta:     ''
  },

  /* ── Tracking and affiliate ───────────────────────────────────
     `params` is appended to every URL in `links` above and copied into the
     form payload.

     `passthrough` names query parameters on THIS page's URL that ride through
     to the outbound click. That is how an affiliate click id survives the
     landing page: the ad network puts ?click_id=… on the landing URL, and the
     visitor arrives at the operator with the same id attached. Neither of the
     two earlier landings had this and the ids were lost. */
  params: {
    // utm_source:   'facebook',
    // utm_medium:   'cpc',
    // utm_campaign: 'demo-225'
  },
  passthrough: ['click_id', 'sub1', 'sub2', 'gclid', 'fbclid', 'ttclid'],

  /* ── Analytics ────────────────────────────────────────────────
     With the IT platform connected (js/platform.js), the analytics IDs come
     from the landing response: GA, Yandex Metrika and GTM load from there, as
     IT's own LP loads them, and the CSP in index.html allows those origins.
     Leave gtmId and metaPixelId empty unless a tag is needed that IT does not
     load, and check the console for a tag that loads twice.

     debug: true logs every TW.track() call instead of needing a tag
     assistant. */
  analytics: {
    gtmId:       '',
    metaPixelId: '',
    debug:       false
  },

  /* ── The registration form ────────────────────────────────────
     endpoint '' is the shipped default and means nothing is sent: the
     validated payload goes to console.info and, with demoDone true, the
     confirmation screen is walked anyway. The page is fully demoable before
     the platform exists, and it cannot silently half-ship.

     When IT is ready they set `endpoint` and the form POSTs JSON to it. A
     response carrying { login, password } fills the confirmation screen.
     `onRegister(payload)` is the escape hatch for anything more involved; it
     returns a promise and overrides `endpoint`.

     The password is in the payload, because a registration hook without one
     is useless — which means `endpoint` must point at the operator's own
     TLS endpoint and nowhere else.

     dialFlag is an SVG file, not an emoji: Windows renders 🇺🇦 as the
     letters "UA". */
  form: {
    endpoint:     '',
    /* js/platform.js owns the registration: config, landing, reCAPTCHA, the
       POST and the SSO redirect. It overrides `endpoint`, which stays empty.
       Remove this line only if the campaign connects to a different API, and
       then set `endpoint` (or this function) to that API instead. */
    onRegister:   function (payload) { return window.TWPlatform.register(payload); },
    /* landing_id is NOT here: the platform's numeric id comes from config.json
       (or platform.dev), and a string of ours would only compete with it.
       Anything put here is copied onto the request body BEFORE the platform's
       own fields, so it can add a field but never overwrite one. */
    hiddenFields: {},
    demoDone:     true,
    dialCode:     '+380',
    dialFlag:     'assets/img/icons/flag-ua.svg',
    phoneDigits:  9,
    passwordMin:  8
  },

  /* ── The IT platform (js/platform.js) ─────────────────────────
     In production the page reads `configUrl` from its own root, one file per
     landing, written on the server and never committed (see CAMPAIGN.md,
     "Connect to IT"):
       { "id": <number>, "email_registration": "<url>", "landing": "<url>" }
     Without that file the page is NOT connected: the form walks the demo
     confirmation screen and logs a warning to the console. Nothing on screen
     says so, which is why the first deploy must be checked in the console.

     `dev` is IT's own TEMP_CONFIG, copied from their landing
     (_js/enums/enums.js). It is used ONLY on localhost, 127.0.0.1 or an origin
     starting with https://land-crm, so a developer can try the page before
     IT issues a landing_id. It never reaches a visitor on the live domain.

     supportEmail is shown on the "unavailable" card; IT hardcodes it. */
  platform: {
    configUrl:    'config.json',
    supportEmail: 'support@jack-pot.com',
    dev: {
      id: 8,
      email_registration: 'https://api2-land-dev.jack-pot.tech/api/jp/registration/email',
      landing:            'https://api2-land-dev.jack-pot.tech/api/jp/landing/8'
    }
  },

  /* ── Languages ────────────────────────────────────────────────
     Order is the order of the header menu. THE FIRST ENTRY IS THE DEFAULT
     AND THE FALLBACK, so its tables have to be complete.

     Every code listed needs an entry in js/strings.js (TW_STRINGS and
     TW_LOCALES) and in `strings` below. tools/smoke.py fails on any key that
     renders as its own key.

     languageUrls: leave it empty and this landing is ONE HTML file whose
     table swaps in place, the choice persists in localStorage, and ?lang=ru
     forces a language for a media buyer's creative.

     Fill it and each language is its own file instead: the menu navigates,
     <html lang> on the file decides the language, and neither a saved choice
     nor ?lang can override it. That is for a landing that has to serve three
     indexable URLs with hreflang between them, the way tw-flip-cards-lp
     does. It costs the runtime switch and buys the three pages.

       languageUrls: { ua: './index.html', ru: './ru.html', en: './en.html' }
  */
  languages: ['ua', 'ru', 'en'],
  languageUrls: {},

  /* ── Brand and chrome ─────────────────────────────────────────
     These are the same in every TopWin campaign and are here only because a
     campaign occasionally needs one of them: header.mute should be false for
     a campaign with no audio, so the bar does not render a dead speaker. */
  brand: {
    logo:       'assets/img/logo-topwin.svg',
    logoAlt:    'Top Win',
    themeColor: '#040412',                    // --navy-950
    payments:   ['visa', 'mastercard', 'tether', 'bitcoin']
  },
  header: { show: true, mute: false, lang: true },

  /* ── Sound ────────────────────────────────────────────────────
     name -> file, and empty is the shipped default: no Audio element is made,
     and the header renders no speaker even if header.mute above is true.

     The mechanic plays a clip with TW.sound('name', 0.9). js/audio.js owns the
     rest -- nothing loads until the visitor's first gesture, the mute state
     persists, and a file that fails to load simply never plays.

       sounds: {
         flip: 'campaign/assets/audio/flip.mp3',
         win:  'campaign/assets/audio/win.mp3'
       }

     Set header.mute to true alongside this, or the visitor cannot turn it off. */
  sounds: {},
  footer: { show: true },

  /* ── Campaign copy, per locale ────────────────────────────────
     ONLY the strings this campaign owns. Everything the header, the footer
     and the registration dialog say lives in js/strings.js and is never
     copied here — this table is merged OVER that one, so anything repeated
     here is a fork waiting to happen.

     Override a shell key deliberately if a campaign needs different words
     (a casino campaign wanting 'promo.title' to say casino rather than
     sports), and only then.

     \n is a real line break in the rendered text. Do not put markup in a
     string; if a sentence needs a link inside it, split it the way
     agree.pre / agree.terms / agree.mid / agree.privacy / agree.post are
     split in js/strings.js. */
  strings: {
    ua: {
      'title':       'Top Win — Halloween Cards',
      'hero.title':  'Halloween Cards',
      'card.date':        '{day} ЖОВТНЯ 2026',
      'card.label.today': 'СЬОГОДНІШНІЙ БОНУС • {date}',
      'card.label.past':  'ЗАВЕРШЕНО • {date}',
      'card.label.next':  'ВІДКРИЄТЬСЯ ЗАВТРА • {date}',
      'card.label.later': 'ВІДКРИЄТЬСЯ • {date}',
      'card.cta':         'ОТРИМАТИ БОНУС',
      'card.past':        'ЗАВЕРШЕНО',
      'card.soon':        'НЕЗАБАРОМ',
      'card.info':        'Info',
      'card.info.aria':   'Умови бонусу',
      'card.back':        'Назад',
      'card.prev':        'Попередня картка',
      'card.next':        'Наступна картка',
      'face.top.upto':    '{percent}% до',
      'face.top.freebet': 'Free Bet',
      'face.bot.fb':      'Free Bet',
      'face.bot.cb':      'Cashback',
      'face.bot.dep':     'на депозит',
      'face.bot.lost':    'за програну ставку',
      'face.bot.stake':   'за ставку {stake}',
      'face.bot.fbcb':    'Free Bet + Cashback {cb}%',
      'terms.2026-10-23': 'Deposit & Get: 100% Free Bet до 2 000 UAH',
      'terms.2026-10-24': 'Bet & Get: Free Bet 1 000 UAH за програну ставку 2 000 UAH',
      'terms.2026-10-25': 'Cashback: 25% до 2 500 UAH; мінімальний програш — 1 000 UAH',
      'terms.2026-10-26': 'Deposit & Get: 30% до 3 000 UAH',
      'terms.2026-10-27': 'Cashback: 20% до 2 500 UAH; мінімальний програш — 1 000 UAH',
      'terms.2026-10-28': 'Cashback: 30% до 2 000 UAH; мінімальний програш — 1 000 UAH',
      'terms.2026-10-29': 'Deposit & Get: 30% до 1 500 UAH',
      'terms.2026-10-30': 'Bet & Get: зробіть ставку на 1 500 UAH та отримайте 666 UAH Free Bet, якщо ставку буде розраховано як виграшну або програшну',
      'terms.2026-10-31': 'Deposit & Get: 100% Free Bet до 2 000 UAH + Cashback 20% до 2 500 UAH; мінімальний програш — 2 000 UAH',
      'how.title':   'ЯК ЦЕ ПРАЦЮЄ?',
      'how.1.title': 'Крок 1',
      'how.1.text':  'Натисніть кнопку Info та ознайомтеся з умовами, зазначеними на зворотному боці картки.',
      'how.2.title': 'Крок 2',
      'how.2.text':  'Після ознайомлення з умовами натисніть ОТРИМАТИ БОНУС та перейдіть на сторінку депозиту. Внесіть мінімально необхідну суму для активації бонусу та натисніть Deposit.',
      'how.3.title': 'Крок 3',
      'how.3.text':  'Після завершення депозиту бонус буде зараховано на ваш акаунт. Рекомендуємо спочатку використати бонусні кошти, а потім перейти до Free Spins.',
      'pl.off.title':   'Сторінка тимчасово недоступна',
      'pl.off.text':    'Реєстрація зараз закрита. Спробуйте пізніше або напишіть нам:',
      'err.exists':     'Цей email уже зареєстровано. Увійдіть в акаунт',
      'err.recaptcha':  'Не вдалося пройти перевірку безпеки. Спробуйте ще раз'
    },
    ru: {
      'title':       'Top Win — Halloween Cards',
      'hero.title':  'Halloween Cards',
      'card.date':        '{day} ОКТЯБРЯ 2026',
      'card.label.today': 'СЕГОДНЯШНИЙ БОНУС • {date}',
      'card.label.past':  'ИСТЁК • {date}',
      'card.label.next':  'ОТКРОЕТСЯ ЗАВТРА • {date}',
      'card.label.later': 'ОТКРОЕТСЯ • {date}',
      'card.cta':         'ПОЛУЧИТЬ БОНУС',
      'card.past':        'ИСТЁК',
      'card.soon':        'СКОРО',
      'card.info':        'Info',
      'card.info.aria':   'Условия бонуса',
      'card.back':        'Назад',
      'card.prev':        'Предыдущая карточка',
      'card.next':        'Следующая карточка',
      'face.top.upto':    '{percent}% до',
      'face.top.freebet': 'Free Bet',
      'face.bot.fb':      'Free Bet',
      'face.bot.cb':      'Cashback',
      'face.bot.dep':     'на депозит',
      'face.bot.lost':    'за проигранную ставку',
      'face.bot.stake':   'за ставку {stake}',
      'face.bot.fbcb':    'Free Bet + Cashback {cb}%',
      'terms.2026-10-23': 'Deposit & Get: 100% Free Bet до 2 000 UAH',
      'terms.2026-10-24': 'Bet & Get: Free Bet 1 000 UAH за проигранную ставку 2 000 UAH',
      'terms.2026-10-25': 'Cashback: 25% до 2 500 UAH; минимальный проигрыш — 1 000 UAH',
      'terms.2026-10-26': 'Deposit & Get: 30% до 3 000 UAH',
      'terms.2026-10-27': 'Cashback: 20% до 2 500 UAH; минимальный проигрыш — 1 000 UAH',
      'terms.2026-10-28': 'Cashback: 30% до 2 000 UAH; минимальный проигрыш — 1 000 UAH',
      'terms.2026-10-29': 'Deposit & Get: 30% до 1 500 UAH',
      'terms.2026-10-30': 'Bet & Get: сделайте ставку на 1 500 UAH и получите 666 UAH Free Bet, если ставка будет рассчитана как выигрышная или проигрышная',
      'terms.2026-10-31': 'Deposit & Get: 100% Free Bet до 2 000 UAH + Cashback 20% до 2 500 UAH; минимальный проигрыш — 2 000 UAH',
      'how.title':   'КАК ЭТО РАБОТАЕТ?',
      'how.1.title': 'Шаг 1',
      'how.1.text':  'Нажмите кнопку Info и ознакомьтесь с условиями, указанными на обратной стороне карточки.',
      'how.2.title': 'Шаг 2',
      'how.2.text':  'После ознакомления с условиями нажмите ПОЛУЧИТЬ БОНУС и перейдите на страницу депозита. Внесите минимально необходимую сумму для активации бонуса и нажмите Deposit.',
      'how.3.title': 'Шаг 3',
      'how.3.text':  'После завершения депозита бонус будет зачислен на ваш аккаунт. Рекомендуем сначала использовать бонусные средства, а затем перейти к Free Spins.',
      'pl.off.title':   'Страница временно недоступна',
      'pl.off.text':    'Регистрация сейчас закрыта. Попробуйте позже или напишите нам:',
      'err.exists':     'Этот email уже зарегистрирован. Войдите в аккаунт',
      'err.recaptcha':  'Не удалось пройти проверку безопасности. Попробуйте ещё раз'
    },
    en: {
      'title':       'Top Win — Halloween Cards',
      'hero.title':  'Halloween Cards',
      'card.date':        'OCT {day}, 2026',
      'card.label.today': 'TODAY\'S BONUS • {date}',
      'card.label.past':  'EXPIRED • {date}',
      'card.label.next':  'OPENS TOMORROW • {date}',
      'card.label.later': 'OPENS • {date}',
      'card.cta':         'GET BONUS',
      'card.past':        'EXPIRED',
      'card.soon':        'COMING SOON',
      'card.info':        'Info',
      'card.info.aria':   'Bonus terms',
      'card.back':        'Back',
      'card.prev':        'Previous card',
      'card.next':        'Next card',
      'face.top.upto':    '{percent}% up to',
      'face.top.freebet': 'Free Bet',
      'face.bot.fb':      'Free Bet',
      'face.bot.cb':      'Cashback',
      'face.bot.dep':     'on deposit',
      'face.bot.lost':    'for a lost bet',
      'face.bot.stake':   'for a {stake} bet',
      'face.bot.fbcb':    'Free Bet + Cashback {cb}%',
      'terms.2026-10-23': 'Deposit & Get: 100% Free Bet up to 2,000 UAH',
      'terms.2026-10-24': 'Bet & Get: 1,000 UAH Free Bet for a lost 2,000 UAH bet',
      'terms.2026-10-25': 'Cashback: 25% up to 2,500 UAH; minimum loss — 1,000 UAH',
      'terms.2026-10-26': 'Deposit & Get: 30% up to 3,000 UAH',
      'terms.2026-10-27': 'Cashback: 20% up to 2,500 UAH; minimum loss — 1,000 UAH',
      'terms.2026-10-28': 'Cashback: 30% up to 2,000 UAH; minimum loss — 1,000 UAH',
      'terms.2026-10-29': 'Deposit & Get: 30% up to 1,500 UAH',
      'terms.2026-10-30': 'Bet & Get: place a 1,500 UAH bet and get a 666 UAH Free Bet whether the bet settles as a win or a loss',
      'terms.2026-10-31': 'Deposit & Get: 100% Free Bet up to 2,000 UAH + 20% Cashback up to 2,500 UAH; minimum loss — 2,000 UAH',
      'how.title':   'HOW DOES IT WORK?',
      'how.1.title': 'Step 1',
      'how.1.text':  'Click the Info button and review the terms provided on the back of the card.',
      'how.2.title': 'Step 2',
      'how.2.text':  'After reading the terms, click GET BONUS and go to the deposit page. Enter the minimum required amount to activate the bonus and click Deposit.',
      'how.3.title': 'Step 3',
      'how.3.text':  'Once the deposit is completed, the bonuses will be credited to your account. We recommend using the bonus funds first and then moving on to Free Spins.',
      'pl.off.title':   'This page is temporarily unavailable',
      'pl.off.text':    'Registration is closed right now. Please try again later or write to us:',
      'err.exists':     'This email is already registered. Please log in',
      'err.recaptcha':  'The security check failed. Please try again'
    }
  }
};
