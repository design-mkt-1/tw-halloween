/* ═══════════════════════════════════════════════════════════════
   THE MECHANIC — Halloween Cards, a nine-day bonus calendar

   Fills <div id="cmp-cards"> in index.html with a carousel of nine cards,
   one per day in campaign.js § calendar. Styles: campaign/cards.css.
   Spec: docs/BRIEF.md § "Card state by date".

   ── State comes from the date alone ──────────────────────────
   "Today" is the calendar date in calendar.timeZone (Europe/Kyiv), read with
   Intl as YYYY-MM-DD. ?day=2026-10-25 on the URL overrides it for testing.
   Each card is then one of:
     past    before today    grey,  label card.label.past,  card.past  (inert)
     today   equal           blue,  label card.label.today, card.cta   (link)
     next    tomorrow        navy,  label card.label.next,  card.soon  (inert)
     later   after tomorrow  navy,  label card.label.later, card.soon  (inert)
   Nothing persists: a reload recomputes everything.

   ── GET BONUS ────────────────────────────────────────────────
   There is no registration dialog on this landing (BRIEF § Deviations), so
   TW.openForm() is never called. Today's button is an <a> to TW.url('cta').
   While links.cta is '' the anchor has NO href -- visible, styled, not a
   link -- per the template's rule against href="#".

   ── Info / Back ──────────────────────────────────────────────
   Past and today cards carry an Info button that flips the card (rotateY)
   to its back: the label, terms.<date> and a Back button. Focus goes to
   Back on the flip and returns to Info. The hidden face is inert, so a
   screen reader and the Tab key only ever meet the visible one. Soon cards
   show no terms and have no Info.

   ── Carousel ─────────────────────────────────────────────────
   Every card sits in the same spot; --q (its index minus the fractional
   position under the centre) poses it and its z-index stacks it, both
   written each frame by § motion. On touch the cards follow the finger
   (§ swipe). Only the active card (data-pos 0) is interactive: the rest are
   inert and aria-hidden. Arrows, swipe, and ArrowLeft/ArrowRight while focus is
   inside move one card; the pager under the cards jumps to any day. The
   ends do not wrap: an end arrow turns
   aria-disabled rather than disabled, so a keyboard user's focus is not
   dropped to <body> when they reach it.

   ── Rules this file keeps ────────────────────────────────────
   * All copy is TW.t(); every string re-renders on TW.on('lang').
   * Offer figures are numbers from campaign.js, formatted per locale.
   * prefers-reduced-motion: the slide becomes an instant move (§ motion,
     the only branch here) and the flip a crossfade (cards.css).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var LOCALE = { ua: 'uk-UA', ru: 'ru-RU', en: 'en-US' };

  /* ── wide screens ─────────────────────────────────────────────
     Above 1440 the whole page grows with the window (Figma 27:1072 is the
     1440 frame times 1920/1440). campaign/main.css does it before the first
     paint with zoom: tan(atan2(100vw, 1440px)). This is only the fallback
     for a browser without CSS trigonometry, which ignores that line: it
     sets the same value, after the paint, as the page always used to. */
  var cssZoom = window.CSS && CSS.supports && CSS.supports('zoom', 'tan(atan2(100vw, 1440px))');
  if (!cssZoom) {
    var fit = function () {
      var z = window.innerWidth / 1440;
      document.documentElement.style.zoom = z > 1 ? String(z) : '';
    };
    fit();
    window.addEventListener('resize', fit);
  }

  /* The card's silhouette, Figma 21:670 (275x343). Drawn as SVG so the
     slanted top and the round bottom-left corner scale with the card; the
     fill comes from CSS, so no colour lives here. */
  var PATH = 'M0 24.48C0 11.65 11.5 1.87 24.17 3.92L206.82 33.58C235.61 38.26 ' +
    '257.33 62.23 259.17 91.33L275 343H83.31C37.3 343 0 305.7 0 259.69Z';
  var SHAPE =
    '<svg class="cmp-card__shape" viewBox="0 0 275 343" preserveAspectRatio="none" ' +
    'aria-hidden="true" focusable="false"><path d="' + PATH + '"/>' +
    '<path class="cmp-card__fade" d="' + PATH + '" fill="url(#cmp-card-fade)"/></svg>';
  /* The black fade over the lower part (21:670 "Rectangle 11846"), defined
     once for all eighteen faces. Stop colours come from cards.css. */
  var DEFS =
    '<svg class="cmp-car__defs" width="0" height="0" aria-hidden="true" focusable="false">' +
    '<linearGradient id="cmp-card-fade" x1="0" y1="0.418" x2="0" y2="1.113">' +
    '<stop offset="0" stop-opacity="0"/><stop offset="1"/></linearGradient></svg>';

  var CHEVRON =
    '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
    '<path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Two of the three balls are the same orange art; the lock sits on top of
     it for the soon cards (Figma 21:699 / 21:711). */
  function picture(name, cls) {
    return '<picture class="' + cls + '">' +
      '<source srcset="campaign/assets/cards/' + name + '.avif" type="image/avif">' +
      '<img src="campaign/assets/cards/' + name + '.webp" alt="" decoding="async">' +
      '</picture>';
  }

  /* ── dates ─────────────────────────────────────────────────── */

  function todayIn(timeZone) {
    var forced = new URLSearchParams(location.search).get('day');
    if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return forced;
    /* YYYY-MM-DD from parts (not locale output), which also sorts as a string. */
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return parts.year + '-' + parts.month + '-' + parts.day;
  }

  function nextDay(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function stateOf(date, today) {
    if (date < today) return 'past';
    if (date === today) return 'today';
    return date === nextDay(today) ? 'next' : 'later';
  }

  /* ── one card ──────────────────────────────────────────────── */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  function buildCard(day, state) {
    var offer = state === 'past' || state === 'today';
    var card = el('div', 'cmp-card cmp-card--' + (state === 'later' ? 'next' : state));
    card.setAttribute('role', 'group');

    var inner = el('div', 'cmp-card__inner');
    var front = el('div', 'cmp-card__face cmp-card__front', SHAPE);
    var label = el('p', 'cmp-card__label');
    front.appendChild(label);

    var refs = { card: card, day: day, state: state, label: label, front: front };

    if (state === 'past') {
      front.insertAdjacentHTML('beforeend', picture('ball-grey-884', 'cmp-card__ball'));
    } else {
      front.insertAdjacentHTML('beforeend', picture('ball-orange-884', 'cmp-card__ball'));
    }

    if (offer) {
      var lines = el('div', 'cmp-card__offer');
      refs.top = el('p', 'cmp-card__line');
      refs.amount = el('p', 'cmp-card__amount');
      refs.bottom = el('p', 'cmp-card__line');
      lines.appendChild(refs.top);
      lines.appendChild(refs.amount);
      lines.appendChild(refs.bottom);
      front.appendChild(lines);

      refs.info = el('button', 'cmp-card__info');
      refs.info.type = 'button';
      refs.info.setAttribute('aria-expanded', 'false');
      front.appendChild(refs.info);
    } else {
      front.insertAdjacentHTML('beforeend', picture('ball-lock-260', 'cmp-card__lock'));
    }

    if (state === 'today') {
      /* An <a>, with href only when links.cta is set (see the header). */
      refs.btn = el('a', 'cmp-card__btn cmp-card__cta');
      var href = TW.url('cta');
      if (href) refs.btn.href = href;
      refs.btn.addEventListener('click', function () {
        TW.track('bonus_click', { day: day.date });
      });
    } else {
      /* Not a control at all: a disabled <button> would still be announced
         as a dimmed button with nothing to do. A plain span keeps the word
         visible; the word itself says why it does nothing (aria-disabled is
         not valid on a generic element). */
      refs.btn = el('span', 'cmp-card__btn');
    }
    front.appendChild(refs.btn);
    inner.appendChild(front);

    if (offer) {
      var back = el('div', 'cmp-card__face cmp-card__back', SHAPE);
      refs.backLabel = el('p', 'cmp-card__label');
      refs.terms = el('p', 'cmp-card__terms');
      refs.back = el('button', 'cmp-card__btn cmp-card__backbtn');
      refs.back.type = 'button';
      back.appendChild(refs.backLabel);
      back.appendChild(refs.terms);
      back.appendChild(refs.back);
      back.inert = true;
      back.setAttribute('aria-hidden', 'true');
      inner.appendChild(back);
      refs.backFace = back;

      refs.info.addEventListener('click', function () { flip(refs, true); });
      refs.back.addEventListener('click', function () { flip(refs, false); });
    }

    card.appendChild(inner);
    return refs;
  }

  function flip(refs, toBack, quiet) {
    if (!refs.backFace) return;
    refs.card.classList.toggle('is-flipped', toBack);
    refs.front.inert = toBack;
    refs.backFace.inert = !toBack;
    refs.front.setAttribute('aria-hidden', String(toBack));
    refs.backFace.setAttribute('aria-hidden', String(!toBack));
    refs.info.setAttribute('aria-expanded', String(toBack));
    if (!quiet) (toBack ? refs.back : refs.info).focus({ preventScroll: true });
  }

  /* All visible words of one card, for the first paint and every language
     change. */
  function paint(refs, money) {
    var day = refs.day;
    var date = TW.t('card.date', { day: Number(day.date.slice(8)) });
    var text = TW.t('card.label.' + refs.state, { date: date });
    refs.label.textContent = text;
    refs.card.setAttribute('aria-label', text);

    if (refs.top) {
      refs.top.textContent = TW.t('face.top.' + day.top, { percent: day.percent });
      refs.amount.textContent = money(day.amount);
      refs.bottom.textContent = TW.t('face.bot.' + day.bottom, {
        stake: day.stake ? money(day.stake) : '',
        cb: day.cb
      });
      /* Figma's wide tracking fits "Free Bet", not "за ставку 1 500 UAH". */
      refs.top.classList.toggle('is-long', refs.top.textContent.length > 12);
      refs.bottom.classList.toggle('is-long', refs.bottom.textContent.length > 12);
      refs.info.textContent = TW.t('card.info');
      /* Accessible name starts with the visible word (WCAG 2.5.3). */
      refs.info.setAttribute('aria-label', TW.t('card.info') + ' — ' + TW.t('card.info.aria'));
      refs.backLabel.textContent = text;
      refs.terms.textContent = TW.t('terms.' + day.date);
      refs.back.textContent = TW.t('card.back');
    }

    refs.btn.textContent = TW.t(refs.state === 'today' ? 'card.cta'
      : refs.state === 'past' ? 'card.past' : 'card.soon');
  }

  /* ── the carousel ──────────────────────────────────────────── */

  TW.ready(function () {
    var root = document.getElementById('cmp-cards');
    var cal = TW.config.calendar;
    if (!root || !cal || !cal.days) return;

    var today = todayIn(cal.timeZone);
    watchMidnight(cal.timeZone, today);
    var cards = cal.days.map(function (day) { return buildCard(day, stateOf(day.date, today)); });

    /* Start on today; before the calendar, the first card; after it, the
       last. */
    var active = 0;
    cal.days.forEach(function (day, i) { if (day.date <= today) active = i; });

    var stage = el('div', 'cmp-car__stage');
    cards.forEach(function (c) { stage.appendChild(c.card); });

    var prev = el('button', 'cmp-car__arrow cmp-car__arrow--prev', CHEVRON);
    var next = el('button', 'cmp-car__arrow cmp-car__arrow--next', CHEVRON);
    prev.type = next.type = 'button';

    /* The pager: one real button per card, named by that card's label, so
       a phone -- where the arrows are hidden (21:587 has none) -- can still
       jump straight to a day. */
    var bar = el('div', 'cmp-car__bar');
    var ticks = cards.map(function (c, i) {
      var tick = el('button', 'cmp-car__tick');
      tick.type = 'button';
      tick.addEventListener('click', function () { go(i - active); });
      return bar.appendChild(tick);
    });

    root.insertAdjacentHTML('beforeend', DEFS);
    root.appendChild(stage);
    root.appendChild(prev);
    root.appendChild(next);
    root.appendChild(bar);

    function render() {
      var lang = TW.lang();
      var nf = new Intl.NumberFormat(LOCALE[lang] || LOCALE.ua);
      var money = function (n) { return nf.format(n) + ' ' + cal.currency; };
      cards.forEach(function (c, i) {
        paint(c, money);
        ticks[i].setAttribute('aria-label', c.label.textContent);
      });
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', TW.t('meta.description'));
      prev.setAttribute('aria-label', TW.t('card.prev'));
      next.setAttribute('aria-label', TW.t('card.next'));
    }

    /* ── motion ──────────────────────────────────────────────────
       One number moves the carousel: pos, the fractional index under the
       centre. Each card's pose is a continuous function of q = its index
       minus pos (cards.css § "one continuous position"), and so is its
       stacking order, written here on the same frame: the card nearer the
       centre is in front, so two cards swap only where their |q| cross, the
       exact midpoint of a slide, and never at the release.
       The finger sets pos directly (1:1); every other move -- release,
       arrows, pager, keys -- is a spring from the current pos AND speed, run
       by rAF. Nothing restarts from a stored value, so there is no jump at
       release, and a finger that lands mid-glide catches the cards where
       they are. Reduced motion: the drag still follows the finger, every
       other move is instant. */
    var pos = active, vel = 0, target = active, raf = 0, last = 0;
    var shown = [];
    /* Stiffness 300, damping 32, mass 1: damping ratio .92, so a glide lands
       without a visible bounce in about 350 ms; a flick's speed carries in. */
    var K = 300, C = 32;
    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

    function pose() {
      cards.forEach(function (c, i) {
        var q = Math.round(Math.max(-2, Math.min(2, i - pos)) * 10000) / 10000;
        if (shown[i] === q) return;
        shown[i] = q;
        c.card.style.setProperty('--q', String(q));
        c.card.style.zIndex = String(Math.round(3000 - Math.abs(q) * 1000));
      });
    }

    /* A layer per moving card, only while something moves (a permanent one
       would leave the centre card's text resampled), and only for the cards
       the move can show: 9 rasterised at once cost the first frames of a
       drag on iOS. */
    function lift(on) {
      if (on) stage.classList.add('is-lift');
      else stage.classList.remove('is-lift');
      var lo = Math.min(pos, target) - 2.5, hi = Math.max(pos, target) + 2.5;
      cards.forEach(function (c, i) {
        c.card.style.willChange = on && i > lo && i < hi ? 'transform, opacity' : '';
      });
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function tick(now) {
      /* Fixed 4 ms sub-steps: stable at any frame rate, and the first frame
         moves (a 0 dt there would hold the cards still for a frame). */
      var dt = last ? Math.min(0.064, Math.max(0, now - last) / 1000) : 1 / 60;
      last = now;
      for (var h = dt; h > 1e-6; h -= 0.004) {
        var s = Math.min(0.004, h);
        vel += (-K * (pos - target) - C * vel) * s;
        pos += vel * s;
      }
      if (Math.abs(pos - target) < 0.002 && Math.abs(vel) < 0.05) {
        pos = target; vel = 0; raf = 0;
        pose();
        lift(false);
        return;
      }
      pose();
      raf = requestAnimationFrame(tick);
    }

    function glide() {
      if (reduce.matches) {
        stop(); pos = target; vel = 0;
        pose(); lift(false);
        return;
      }
      lift(true);
      if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
    }

    function place() {
      /* Focus inside a card that is about to go inert would drop to <body>,
         and the next arrow press would do nothing. Note it here, move it to
         the new centre card below. Focus outside the cards stays put. */
      var hadFocus = cards.some(function (c) { return c.card.contains(document.activeElement); });
      cards.forEach(function (c, i) {
        var off = i !== active;
        /* data-pos names the card's slot after the move (-2..2); the pose
           and the stacking come from pose(), not from this. */
        c.card.setAttribute('data-pos', String(Math.max(-2, Math.min(2, i - active))));
        c.card.inert = off;
        if (off) c.card.setAttribute('aria-hidden', 'true');
        else c.card.removeAttribute('aria-hidden');
        /* A card that leaves the centre turns face up again. */
        if (off && c.card.classList.contains('is-flipped')) flip(c, false, true);
        ticks[i].classList.toggle('is-on', i === active);
        if (i === active) ticks[i].setAttribute('aria-current', 'true');
        else ticks[i].removeAttribute('aria-current');
      });
      prev.setAttribute('aria-disabled', String(active === 0));
      next.setAttribute('aria-disabled', String(active === cards.length - 1));
      if (hadFocus) {
        var cur = cards[active];
        var focusEl = cur.info || cur.card;
        if (focusEl === cur.card) focusEl.setAttribute('tabindex', '-1');
        focusEl.focus({ preventScroll: true });
      }
    }

    /* Commit to a card: state at once, motion by the spring. */
    function moveTo(to) {
      to = Math.max(0, Math.min(cards.length - 1, to));
      target = to;
      if (to !== active) { active = to; place(); }
      glide();
    }

    function go(step) {
      var to = Math.max(0, Math.min(cards.length - 1, active + step));
      if (to === active) return;
      moveTo(to);
    }

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    });

    /* Swipe: pos follows the finger, px / --nb-x per card, from wherever the
       cards were when it landed (a finger that lands mid-glide stops it).
       Past either end the drag gives a third as much, a rubber band. On
       release the nearest card wins; a flick (over 0.3 px/ms over the last
       100 ms) goes on to the next card in its direction even when the travel
       is short, and its speed is handed to the spring.
       The drag only starts once the move is clearly sideways (8px, more x
       than y); until then a tap is a tap, the buttons inside get their click
       and no layer is made. touch-action: pan-y in cards.css leaves vertical
       scrolling to the page. A move that goes vertical first drops the drag,
       so the page scrolls and the cards stay. A sideways one keeps the page
       still: the touchmove listener below cancels the scroll (iOS Safari
       otherwise takes a slightly diagonal swipe as a page pull, rubber-bands
       at the top and cancels the pointer mid-drag). A pointercancel that
       still comes ends the drag like a release, so the card it reached
       stays. Mouse uses the arrows. */
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || drag) return;
      stop();
      vel = 0;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, on: false, p0: pos,
               step: parseFloat(getComputedStyle(root).getPropertyValue('--nb-x')) || 1,
               s: [[e.timeStamp, e.clientX]] };
    });
    /* A gesture that ends without dragging lets a caught glide finish. */
    function resume() { if (pos !== target) glide(); }
    stage.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { drag = null; resume(); return; }
        if (Math.abs(dx) < 8) return;
        drag.on = true;
        /* From here the gesture is the carousel's: capture keeps the moves
           coming outside the stage, and the click after release lands on
           the stage instead of on a button under the finger. The cards
           start from here, not from where the finger landed: counting the
           8px it took to decide would jump them 8px in one frame. */
        drag.x0 = e.clientX;
        dx = 0;
        stage.setPointerCapture(e.pointerId);
        lift(true);
      }
      drag.s.push([e.timeStamp, e.clientX]);
      while (drag.s.length > 2 && e.timeStamp - drag.s[0][0] > 100) drag.s.shift();
      /* clientX is in screen px; under the wide-screen zoom a CSS px is
         currentCSSZoom of them. */
      var p = drag.p0 - dx / (drag.step * (root.currentCSSZoom || 1));
      var lo = 0, hi = cards.length - 1;
      if (p < lo) p = lo + (p - lo) / 3;
      else if (p > hi) p = hi + (p - hi) / 3;
      pos = p;
      pose();
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.on) { resume(); return; }
      /* Finger speed (px/ms) over the last 100 ms; stale if the finger
         rested before lifting. */
      var a = d.s[0], b = d.s[d.s.length - 1], v = 0;
      if (e.timeStamp - b[0] < 100 && b[0] > a[0]) v = (b[1] - a[1]) / (b[0] - a[0]);
      /* The same speed in cards per second, the spring's unit. */
      var cps = -v * 1000 / (d.step * (root.currentCSSZoom || 1));
      var from = Math.round(d.p0), to = Math.round(pos);
      /* A flick moves one card even when the travel is short, and wins over
         a rounding that would send the cards back. */
      if (Math.abs(v) > 0.3 && (to === from || (to > from) !== (cps > 0))) {
        to = from + (cps > 0 ? 1 : -1);
      }
      to = Math.max(0, Math.min(cards.length - 1, to));
      /* Hand the speed to the spring: up to 6 cards/s toward the card it
         lands on; when the finger overshot and the card lies behind, only
         2 cards/s carry on, so the cards ease out of the motion and back
         (a few px) instead of either stopping dead or swinging past the
         midpoint, where the stacking order would flip twice. */
      vel = (to - pos) * cps >= 0 ? Math.max(-6, Math.min(6, cps)) : Math.max(-2, Math.min(2, cps));
      /* pointerup, pointercancel or lost capture all commit: a cancel (the
         browser took the gesture) must not throw back a card the finger
         already brought past halfway. */
      moveTo(to);
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    /* Only the stage's own capture: lostpointercapture bubbles, and the
       implicit touch capture on the card under the finger is lost (and
       bubbles here) the moment the stage takes the pointer. */
    stage.addEventListener('lostpointercapture', function (e) {
      if (e.target === stage) release(e);
    });
    /* Pointer events cannot stop a page scroll and touch-action cannot change
       mid-gesture; a non-passive touchmove can. Cancel it while the drag is
       on, and before the 8px decision while the move leans sideways, so iOS
       never starts a vertical pan under a sideways swipe. A move that leans
       vertical is left alone; pointermove then drops the drag (drag = null)
       and the page scrolls. touchstart/touchend are never cancelled, so taps
       still click. */
    stage.addEventListener('touchmove', function (e) {
      if (!drag || !e.cancelable) return;
      var t = e.touches[0];
      if (drag.on || Math.abs(t.clientX - drag.x0) > Math.abs(t.clientY - drag.y0)) e.preventDefault();
    }, { passive: false });

    render();
    place();
    pose();
    TW.on('lang', render);
  });

  /* Card states are built once from today's date. When the date rolls over
     while the tab stays open (timer to the next midnight in the campaign
     zone, and a re-check when the tab becomes visible again), reload so the
     states, the active card and the card structure are all rebuilt. A forced
     ?day= never changes, so it never reloads. */
  function watchMidnight(timeZone, shown) {
    var timer = null;
    function check() {
      if (todayIn(timeZone) !== shown) { location.reload(); return; }
      arm();
    }
    function arm() {
      clearTimeout(timer);
      /* Wake each minute: cheap, immune to sleep/clock jumps, and at most a
         minute late. */
      timer = setTimeout(check, 60000);
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) check();
    });
    arm();
  }
}());
