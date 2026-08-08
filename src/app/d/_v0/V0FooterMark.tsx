'use client';

import { useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * V0FooterMark — the GT glyph in LIVING metal. The span keeps the PNG mask
 * and the static chrome gradient (the ground truth for no-WebGL, boot
 * failure and reduced motion); a small GL canvas beneath the mask animates
 * the metal itself — the sheet's 132° chrome banding flowing under noise,
 * a specular blade sweeping through every few seconds, brushed grain — in
 * the theme's own palette, read live off data-theme each frame so the
 * toggle re-tempers the metal without a re-mount.
 */

const VERT = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform float dk;

float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float n(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x),
             mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  /* the static sheet gradient's own 132deg axis (GL y-up) */
  float g = dot(uv - 0.5, vec2(0.7431, 0.6691)) + 0.5;

  /* the bands flow: low-frequency noise and a slow swell bend the axis */
  float w = n(vec2(uv.x * 2.5 + t * 0.06, uv.y * 6.0 - t * 0.03)) - 0.5;
  float x = g + 0.22 * w + 0.08 * sin(t * 0.30 + uv.y * 4.0);

  /* chrome banding: two cosine registers at offset phase */
  float m = 0.55
    + 0.30 * cos(6.28318 * x * 1.6)
    + 0.17 * cos(6.28318 * x * 3.4 + 1.7);

  /* the specular blade, crossing the mark about every eleven seconds */
  float blade = 1.0 - abs((fract(t * 0.09) * 1.8 - 0.4) - g) * 6.0;
  m += 0.55 * pow(max(blade, 0.0), 3.0);

  /* brushed grain, stretched along the draw direction */
  m += (n(vec2(uv.x * 36.0, uv.y * 150.0)) - 0.5) * 0.06;
  m = clamp(m, 0.0, 1.0);

  /* the same tempers as the static ground: darker steel on the light
     sheet, bright chrome on the dark one */
  vec3 lo = mix(vec3(0.20, 0.21, 0.24), vec3(0.35, 0.37, 0.41), dk);
  vec3 hi = mix(vec3(0.93, 0.94, 0.95), vec3(1.0, 1.0, 1.0), dk);
  gl_FragColor = vec4(mix(lo, hi, m), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
  return sh;
}

export default function V0FooterMark() {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      const canvas = host?.querySelector('canvas');
      if (!host || !canvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
      if (!gl) return;

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (!vs || !fs || !prog) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);

      const uR = gl.getUniformLocation(prog, 'r');
      const uT = gl.getUniformLocation(prog, 't');
      const uDk = gl.getUniformLocation(prog, 'dk');
      gl.uniform2f(uR, canvas.width, canvas.height);

      /* only spend frames while the footer is actually on screen */
      let live = false;
      const io = new IntersectionObserver(([entry]) => {
        live = Boolean(entry?.isIntersecting);
      });
      io.observe(host);

      const render = (time: number) => {
        if (!live) return;
        gl.uniform1f(uT, time);
        gl.uniform1f(uDk, document.documentElement.dataset.theme === 'dark' ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      gsap.ticker.add(render);

      return () => {
        gsap.ticker.remove(render);
        io.disconnect();
      };
    },
    { scope: root }
  );

  return (
    <span className='v0-foot-gt-seat'>
      {/* the light theme's contour: a dilated dark silhouette behind the
          chrome, drawn by v0-footer.css — dark theme hides it */}
      <i aria-hidden className='v0-foot-gt-line' />
    <span aria-label='General Translation' className='v0-foot-gt' ref={root} role='img'>
      <canvas aria-hidden />
    </span>
    </span>
  );
}
