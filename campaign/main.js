/* ═══════════════════════════════════════════════════════════════
   THE MECHANIC

   Replace everything below. This file and campaign/main.css are the campaign;
   nothing else in the repo is.

   What ships is the demo: a button that opens the registration dialog. It
   exists so a fresh clone runs, and so there is a working example of the one
   seam between a mechanic and the shell.

   ── The seam, in full ────────────────────────────────────────
   The mechanic reaches the shell through window.TW and nothing else:

     TW.ready(fn)               run fn once the chrome is mounted and the
                                first language is applied
     TW.openForm()              open the registration dialog. THIS IS THE
                                POINT OF THE WHOLE PAGE.
     TW.closeForm()
     TW.t(key, vars)            translated string; {name} filled from vars and
                                from the offer figures in campaign.js
     TW.lang() / TW.setLang(c)  current language code / change it
     TW.url(name)               links.<name> from campaign.js, with params and
                                the passthrough query already appended, or
                                null if it is not set
     TW.track(event, props)     analytics; a no-op unless an id is configured
     TW.on(event, fn)           'register' | 'lang' | 'formopen' | 'formclose'
     TW.config                  the parsed campaign.js

   Do not reach into the dialog, do not re-implement it, and do not call
   showModal() yourself: the shell owns focus, scroll locking and the
   confirmation screen.

   ── Rules that still apply ───────────────────────────────────
   * `prefers-reduced-motion` DEGRADES, never removes. A 3D flip becomes a
     crossfade; press feedback survives. A visitor who asked for less motion
     did not ask for less feedback.
   * reset.css forces [hidden] { display: none !important } and display cannot
     be transitioned. Two-step, always: unhide, let one frame pass, then add
     the class the transition runs on.
   * Never put `filter` or `box-shadow` on a node that also rotates in 3D —
     `filter` forces transform-style back to `flat` and the rotation collapses
     into a sideways squash.
   * If your mechanic draws to a <canvas>, size its backing store here. The
     shell deliberately does not: the canvas is yours.
   * Any text the mechanic renders must exist in the font subsets. Run
     `python tools/fonts.py --check` after the final copy — especially if it
     contains ₴, which Roboto does not have at any weight.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  TW.ready(function () {
    var cta = document.querySelector('.cmp-demo__cta');
    if (!cta) return;

    cta.addEventListener('click', function () {
      /* Fire your own event when the visitor completes the mechanic, then
         open the form. Both lines are the whole integration. */
      TW.track('game_win', { mechanic: 'demo' });
      TW.openForm();
    });
  });
}());
