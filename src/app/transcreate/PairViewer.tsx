'use client';

import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';

import { Icon } from '@/components/viewer/icons';
import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import { ToolButton } from '@/components/viewer/ToolButton';
import { cn } from '@/lib/cn';
import { useMountEffect } from '@/lib/use-mount-effect';

import { MEDIA, PROFOUND } from './videos';

import './pair.css';

/**
 * The featured film on /transcreate: the original and its Japanese version
 * as one instrument, side by side, stacked, or laid over each other with a
 * divider the reader drags.
 *
 * Both pictures come from one file (videos.ts, PROFOUND): a 1280 by 1440
 * picture with the original on top and the Japanese version below, paired
 * by frame index. One hidden video element decodes it, and one canvas draws
 * the two halves of each decoded frame where the view puts them, so the two
 * pictures are the same frame by construction: there is no second clock to
 * drift, after a seek, a view change or a stall. The canvas draws on each
 * new video frame (requestVideoFrameCallback, with an animation frame loop
 * where it is missing or stops firing) and on demand while a view change
 * moves the panels or the divider moves.
 *
 * The sound rides in the same file as 5.1: the original's stereo in the
 * front pair and the Japanese dub's stereo in the surround pair. The video
 * element feeds Web Audio (createMediaElementSource), a splitter takes the
 * six channels apart, and gains choose the pair (PAIRS, in the channel order
 * the browser hands over, which the silent centre reveals), so switching between
 * English and Japanese is a 15ms crossfade that never touches the picture
 * or its clock. The graph is built on the first play, which is the gesture
 * that allows sound.
 *
 * A change of view moves the two panels to their new places over 480ms
 * (none under reduced motion). Full screen asks the browser for the
 * viewer's own element, and on a phone that offers no element full screen
 * (iPhone Safari) the viewer covers the window instead. The keys act while
 * the viewer has focus: Space or K plays, the arrows step 5 seconds, comma
 * and period step one frame, Home and End, 1 to 3 the views, L the sound,
 * M mute and F full screen.
 */

type PairView = 'side' | 'stacked' | 'overlay';
type Sound = 'en' | 'ja';

type Rect = { x: number; y: number; w: number; h: number };
/** where each picture sits in the stage, as fractions of its box, and how far the overlay's clip applies (0 to 1) */
type Layout = { o: Rect; j: Rect; wipe: number };
type Tween = { from: Layout; to: PairView; start: number };

const VIEWS: readonly SegOption<PairView>[] = [
  { value: 'side', label: 'Side by side', title: 'Side by side (1)' },
  { value: 'stacked', label: 'Stacked', title: 'Stacked (2)' },
  { value: 'overlay', label: 'Overlay', title: 'Overlay (3)' },
];

const SOUNDS: readonly SegOption<Sound>[] = [
  { value: 'en', label: 'EN', title: 'English sound (L)' },
  { value: 'ja', label: 'JA', title: 'Japanese dub (L)' },
];

const VIEW_KEYS: Readonly<Record<string, PairView>> = { '1': 'side', '2': 'stacked', '3': 'overlay' };

const { frames: FRAMES, fps: FPS } = PROFOUND;
const RATIO = PROFOUND.panel.width / PROFOUND.panel.height;
const SRC = `${MEDIA}/${PROFOUND.file}.mp4`;
const POSTER = `${MEDIA}/${PROFOUND.file}.jpg`;
/** the air between the two pictures, in CSS pixels */
const GAP = 8;
const MOVE_MS = 480;
const IDLE_MS = 2500;
const STEP_S = 5;
const MAX_DPR = 2;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
/* the ease-out the shell's slides read as: fast away, soft landing */
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

/** The two pictures' places for a view in a box bw by bh, as fractions of the box. */
function layoutOf(view: PairView, bw: number, bh: number): Layout {
  if (bw <= 0 || bh <= 0) return { o: { x: 0, y: 0, w: 1, h: 1 }, j: { x: 0, y: 0, w: 1, h: 1 }, wipe: view === 'overlay' ? 1 : 0 };
  const box = (x: number, y: number, w: number, h: number): Rect => ({ x: x / bw, y: y / bh, w: w / bw, h: h / bh });
  if (view === 'side') {
    const w = Math.min((bw - GAP) / 2, bh * RATIO);
    const h = w / RATIO;
    const x = (bw - 2 * w - GAP) / 2;
    const y = (bh - h) / 2;
    return { o: box(x, y, w, h), j: box(x + w + GAP, y, w, h), wipe: 0 };
  }
  if (view === 'stacked') {
    const h = Math.min((bh - GAP) / 2, bw / RATIO);
    const w = h * RATIO;
    const x = (bw - w) / 2;
    const y = (bh - 2 * h - GAP) / 2;
    return { o: box(x, y, w, h), j: box(x, y + h + GAP, w, h), wipe: 0 };
  }
  const w = Math.min(bw, bh * RATIO);
  const h = w / RATIO;
  const r = box((bw - w) / 2, (bh - h) / 2, w, h);
  return { o: r, j: r, wipe: 1 };
}

