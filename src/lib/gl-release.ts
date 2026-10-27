/**
 * Frees a shared WebGL engine once the last field drawing through it has
 * gone. The studio, horizon and prismatic engines each draw every field of
 * their kind through one context. A field's destroy() calls `idle()`, and
 * when no field has registered again within RELEASE_MS, `release` runs: the
 * engine drops its context and loses it on purpose (loseGl), which frees it
 * at once instead of at garbage collection. The next field builds a new
 * context. The delay keeps a route change or a plate swap from rebuilding
 * the context it is about to use again.
 */
const RELEASE_MS = 1000;

export type GlRelease = {
  /** the last field has gone: release the engine unless one registers within RELEASE_MS */
  idle: () => void;
};

export function glRelease(release: () => void, inUse: () => boolean): GlRelease {
  let timer = 0;
  return {
    idle() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = 0;
        if (!inUse()) release();
      }, RELEASE_MS);
    },
  };
}

/** Loses a context on purpose, which frees its GPU memory and its place in the browser's context budget now. */
export function loseGl(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  gl.getExtension('WEBGL_lose_context')?.loseContext();
}
