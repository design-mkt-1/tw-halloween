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
   Every card sits in the same spot; --p (its index minus the active one)
   places it and data-pos (-2..2) stacks it (cards.css). On touch the cards
   follow the finger (§ swipe). Only pos 0 is interactive: the rest are inert and
   aria-hidden. Arrows, swipe, and ArrowLeft/ArrowRight while focus is
   inside move one card; the pager under the cards jumps to any day. The
   ends do not wrap: an end arrow turns
   aria-disabled rather than disabled, so a keyboard user's focus is not
   dropped to <body> when they reach it.

   ── Rules this file keeps ────────────────────────────────────
   * All copy is TW.t(); every string re-renders on TW.on('lang').
   * Offer figures are numbers from campaign.js, formatted per locale.
   * prefers-reduced-motion is handled in cards.css: the slide becomes an
     instant move and the flip a crossfade. Nothing here branches on it.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var LOCALE = { ua: 'uk-UA', ru: 'ru-RU', en: 'en-US' };

  /* ── wide screens ─────────────────────────────────────────────
     Figma "Desktop - 1920" (27:1072) is the 1440 frame (21:533) times
     1920/1440, nothing moved: above 1440 the whole page grows with the
     window. The owner wants the same on 2560x1440 -- the page fills the
     width and scrolls down to the payment methods. CSS zoom on <html>
     scales layout and text together, so browser zoom still works on top.
     It is set here, not in CSS, because calc() cannot yet divide 100vw by
     a length portably. */
  function fit() {
    var z = window.innerWidth / 1440;
    document.documentElement.style.zoom = z > 1 ? String(z) : '';
  }
  fit();
  window.addEventListener('resize', fit);

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
    /* en-CA formats as YYYY-MM-DD, which also sorts as a string. */
    return new Intl.DateTimeFormat('en-CA', { timeZone: timeZone }).format(new Date());
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
         as a dimmed button with nothing to do. aria-disabled on a plain span
         keeps the word visible and says why it does nothing. */
      refs.btn = el('span', 'cmp-card__btn');
      refs.btn.setAttribute('aria-disabled', 'true');
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
      refs.info.setAttribute('aria-label', TW.t('card.info.aria'));
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
      prev.setAttribute('aria-label', TW.t('card.prev'));
      next.setAttribute('aria-label', TW.t('card.next'));
    }

    /* data-pos only stacks the cards (cards.css); shift is the drag, so the
       card nearest the centre comes to the front while the finger moves. */
    function stack(shift) {
      cards.forEach(function (c, i) {
        var pos = Math.max(-2, Math.min(2, Math.round(i - active - shift)));
        c.card.setAttribute('data-pos', String(pos));
      });
    }

    function place() {
      /* Focus inside a card that is about to go inert would drop to <body>,
         and the next arrow press would do nothing. Note it here, move it to
         the new centre card below. Focus outside the cards stays put. */
      var hadFocus = cards.some(function (c) { return c.card.contains(document.activeElement); });
      stack(0);
      cards.forEach(function (c, i) {
        var pos = i - active;
        /* --p drives the pose (cards.css). */
        c.card.style.setProperty('--p', String(pos));
        var off = pos !== 0;
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
        var target = cur.info || cur.card;
        if (target === cur.card) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }

    function go(step) {
      var to = Math.max(0, Math.min(cards.length - 1, active + step));
      if (to === active) return;
      active = to;
      place();
    }

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    });

    /* Swipe: the cards follow the finger, then snap. --drag on the stage is
       the travel in neighbour steps (px / --nb-x); cards.css adds it to each
       card's --p. On release it rounds to the nearest card, and a quick flick
       (over 0.3 px/ms) moves one card even when the travel is short.
       Past either end the drag gives a third as much, a rubber band.
       The drag only starts once the move is clearly sideways (8px, more x
       than y); until then a tap is a tap and the buttons inside get their
       click. touch-action: pan-y in cards.css leaves vertical scrolling to
       the page, which then sends pointercancel. Mouse uses the arrows. */
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || drag) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, on: false,
               step: parseFloat(getComputedStyle(root).getPropertyValue('--nb-x')) || 1,
               t: e.timeStamp, x: e.clientX, v: 0 };
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { drag = null; return; }
        if (Math.abs(dx) < 8) return;
        drag.on = true;
        /* From here the gesture is the carousel's: capture keeps the moves
           coming outside the stage, and the click after release lands on
           the stage instead of on a button under the finger. */
        stage.setPointerCapture(e.pointerId);
        stage.classList.add('is-dragging');
      }
      var dt = e.timeStamp - drag.t;
      if (dt > 0) drag.v = (e.clientX - drag.x) / dt;
      drag.t = e.timeStamp; drag.x = e.clientX;
      /* clientX is in screen px; under the wide-screen zoom a CSS px is
         currentCSSZoom of them. */
      var f = -dx / (drag.step * (root.currentCSSZoom || 1));
      var lo = -active, hi = cards.length - 1 - active;
      if (f < lo) f = lo + (f - lo) / 3;
      else if (f > hi) f = hi + (f - hi) / 3;
      drag.f = f;
      stage.style.setProperty('--drag', String(-f));
      stack(f);
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.on) return;
      var steps = Math.round(d.f || 0);
      /* A flick that was still moving at release, recently. */
      if (e.timeStamp - d.t < 100 && Math.abs(d.v) > 0.3 && steps === 0) steps = d.v < 0 ? 1 : -1;
      /* Same frame: the transition comes back and --drag goes to 0 while --p
         moves, so each card animates from where the finger left it. */
      stage.classList.remove('is-dragging');
      stage.style.removeProperty('--drag');
      if (e.type === 'pointerup') go(steps);
      stack(0);   // go() returns early at an end or on 0 steps
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);

    render();
    place();
    TW.on('lang', render);
  });
}());