function clock(frame: number): string {
  const s = Math.floor(frame / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const TOTAL = clock(FRAMES);

/**
 * The two orders a browser hands a 5.1 file's channels to Web Audio in.
 * Chrome and Firefox give Web Audio's order (L, R, C, LFE, SL, SR); Safari
 * gives the AAC stream's own order (C, L, R, Ls, Rs, LFE). Each order has
 * its pair of gains per language, and the silent centre tells which order
 * arrived: it is index 2 in Web Audio's order and index 0 in AAC's.
 */
type Order = 'web' | 'aac';
const PAIRS: Readonly<Record<Order, Readonly<Record<Sound, readonly [number, number]>>>> = {
  web: { en: [0, 1], ja: [4, 5] },
  aac: { en: [1, 2], ja: [3, 4] },
};

type Graph = {
  ctx: AudioContext;
  gains: Record<Order, Record<Sound, GainNode>>;
  master: GainNode;
  /** the analysers on index 0 and index 2 until the order is known */
  probe: { first: AnalyserNode; third: AnalyserNode; buf: Float32Array<ArrayBuffer> } | null;
  order: Order;
};

/** Safari's guess before the probe has heard anything */
function guessOrder(): Order {
  const ua = navigator.userAgent;
  return /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Android/.test(ua) ? 'aac' : 'web';
}

const energy = (node: AnalyserNode, buf: Float32Array<ArrayBuffer>) => {
  node.getFloatTimeDomainData(buf);
  let sum = 0;
  for (const x of buf) sum += x * x;
  return sum / buf.length;
};

type WebkitDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => void };
type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

function fullscreenElement(): Element | null {
  const doc = document as WebkitDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export default function PairViewer({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLInputElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  const [view, setView] = useState<PairView>('overlay');
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState<Sound>('ja');
  const [muted, setMuted] = useState(false);
  const [native, setNative] = useState(false);
  const [cover, setCover] = useState(false);
  const [idle, setIdle] = useState(false);
  const full = native || cover;

  /* the engine's state, read by listeners and the draw loop outside React */
  const eng = useRef({
    view: 'overlay' as PairView,
    tween: null as Tween | null,
    split: 0.5,
    frame: 0,
    want: null as number | null,
    engaged: false,
    hasFrame: false,
    poster: null as HTMLImageElement | null,
    bw: 0,
    bh: 0,
    dpr: 1,
    raf: 0,
    loop: 0,
    lastVideoFrame: 0,
    graph: null as Graph | null,
    sound: 'ja' as Sound,
    muted: false,
    resume: false,
    idleTimer: 0,
    reduce: false,
  }).current;

  /** The current layout: the tween's interpolation while the panels move, the view's own otherwise. */
  const currentLayout = (now: number): { layout: Layout; moving: boolean } => {
    const target = layoutOf(eng.view, eng.bw, eng.bh);
    const tw = eng.tween;
    if (!tw) return { layout: target, moving: false };
    const t = eng.reduce ? 1 : clamp((now - tw.start) / MOVE_MS, 0, 1);
    if (t >= 1) {
      eng.tween = null;
      return { layout: target, moving: false };
    }
    const k = ease(t);
    return {
      layout: { o: lerpRect(tw.from.o, target.o, k), j: lerpRect(tw.from.j, target.j, k), wipe: lerp(tw.from.wipe, target.wipe, k) },
      moving: true,
    };
  };

  /** Draws one frame of the pair where the layout puts it, and places the divider. Returns true while the panels still move. */
  const draw = (now = performance.now()): boolean => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext('2d');
    const { layout, moving } = currentLayout(now);
    if (!canvas || !ctx || !video) return moving;
    const useVideo = eng.engaged && eng.hasFrame && video.readyState >= 2 && video.videoWidth > 0;
    const src: CanvasImageSource | null = useVideo ? video : eng.poster?.complete && eng.poster.naturalWidth ? eng.poster : null;
    const bw = eng.bw;
    const bh = eng.bh;
    ctx.setTransform(eng.dpr, 0, 0, eng.dpr, 0, 0);
    ctx.clearRect(0, 0, bw, bh);
    const o = { x: layout.o.x * bw, y: layout.o.y * bh, w: layout.o.w * bw, h: layout.o.h * bh };
    const j = { x: layout.j.x * bw, y: layout.j.y * bh, w: layout.j.w * bw, h: layout.j.h * bh };
    const cut = lerp(j.x, j.x + eng.split * j.w, layout.wipe);
    if (src) {
      const sw = useVideo ? video.videoWidth : (src as HTMLImageElement).naturalWidth;
      const sh = (useVideo ? video.videoHeight : (src as HTMLImageElement).naturalHeight) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, sw, sh, o.x, o.y, o.w, o.h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(cut, j.y, j.x + j.w - cut, j.h);
      ctx.clip();
      ctx.drawImage(src, 0, sh, sw, sh, j.x, j.y, j.w, j.h);
      ctx.restore();
      if (rootRef.current) rootRef.current.dataset.canvas = '';
    }
    const divider = dividerRef.current;
    if (divider) {
      divider.style.transform = `translate3d(${cut}px, ${j.y}px, 0)`;
      divider.style.height = `${j.h}px`;
      divider.style.opacity = String(layout.wipe);
    }
    return moving;
  };

  /** One draw on the next animation frame, repeated while the panels move. */
  const requestDraw = () => {
    if (eng.raf) return;
    const step = (now: number) => {
      eng.raf = 0;
      if (draw(now)) eng.raf = requestAnimationFrame(step);
    };
    eng.raf = requestAnimationFrame(step);
  };

  /** Shows a frame's position on the scrubber and the clock. */
  const showFrame = (frame: number) => {
    eng.frame = frame;
    const scrub = scrubRef.current;
    if (scrub) {
      scrub.value = String(frame);
      scrub.style.setProperty('--p', `${(frame / (FRAMES - 1)) * 100}%`);
      scrub.setAttribute('aria-valuetext', `${clock(frame)} of ${TOTAL}`);
    }
    const label = clockRef.current;
    if (label) label.textContent = clock(frame);
  };

  const frameOfVideo = () => clamp(Math.floor((videoRef.current?.currentTime ?? 0) * FPS + 1e-3), 0, FRAMES - 1);

  /* while playing: a draw per decoded frame, and an animation frame loop when the frame callback is missing or goes quiet */
  const startLoop = () => {
    const video = videoRef.current;
    if (!video) return;
    const token = ++eng.loop;
    if ('requestVideoFrameCallback' in video) {
      const onFrame = (_now: number, meta: VideoFrameCallbackMetadata) => {
        if (token !== eng.loop) return;
        eng.hasFrame = true;
        eng.lastVideoFrame = performance.now();
        if (eng.want === null) showFrame(clamp(Math.round(meta.mediaTime * FPS), 0, FRAMES - 1));
        draw();
        listen();
        if (!video.paused) video.requestVideoFrameCallback(onFrame);
      };
      video.requestVideoFrameCallback(onFrame);
    }
    eng.lastVideoFrame = performance.now();
    const watch = () => {
      if (token !== eng.loop || video.paused) return;
      if (performance.now() - eng.lastVideoFrame > 250) {
        eng.hasFrame = video.readyState >= 2;
        if (eng.want === null) showFrame(frameOfVideo());
        draw();
        listen();
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  };

  /** Builds the sound graph on the first gesture that plays: the six channels apart, one gain per language. */
  const ensureAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    if (eng.graph) {
      if (eng.graph.ctx.state === 'suspended') void eng.graph.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try {
      const session = (navigator as AudioSessionNavigator).audioSession;
      if (session) session.type = 'playback';
    } catch {
      /* the iPhone's silent switch then mutes the film, as it mutes any page sound */
    }
    try {
      const ctx = new AC();
      const source = ctx.createMediaElementSource(video);
      const split = ctx.createChannelSplitter(6);
      const master = ctx.createGain();
      source.connect(split);
      master.connect(ctx.destination);
      master.gain.value = eng.muted ? 0 : 1;
      const order = guessOrder();
      const pair = (o: Order, sound: Sound) => {
        const merge = ctx.createChannelMerger(2);
        const gain = ctx.createGain();
        const [left, right] = PAIRS[o][sound];
        split.connect(merge, left, 0);
        split.connect(merge, right, 1);
        merge.connect(gain);
        gain.connect(master);
        gain.gain.value = o === order && sound === eng.sound ? 1 : 0;
        return gain;
      };
      const gains = {
        web: { en: pair('web', 'en'), ja: pair('web', 'ja') },
        aac: { en: pair('aac', 'en'), ja: pair('aac', 'ja') },
      };
      const probeNode = (index: number) => {
        const node = ctx.createAnalyser();
        node.fftSize = 512;
        split.connect(node, index);
        return node;
      };
      const probe = { first: probeNode(0), third: probeNode(2), buf: new Float32Array(512) };
      eng.graph = { ctx, gains, master, probe, order };
      if (ctx.state === 'suspended') void ctx.resume();
    } catch {
      /* no graph: the element plays its own downmix, and mute still works */
      video.muted = eng.muted;
    }
  };

  const applySound = () => {
    const g = eng.graph;
    if (!g) return;
    const t = g.ctx.currentTime;
    for (const o of ['web', 'aac'] as const) {
      for (const sound of ['en', 'ja'] as const) {
        g.gains[o][sound].gain.setTargetAtTime(o === g.order && sound === eng.sound ? 1 : 0, t, 0.015);
      }
    }
    g.master.gain.setTargetAtTime(eng.muted ? 0 : 1, t, 0.015);
  };

  /** While the film plays: the silent centre names the channel order, once, and the gains follow it. */
  const listen = () => {
    const g = eng.graph;
    const probe = g?.probe;
    if (!g || !probe) return;
    const first = energy(probe.first, probe.buf);
    const third = energy(probe.third, probe.buf);
    const heard = 1e-8;
    const order: Order | null = first < 1e-12 && third > heard ? 'aac' : third < 1e-12 && first > heard ? 'web' : null;
    if (!order) return;
    g.probe = null;
    probe.first.disconnect();
    probe.third.disconnect();
    /* the order heard, on the element for a test or an agent to read */
    if (rootRef.current) rootRef.current.dataset.channels = order;
    if (order !== g.order) {
      g.order = order;
      applySound();
    }
  };

  const engage = () => {
    if (eng.engaged) return;
    eng.engaged = true;
    const video = videoRef.current;
    if (video && video.preload !== 'auto') video.preload = 'auto';
  };

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    engage();
    ensureAudio();
    if (video.ended || eng.frame >= FRAMES - 1) seek(0);
    video.play().catch(() => {
      setPlaying(false);
    });
  };

  const pause = () => videoRef.current?.pause();
  const toggle = () => (videoRef.current && !videoRef.current.paused ? pause() : play());

  /** Seeks to a frame: one seek in flight at a time, the newest request wins, the clock follows at once. */
  const seek = (target: number) => {
    const video = videoRef.current;
    if (!video) return;
    const frame = clamp(Math.round(target), 0, FRAMES - 1);
    engage();
    showFrame(frame);
    eng.want = frame;
    if (!video.seeking) video.currentTime = (frame + 0.5) / FPS;
  };

  const step = (frames: number) => {
    pause();
    seek(eng.frame + frames);
  };

  const chooseView = (next: PairView) => {
    if (next === eng.view) return;
    eng.tween = { from: currentLayout(performance.now()).layout, to: next, start: performance.now() };
    eng.view = next;
    setView(next);
    requestDraw();
  };

  const chooseSound = (next: Sound) => {
    eng.sound = next;
    setSound(next);
    applySound();
  };

  const toggleMute = () => {
    eng.muted = !eng.muted;
    setMuted(eng.muted);
    applySound();
  };

  const toggleFull = () => {
    const root = rootRef.current as WebkitElement | null;
    if (!root) return;
    const doc = document as WebkitDocument;
    if (fullscreenElement() === root) {
      if (doc.exitFullscreen) void doc.exitFullscreen();
      else doc.webkitExitFullscreen?.();
      return;
    }
    if (cover) {
      setCover(false);
      return;
    }
    if (document.fullscreenEnabled && root.requestFullscreen) {
      root.requestFullscreen().catch(() => setCover(true));
    } else if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
    } else {
      setCover(true);
    }
    root.focus({ preventScroll: true });
  };

  /* the bar leaves after a still pointer while a full screen film plays, and any touch, move or key brings it back */
  const wake = () => {
    window.clearTimeout(eng.idleTimer);
    setIdle(false);
    eng.idleTimer = window.setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused && rootRef.current?.matches('.is-full')) setIdle(true);
    }, IDLE_MS);
  };

  useMountEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!video || !stage || !canvas) return;
    eng.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const poster = new Image();
    poster.decoding = 'async';
    poster.onload = () => requestDraw();
    poster.src = POSTER;
    eng.poster = poster;

    const size = () => {
      const box = stage.getBoundingClientRect();
      eng.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      eng.bw = box.width;
      eng.bh = box.height;
      canvas.width = Math.max(1, Math.round(box.width * eng.dpr));
      canvas.height = Math.max(1, Math.round(box.height * eng.dpr));
      draw();
    };
    const observer = new ResizeObserver(size);
    observer.observe(stage);

    const onSeeked = () => {
      eng.hasFrame = video.readyState >= 2;
      const want = eng.want;
      if (want !== null && frameOfVideo() !== want) {
        video.currentTime = (want + 0.5) / FPS;
        return;
      }
      eng.want = null;
      showFrame(frameOfVideo());
      requestDraw();
    };
    const onPlay = () => {
      setPlaying(true);
      startLoop();
      wake();
    };
    const onPause = () => {
      eng.loop++;
      setPlaying(false);
      setIdle(false);
      window.clearTimeout(eng.idleTimer);
      if (eng.want === null) showFrame(frameOfVideo());
      requestDraw();
    };
    const onData = () => {
      eng.hasFrame = video.readyState >= 2;
      if (eng.engaged) requestDraw();
    };
    const onFullChange = () => {
      setNative(fullscreenElement() === rootRef.current);
      wake();
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onPause);
    video.addEventListener('loadeddata', onData);
    document.addEventListener('fullscreenchange', onFullChange);
    document.addEventListener('webkitfullscreenchange', onFullChange);
    return () => {
      observer.disconnect();
      eng.loop++;
      cancelAnimationFrame(eng.raf);
      window.clearTimeout(eng.idleTimer);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onPause);
      video.removeEventListener('loadeddata', onData);
      document.removeEventListener('fullscreenchange', onFullChange);
      document.removeEventListener('webkitfullscreenchange', onFullChange);
      video.pause();
      void eng.graph?.ctx.close();
      eng.graph = null;
    };
  });

  /* ---------- the stage: the divider follows a drag in the overlay; elsewhere a press plays or pauses ---------- */

  const drag = useRef<{ id: number; x: number; y: number; moved: boolean; split: boolean } | null>(null);

  const splitAt = (clientX: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    const j = currentLayout(performance.now()).layout.j;
    const left = box.left + j.x * eng.bw;
    eng.split = clamp((clientX - left) / (j.w * eng.bw), 0, 1);
    gripRef.current?.setAttribute('aria-valuenow', String(Math.round(eng.split * 100)));
    requestDraw();
  };

  const onStageDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    rootRef.current?.focus({ preventScroll: true });
    const split = eng.view === 'overlay';
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, split };
    if (split) {
      e.currentTarget.setPointerCapture(e.pointerId);
      splitAt(e.clientX);
      if (rootRef.current) rootRef.current.dataset.dragging = '';
    }
  };

  const onStageMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) d.moved = true;
    if (d.split) splitAt(e.clientX);
  };

  const onStageUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (rootRef.current) delete rootRef.current.dataset.dragging;
    if (!d || d.id !== e.pointerId || d.split || d.moved) return;
    /* a touch on a full screen film whose bar has left brings the bar back first */
    if (e.pointerType !== 'mouse' && idle) {
      wake();
      return;
    }
    toggle();
  };

  const onGripKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const by = e.shiftKey ? 0.1 : 0.02;
    let next: number | null = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = eng.split - by;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = eng.split + by;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 1;
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    eng.split = clamp(next, 0, 1);
    e.currentTarget.setAttribute('aria-valuenow', String(Math.round(eng.split * 100)));
    requestDraw();
  };

  /* ---------- the keys, while the viewer has focus ---------- */

  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    const onButton = target.closest('button') !== null;
    const onScrub = target === scrubRef.current;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    let done = true;
    if ((key === ' ' && !onButton) || key === 'k') toggle();
    else if (key === 'ArrowLeft' && !onScrub) seek(eng.frame - STEP_S * FPS);
    else if (key === 'ArrowRight' && !onScrub) seek(eng.frame + STEP_S * FPS);
    else if (key === ',') step(-1);
    else if (key === '.') step(1);
    else if (key === 'Home') seek(0);
    else if (key === 'End') seek(FRAMES - 1);
    else if (VIEW_KEYS[key]) chooseView(VIEW_KEYS[key]);
    else if (key === 'l') chooseSound(eng.sound === 'en' ? 'ja' : 'en');
    else if (key === 'm') toggleMute();
    else if (key === 'f') toggleFull();
    else if (key === 'Escape' && cover) setCover(false);
    else done = false;
    if (done) {
      e.preventDefault();
      if (full) wake();
    }
  };

  /* the scrubber: a drag pauses the film and lets it play on when it ends */
  const onScrubDown = () => {
    const video = videoRef.current;
    eng.resume = Boolean(video && !video.paused);
    if (eng.resume) pause();
  };
  const onScrubUp = () => {
    if (eng.resume) play();
    eng.resume = false;
  };

  return (
    <div
      ref={rootRef}
      className={cn('tcp', `is-${view}`, full && 'is-full', cover && 'is-cover', idle && 'is-idle', className)}
      tabIndex={0}
      role='group'
      aria-label={`${PROFOUND.name}, the original and the Japanese version`}
      aria-roledescription='film comparison'
      onKeyDown={onKey}
      onPointerMove={full ? wake : undefined}
    >
      <div
        ref={stageRef}
        className='tcp-stage'
        onPointerDown={onStageDown}
        onPointerMove={onStageMove}
        onPointerUp={onStageUp}
        onPointerCancel={onStageUp}
      >
        {/* the still first frame before any script: the poster's two halves in the overlay at its middle */}
        <div className='tcp-still' aria-hidden='true' style={{ backgroundImage: `url(${POSTER})` }} />
        <div className='tcp-still is-ja' aria-hidden='true' style={{ backgroundImage: `url(${POSTER})` }} />
        <video ref={videoRef} className='tcp-video' src={SRC} preload='metadata' playsInline tabIndex={-1} aria-hidden='true' />
        <canvas ref={canvasRef} className='tcp-canvas' aria-hidden='true' />
        <div ref={dividerRef} className='tcp-divider' aria-hidden={view !== 'overlay'}>
          <div
            ref={gripRef}
            className='tcp-grip'
            role='slider'
            tabIndex={view === 'overlay' ? 0 : -1}
            aria-label='Divider, the original to the left and the Japanese version to the right'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={50}
            aria-orientation='horizontal'
            onKeyDown={onGripKey}
          >
            <Icon name='compare' />
          </div>
        </div>
      </div>

      <div className='tcp-bar'>
        <ToolButton
          className='tcp-play'
          icon={playing ? 'pause' : 'present'}
          title={playing ? 'Pause (Space)' : 'Play (Space)'}
          onClick={toggle}
        />
        <div className='tcp-time'>
          <input
            ref={scrubRef}
            className='tcp-scrub'
            type='range'
            min={0}
            max={FRAMES - 1}
            step={1}
            defaultValue={0}
            aria-label='Position'
            aria-valuetext={`0:00 of ${TOTAL}`}
            onInput={(e) => seek(Number(e.currentTarget.value))}
            onPointerDown={onScrubDown}
            onPointerUp={onScrubUp}
          />
          <span className='tcp-clock'>
            <span ref={clockRef}>0:00</span>
            <span className='tcp-total'> / {TOTAL}</span>
          </span>
        </div>
        <Seg className='tcp-views' label='View' options={VIEWS} value={view} onChange={chooseView} />
        <div className='tcp-sound'>
          <ToolButton className='tcp-mute' icon={muted ? 'muted' : 'sound'} title={muted ? 'Sound on (M)' : 'Mute (M)'} onClick={toggleMute} />
          <Seg className='tcp-lang' label='Sound' options={SOUNDS} value={sound} onChange={chooseSound} />
        </div>
        <ToolButton
          className='tcp-full'
          icon={full ? 'exit-fullscreen' : 'fullscreen'}
          title={full ? 'Leave full screen (F)' : 'Full screen (F)'}
          onClick={toggleFull}
        />
      </div>
    </div>
  );
}
