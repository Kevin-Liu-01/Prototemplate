/*
 * journey-to-the-west: mounts one beat.
 *
 * Each beat is a sub-composition (compositions/b1.html to b8.html) mounted by
 * index.html at its film time. Its template holds its plates and calls
 * JW.mount(id, start, duration); the beat's builder (lib/b1.js to lib/b8.js)
 * is written in film seconds, so the timeline it is given subtracts the beat's
 * start from every position. The build waits for the faces (text widths and
 * baselines are measured once), then registers the beat's one paused timeline as window.__timelines[id]. Every
 * frame is a function of the timeline's time alone.
 */
(function () {
  const J = window.JW;

  // A timeline seen in film seconds: every position is moved back by start.
  function shifted(tl, start) {
    return {
      fromTo: (t, a, b, at) => tl.fromTo(t, a, b, at - start),
      to: (t, b, at) => tl.to(t, b, at - start),
      set: (t, b, at) => tl.set(t, b, at - start),
    };
  }

  J.mount = function (id, start, duration) {
    const boot = () => {
      // The beat's own root: the deepest element carrying its composition id.
      const all = document.querySelectorAll('[data-composition-id="' + id + '"]');
      const root = all[all.length - 1];
      // Plate sizes come from data/plates.js, so only the faces are awaited;
      // the renderer itself waits for every <img> before it captures a frame.
      const ready = [
        document.fonts.load('400 44px "JW Latin"', 'Monkey bìmǎwēn'),
        document.fonts.load('italic 400 44px "JW Latin"', 'macaque'),
        document.fonts.load('500 44px "JW Han"', '唐三藏胡適西遊記馬廄畜母猴辟瘟疫'),
      ];
      Promise.all(ready).then(() => {
        gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin);
        const updaters = [];
        const tl = gsap.timeline({ paused: true, onUpdate: () => updaters.forEach((f) => f(tl.time() + start)) });
        J.scenes[id](shifted(tl, start), root, { on: (f) => updaters.push(f) });
        // The timeline spans the whole beat, so a seek to its last frame holds.
        tl.set({}, {}, duration);
        tl.seek(0, false);
        updaters.forEach((f) => f(start));
        window.__timelines = window.__timelines || {};
        window.__timelines[id] = tl;
        if (typeof window.__hfForceTimelineRebind === 'function') window.__hfForceTimelineRebind();
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  };
})();
