import type { PrismaticParams } from './prismatic-field';

/**
 * The prismatic field drawn in a worker. A field the shared engine draws
 * (prismatic-field.ts) stops whenever the main thread runs a long task:
 * hydration, a slide's setup, a same-origin frame loading. A canvas handed
 * here with transferControlToOffscreen is drawn on this worker's own
 * animation frames and reaches the screen without the main thread, so the
 * field keeps moving through all of that. The GLSL arrives in the first
 * message and the time and size rules are the engine's, so the picture is
 * the same; there are no cursor effects here.
 *
 * fieldWorker is the worker's whole program. prismatic-offthread.ts starts
 * it from its own source text, so the worker fetches no script before its
 * first frame; for that, it must use nothing from outside its body. Each
 * canvas has its own context, and the contexts end with the worker when
 * its last field goes, so the context budget the shared engine guards is
 * not spent across navigations.
 */
export type OffThreadMessage =
  | { type: 'init'; vert: string; frag: string; keys: (keyof PrismaticParams)[] }
  | {
      type: 'add';
      id: number;
      canvas: OffscreenCanvas;
      width: number;
      height: number;
      params: PrismaticParams;
      speed: number;
      animate: boolean;
    }
  | { type: 'config'; id: number; params: PrismaticParams; speed: number }
  | { type: 'size'; id: number; width: number; height: number }
  | { type: 'show'; id: number; on: boolean }
  | { type: 'remove'; id: number };

/** `drawn` follows a field's first frame; `failed` means it has no context. */
export type OffThreadReply = { type: 'drawn' | 'failed'; id: number };

export function fieldWorker() {
  type WorkerScope = {
    onmessage: ((event: MessageEvent<OffThreadMessage>) => void) | null;
    postMessage: (message: OffThreadReply) => void;
    requestAnimationFrame?: (callback: (now: number) => void) => number;
  };
  type Program = {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    params: (WebGLUniformLocation | null)[];
  };
  type Field = {
    id: number;
    canvas: OffscreenCanvas;
    gl: WebGLRenderingContext | null;
    program: Program | null;
    params: PrismaticParams;
    speed: number;
    animate: boolean;
    on: boolean;
    start: number;
    drawn: boolean;
  };

  const scope = self as unknown as WorkerScope;
  const fields = new Map<number, Field>();
  let source = { vert: '', frag: '', keys: [] as (keyof PrismaticParams)[] };
  let frameId = 0;

  const nextFrame = (callback: (now: number) => void) =>
    scope.requestAnimationFrame
      ? scope.requestAnimationFrame(callback)
      : (setTimeout(() => callback(performance.now()), 16) as unknown as number);

  const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  /** The engine's program and full-screen triangle, built in one field's context. */
  const build = (gl: WebGLRenderingContext): Program | null => {
    const program = gl.createProgram();
    const vert = compile(gl, gl.VERTEX_SHADER, source.vert);
    const frag = compile(gl, gl.FRAGMENT_SHADER, source.frag);
    if (!program || !vert || !frag) return null;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    // The cursor-effect uniforms keep their zero defaults, which is what
    // the engine sets for a field with no effect engaged.
    return {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      params: source.keys.map((key) =>
        gl.getUniformLocation(program, `u${key.charAt(0).toUpperCase()}${key.slice(1)}`)
      ),
    };
  };

  const connect = (field: Field) => {
    const gl = field.canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    }) as WebGLRenderingContext | null;
    field.gl = gl;
    field.program = gl ? build(gl) : null;
    return field.program !== null;
  };

  const draw = (field: Field, time: number) => {
    const { gl, program, canvas } = field;
    if (!gl || !program) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(program.resolution, canvas.width, canvas.height);
    gl.uniform1f(program.time, time);
    source.keys.forEach((key, i) => gl.uniform1f(program.params[i] ?? null, field.params[key]));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!field.drawn) {
      field.drawn = true;
      scope.postMessage({ type: 'drawn', id: field.id });
    }
  };

  /** A field that does not animate (reduced motion) shows the engine's static frame. */
  const drawStill = (field: Field) => {
    if (!field.animate) draw(field, 10);
  };

  const schedule = () => {
    if (frameId) return;
    for (const field of fields.values()) {
      if (field.animate && field.on && field.program) {
        frameId = nextFrame(tick);
        return;
      }
    }
  };

  const tick = (now: number) => {
    frameId = 0;
    for (const field of fields.values()) {
      if (field.animate && field.on) draw(field, ((now - field.start) / 1000) * field.speed);
    }
    schedule();
  };

  scope.onmessage = ({ data }) => {
    if (data.type === 'init') {
      source = data;
      return;
    }
    if (data.type === 'add') {
      const field: Field = {
        id: data.id,
        canvas: data.canvas,
        gl: null,
        program: null,
        params: data.params,
        speed: data.speed,
        animate: data.animate,
        on: true,
        start: performance.now(),
        drawn: false,
      };
      field.canvas.width = data.width;
      field.canvas.height = data.height;
      // Contexts are lost on GPU resets; draw again once one is restored.
      field.canvas.addEventListener('webglcontextlost', (event) => event.preventDefault());
      field.canvas.addEventListener('webglcontextrestored', () => {
        if (connect(field)) drawStill(field);
        schedule();
      });
      if (!connect(field)) {
        scope.postMessage({ type: 'failed', id: field.id });
        return;
      }
      fields.set(field.id, field);
      drawStill(field);
      schedule();
      return;
    }
    const field = fields.get(data.id);
    if (!field) return;
    if (data.type === 'config') {
      field.params = data.params;
      field.speed = data.speed;
      drawStill(field);
    } else if (data.type === 'size') {
      // Resizing clears the canvas, so a still field draws again at once.
      field.canvas.width = data.width;
      field.canvas.height = data.height;
      drawStill(field);
    } else if (data.type === 'show') {
      field.on = data.on;
      schedule();
    } else {
      field.gl?.getExtension('WEBGL_lose_context')?.loseContext();
      fields.delete(field.id);
    }
  };
}
