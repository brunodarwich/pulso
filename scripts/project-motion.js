/** Finite, visibility-aware motion. Scrolling always belongs to the browser. */
(function () {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const active = new Map();
  const visible = new Set();
  const seen = new WeakSet();
  const ease = 'cubic-bezier(.22, 1, .36, 1)';

  function animate(element, frames, options, owner = element) {
    if (preference.matches || !element.animate) return;
    const animation = element.animate(frames, { duration: 560, easing: ease, fill: 'backwards', ...options });
    active.set(animation, owner);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
    return animation;
  }

  function illustrate(card) {
    if (preference.matches || document.hidden || !visible.has(card)) return;
    // A hover during entry must not stack another animation on the same drawing.
    if ([...active.values()].includes(card)) return;
    card.querySelectorAll('[data-motion-part]').forEach((part, index) => {
      const kind = part.dataset.motionPart;
      const delay = Math.min(index * 40, 360);
      if (kind === 'route') {
        animate(part, [{ strokeDashoffset: 22, opacity: .5 }, { strokeDashoffset: 0, opacity: 1 }],
          { duration: 1000, delay }, card);
      } else if (kind === 'bar') {
        animate(part, [{ transform: 'scaleY(.65)', opacity: .6 }, { transform: 'scaleY(1)', opacity: 1 }],
          { duration: 700, delay }, card);
      } else if (kind === 'lens') {
        animate(part, [{ transform: 'translate(-10px, -7px) scale(.94)', opacity: .55 }, { transform: 'translate(0, 0) scale(1)', opacity: 1 }],
          { duration: 750, delay }, card);
      } else if (kind === 'sheet-back') {
        animate(part, [{ transform: 'translate(-5px, 3px)', opacity: .5 }, { transform: 'translate(0, 0)', opacity: 1 }],
          { duration: 650, delay }, card);
      } else if (kind === 'sheet-mid') {
        animate(part, [{ transform: 'translate(-2.5px, 1.5px)', opacity: .6 }, { transform: 'translate(0, 0)', opacity: 1 }],
          { duration: 650, delay }, card);
      } else {
        animate(part, [{ transform: 'translateY(5px)', opacity: .55 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 650, delay }, card);
      }
    });
  }

  function sync() {
    active.forEach((owner, animation) => {
      if (preference.matches) animation.cancel();
      else if (document.hidden || !visible.has(owner)) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
  }

  function init() {
    if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
    const targets = [...document.querySelectorAll(
      '[data-reveal="hero-title"], .hero [data-reveal="fade-up"], .method-header, .step-card, ' +
      '.consulting-header, .consulting-card, .projects-header, .partnerships-header, .pulso-dev-intro, .project-card, .about-grid, .contact-card'
    )];
    const observer = new IntersectionObserver(entries => {
      let order = 0;
      entries.forEach(entry => {
        const element = entry.target;
        if (entry.isIntersecting) {
          visible.add(element);
          if (!seen.has(element)) {
            seen.add(element);
            if (!preference.matches && !document.hidden) {
              // No persistent hidden styles: content is readable if JS fails or motion is disabled.
              animate(element, [{ opacity: .3, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { delay: Math.min(order++ * 65, 195), fill: 'backwards' });
              if (element.matches('.project-card')) {
                const entryAnimation = [...active.keys()].find(a => active.get(a) === element);
                entryAnimation?.finished.then(() => illustrate(element), () => {});
              }
            }
          }
        } else visible.delete(element);
      });
      sync();
    }, { threshold: 0 });
    targets.forEach(element => observer.observe(element));
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('pointerenter', () => { if (hover.matches) illustrate(card); });
      card.addEventListener('focusin', () => illustrate(card));
    });
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
