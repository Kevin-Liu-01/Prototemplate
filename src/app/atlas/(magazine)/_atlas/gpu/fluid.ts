/// <reference types="@webgpu/types" />
/* The press covers' WebGPU engine: one shared device, the Fluid Energy
   passes from fluid-wgsl.ts, and one solver per cover. A cover warms its
   fluid up once, draws a still, and runs only while play() holds it; the
   owner pauses it off screen. mountFluid answers null where WebGPU is
   missing, and the owner draws its fallback. */

import { FLUID_SLOT_BYTES, FLUID_UNIFORM_BYTES, FLUID_WGSL } from './fluid-wgsl';

export type CoverSpec = {
  /** Ground, first dye, second dye. */
  colors: readonly [string, string, string];
  brightness: number;
  grain: number;
  amplitude: number;
  density: number;
  detail: number;
  frequency: number;
  strength: number;
  speed: number;
  /** Seconds into the jets' orbits the cover starts at, so each cover marbles differently. */
  seed: number;
  /** The type's ink, sRGB hex. */
  paper: string;
  /** The crisp art's ink (the mask's blue); the type's ink when unset. */
  art?: string;
  /** Prints the mask's red as a solid accent in this ink instead of a dithered emblem. */
  accent?: string;
  /** The cover's typeface. */
  face?: 'sans' | 'serif' | 'mono';
  /** Slows the flow and the jets together: 1 is Glyphfield's own rate. */
  pace?: number;
  /** Prints the fluid through the Bayer screen in its three inks; on unless false. */
  dither?: boolean;
  /** Scales the fluid's tone down, 0 to 1: lower is quieter. */
  calm?: number;
  /** The share of the fluid the cover shows, around its middle: lower is closer in. */
  zoom?: number;
};

export type FluidHandle = {
  play(): void;
  pause(): void;
  /** A canvas the size of the cover with the type in its alpha. */
  setText(source: HTMLCanvasElement): void;
  destroy(): void;
};

type PassName = 'emitVel' | 'emitDye' | 'curl' | 'vorticity' | 'divergence' | 'scale' | 'pressure' | 'gradient' | 'advVel' | 'advDye' | 'display';
const SLOTS: PassName[] = ['emitVel', 'emitDye', 'curl', 'vorticity', 'divergence', 'scale', 'pressure', 'gradient', 'advVel', 'advDye', 'display'];
const SLOT = Object.fromEntries(SLOTS.map((name, i) => [name, i])) as Record<PassName, number>;
const FLOATS = FLUID_SLOT_BYTES / 4;
const PRESSURE_ITERATIONS = 20;
const WARMUP_STEPS = 120;

let devicePromise: Promise<GPUDevice | null> | null = null;

export function gpuDevice(): Promise<GPUDevice | null> {
  devicePromise ??= (async () => {
    if (typeof navigator === 'undefined' || !navigator.gpu) return null;
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return null;
    const device = await adapter.requestDevice();
    void device.lost.then(() => {
      devicePromise = null;
    });
    return device;
  })().catch(() => null);
  return devicePromise;
}

type Kit = {
  layout: GPUBindGroupLayout;
  sampler: GPUSampler;
  pipelines: Record<PassName, GPURenderPipeline>;
};

const kits = new WeakMap<GPUDevice, Kit>();

function kitFor(device: GPUDevice, canvasFormat: GPUTextureFormat): Kit {
  const cached = kits.get(device);
  if (cached) return cached;
  const module = device.createShaderModule({ code: FLUID_WGSL });
  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform', hasDynamicOffset: true, minBindingSize: FLUID_UNIFORM_BYTES } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
    ],
  });
  const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [layout] });
  const make = (entryPoint: string, format: GPUTextureFormat) =>
    device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: { module, entryPoint: 'vs' },
      fragment: { module, entryPoint, targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
    });
  const kit: Kit = {
    layout,
    sampler: device.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' }),
    pipelines: {
      emitVel: make('emit', 'rg16float'),
      emitDye: make('emit', 'rgba16float'),
      curl: make('curl', 'r16float'),
      vorticity: make('vorticity', 'rg16float'),
      divergence: make('divergence', 'r16float'),
      scale: make('scale', 'r16float'),
      pressure: make('pressure', 'r16float'),
      gradient: make('gradient', 'rg16float'),
      advVel: make('advect', 'rg16float'),
      advDye: make('advect', 'rgba16float'),
      display: make('display', canvasFormat),
    },
  };
  kits.set(device, kit);
  return kit;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linear(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [toLinear(r), toLinear(g), toLinear(b)];
}

/** Glyphfield's three slow orbiting jets; pure functions of time. */
function jets(time: number, frequency: number) {
  const motion = time * (0.42 + frequency * 0.025);
  const orbit = (phase: number, rateX: number, rateY: number, radiusX: number, radiusY: number, cx: number, cy: number) => {
    const x = cx + Math.sin(motion * rateX + phase) * radiusX;
    const y = cy + Math.cos(motion * rateY + phase) * radiusY;
    const dx = Math.cos(motion * rateX + phase) * radiusX * rateX;
    const dy = -Math.sin(motion * rateY + phase) * radiusY * rateY;
    const length = Math.hypot(dx, dy) || 1;
    return { dx: dx / length, dy: dy / length, x, y };
  };
  return [
    { color: 1, ...orbit(0, 0.83, 0.71, 0.24, 0.22, 0.32, 0.4) },
    { color: 2, ...orbit(2.1, 0.64, 0.77, 0.22, 0.2, 0.68, 0.6) },
    { color: 1, ...orbit(4.2, 0.39, 0.48, 0.3, 0.28, 0.5, 0.5) },
  ] as const;
}

function fitShortSide(width: number, height: number, short: number) {
  const aspect = width / Math.max(1, height);
  return aspect >= 1 ? { w: Math.round(short * aspect), h: short } : { w: short, h: Math.round(short / aspect) };
}

type Target = { texture: GPUTexture; view: GPUTextureView; w: number; h: number };
type Pair = { read: Target; write: Target };

export async function mountFluid(canvas: HTMLCanvasElement, spec: CoverSpec): Promise<FluidHandle | null> {
  const device = await gpuDevice();
  if (!device) return null;
  const context = canvas.getContext('webgpu');
  if (!context) return null;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });
  const kit = kitFor(device, format);

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(64, Math.round(canvas.clientWidth * dpr));
  const height = Math.max(36, Math.round(canvas.clientHeight * dpr));
  canvas.width = width;
  canvas.height = height;

  const owned: GPUTexture[] = [];
  const target = (w: number, h: number, format: GPUTextureFormat, extra = 0): Target => {
    const texture = device.createTexture({ size: [w, h], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | extra });
    owned.push(texture);
    return { texture, view: texture.createView(), w, h };
  };
  const pair = (w: number, h: number, format: GPUTextureFormat): Pair => ({ read: target(w, h, format), write: target(w, h, format) });
  const swap = (p: Pair) => {
    const read = p.read;
    p.read = p.write;
    p.write = read;
  };

  const sim = fitShortSide(width, height, Math.round(Math.min(224, Math.max(96, 96 + spec.detail * 14))));
  const dyeSize = fitShortSide(width, height, Math.min(1024, Math.max(192, Math.min(width, height))));
  const velocity = pair(sim.w, sim.h, 'rg16float');
  const pressure = pair(sim.w, sim.h, 'r16float');
  const curl = target(sim.w, sim.h, 'r16float');
  const divergence = target(sim.w, sim.h, 'r16float');
  const dye = pair(dyeSize.w, dyeSize.h, 'rgba16float');
  let text = target(width, height, 'rgba8unorm', GPUTextureUsage.COPY_DST);

  const uniforms = device.createBuffer({ size: SLOTS.length * FLUID_SLOT_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const data = new Float32Array(SLOTS.length * FLOATS);
  const palette = spec.colors.map(linear) as [number, number, number][];
  const ground = palette[0]!;
  const paper = hexToRgb(spec.paper);
  const rate = Math.min(3, Math.sqrt(Math.min(1.5, spec.speed)) * 2.1);
  const pace = spec.pace ?? 1;
  const pointer = { x: 0.5, y: 0.5, lastX: 0.5, lastY: 0.5, vx: 0, vy: 0, until: 0 };

  const put = (slot: PassName, values: Partial<Record<'texel' | 'velTexel', [number, number]>> & Partial<Record<'dt' | 'curl' | 'dissipation' | 'edgeFade' | 'aspect' | 'count' | 'value' | 'time', number>>) => {
    const o = SLOT[slot] * FLOATS;
    if (values.texel) data.set(values.texel, o);
    if (values.dt !== undefined) data[o + 2] = values.dt;
    if (values.curl !== undefined) data[o + 3] = values.curl;
    if (values.velTexel) data.set(values.velTexel, o + 4);
    if (values.dissipation !== undefined) data[o + 6] = values.dissipation;
    if (values.edgeFade !== undefined) data[o + 7] = values.edgeFade;
    if (values.aspect !== undefined) data[o + 8] = values.aspect;
    if (values.count !== undefined) data[o + 9] = values.count;
    if (values.value !== undefined) data[o + 10] = values.value;
    if (values.time !== undefined) data[o + 11] = values.time;
  };
  const splats = (slot: PassName, points: { x: number; y: number; r: number; v: [number, number, number] }[]) => {
    const o = SLOT[slot] * FLOATS;
    points.slice(0, 4).forEach((p, k) => {
      data.set([p.x, p.y, p.r, 0], o + 20 + k * 4);
      data.set([...p.v, 0], o + 36 + k * 4);
    });
    data[o + 9] = Math.min(4, points.length);
  };

  // what never changes between steps
  const simTexel: [number, number] = [1 / sim.w, 1 / sim.h];
  for (const slot of ['curl', 'vorticity', 'divergence', 'pressure', 'gradient', 'advVel', 'advDye'] as const) put(slot, { texel: simTexel });
  put('vorticity', { curl: 14 + spec.strength * 22 });
  put('scale', { value: 0.8 });
  put('advVel', { velTexel: simTexel, dissipation: 0.25, edgeFade: 0 });
  put('advDye', { velTexel: simTexel, dissipation: 2.1 - Math.min(1.5, spec.density) * 0.8, edgeFade: 6 });
  put('emitVel', { aspect: sim.w / sim.h });
  put('emitDye', { aspect: dyeSize.w / dyeSize.h });
  put('display', { texel: [1 / dyeSize.w, 1 / dyeSize.h], velTexel: [width, height] });
  {
    const o = SLOT.display * FLOATS;
    data.set([...ground, spec.brightness], o + 12);
    data.set([...paper, spec.grain], o + 16);
    // the dither: a one CSS pixel cell, on or off, the calm and the zoom, then the three inks in sRGB
    const cell = Math.max(1, Math.round(dpr));
    data.set([cell, spec.dither === false ? 0 : 1, spec.calm ?? 1, spec.zoom ?? 1], o + 20);
    spec.colors.forEach((hex, k) => data.set([...hexToRgb(hex), 1], o + 36 + k * 4));
    // the crisp art's ink after the three, and the accent ink with its switch in the second point
    data.set([...hexToRgb(spec.art ?? spec.paper), 1], o + 48);
    data.set([...hexToRgb(spec.accent ?? spec.paper), spec.accent ? 1 : 0], o + 24);
  }

  const pass = (encoder: GPUCommandEncoder, name: PassName, out: GPUTextureView, a: Target, b: Target = a) => {
    const group = device.createBindGroup({
      layout: kit.layout,
      entries: [
        { binding: 0, resource: { buffer: uniforms, size: FLUID_UNIFORM_BYTES } },
        { binding: 1, resource: kit.sampler },
        { binding: 2, resource: a.view },
        { binding: 3, resource: b.view },
      ],
    });
    const render = encoder.beginRenderPass({ colorAttachments: [{ view: out, loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }] });
    render.setPipeline(kit.pipelines[name]);
    render.setBindGroup(0, group, [SLOT[name] * FLUID_SLOT_BYTES]);
    render.draw(3);
    render.end();
  };

  const step = (dt: number, time: number, live: boolean) => {
    const radius = 0.0009 + spec.amplitude * 0.00024;
    const acceleration = (5 + spec.strength * 9) * sim.h * dt;
    const dyeRate = (2.4 + spec.density * 3) * dt;
    const js = jets(time, spec.frequency);
    const vel = js.map((j) => ({ x: j.x, y: j.y, r: radius, v: [j.dx * acceleration, j.dy * acceleration, 0] as [number, number, number] }));
    const ink = js.map((j) => {
      const c = palette[j.color]!;
      return { x: j.x, y: j.y, r: radius * 0.8, v: [c[0] * dyeRate, c[1] * dyeRate, c[2] * dyeRate] as [number, number, number] };
    });
    if (live) {
      vel.push({ x: pointer.x, y: pointer.y, r: radius * 0.7, v: [pointer.vx * sim.h * 6, pointer.vy * sim.h * 6, 0] });
      const c = palette[2]!;
      ink.push({ x: pointer.x, y: pointer.y, r: radius * 0.6, v: [c[0] * 0.35, c[1] * 0.35, c[2] * 0.35] });
    }
    splats('emitVel', vel);
    splats('emitDye', ink);
    put('vorticity', { dt });
    put('advVel', { dt });
    put('advDye', { dt });
    device.queue.writeBuffer(uniforms, 0, data);

    const encoder = device.createCommandEncoder();
    pass(encoder, 'emitVel', velocity.write.view, velocity.read);
    swap(velocity);
    pass(encoder, 'emitDye', dye.write.view, dye.read);
    swap(dye);
    pass(encoder, 'curl', curl.view, velocity.read);
    pass(encoder, 'vorticity', velocity.write.view, velocity.read, curl);
    swap(velocity);
    pass(encoder, 'divergence', divergence.view, velocity.read);
    pass(encoder, 'scale', pressure.write.view, pressure.read);
    swap(pressure);
    for (let k = 0; k < PRESSURE_ITERATIONS; k++) {
      pass(encoder, 'pressure', pressure.write.view, pressure.read, divergence);
      swap(pressure);
    }
    pass(encoder, 'gradient', velocity.write.view, pressure.read, velocity.read);
    swap(velocity);
    pass(encoder, 'advVel', velocity.write.view, velocity.read, velocity.read);
    swap(velocity);
    pass(encoder, 'advDye', dye.write.view, velocity.read, dye.read);
    swap(dye);
    device.queue.submit([encoder.finish()]);
  };

  const draw = (time: number) => {
    put('display', { time });
    device.queue.writeBuffer(uniforms, SLOT.display * FLUID_SLOT_BYTES, data, SLOT.display * FLOATS, FLOATS);
    const encoder = device.createCommandEncoder();
    pass(encoder, 'display', context.getCurrentTexture().createView(), dye.read, text);
    device.queue.submit([encoder.finish()]);
  };

  let clock = spec.seed;
  for (let k = 0; k < WARMUP_STEPS; k++) {
    clock += (1 / 60) * rate;
    step(1 / 60, clock, false);
  }
  draw(clock);

  let frame = 0;
  let last = 0;
  let playing = false;
  const tick = (now: number) => {
    const ms = last ? Math.min(50, now - last) : 16;
    last = now;
    clock += (ms / 1000) * rate * pace;
    const live = now < pointer.until;
    step(Math.min(1 / 30, (ms / 1000) * (0.72 + rate * 0.6)) * pace, clock, live);
    pointer.vx *= 0.82;
    pointer.vy *= 0.82;
    draw(clock);
    if (playing) frame = requestAnimationFrame(tick);
  };

  const onPointer = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return;
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    pointer.vx = Math.max(-0.35, Math.min(0.35, (x - pointer.lastX) * 2.8));
    pointer.vy = Math.max(-0.35, Math.min(0.35, (y - pointer.lastY) * 2.8));
    pointer.x = pointer.lastX = x;
    pointer.y = pointer.lastY = y;
    pointer.until = performance.now() + 140;
  };
  canvas.addEventListener('pointermove', onPointer, { passive: true });

  return {
    play() {
      if (playing) return;
      playing = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(frame);
    },
    setText(source) {
      if (source.width !== text.w || source.height !== text.h) {
        text.texture.destroy();
        text = target(source.width, source.height, 'rgba8unorm', GPUTextureUsage.COPY_DST);
      }
      device.queue.copyExternalImageToTexture({ source }, { texture: text.texture }, [source.width, source.height]);
      if (!playing) draw(clock);
    },
    destroy() {
      playing = false;
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointermove', onPointer);
      for (const texture of owned) texture.destroy();
      uniforms.destroy();
      context.unconfigure();
    },
  };
}
