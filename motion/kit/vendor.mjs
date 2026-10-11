#!/usr/bin/env node
// GT motion kit: writes the kit files the repository does not track, so a fresh
// clone renders the films the way the published cuts were rendered.
//
// Two kinds of file, each checked against its SHA-256 before it is written:
//   - The vendored libraries the compositions load by relative path (renders
//     never touch the network): GSAP 3.15.0 and six of its plugins, lottie-web
//     5.13.0, fflate 0.8.3 and Paper Shaders 0.0.78. Each file is the npm
//     package's own file, byte for byte. It is copied from node_modules when the
//     installed package has the pinned version (gsap is a dependency of this
//     repository), and otherwise read in memory from the package's tarball on
//     the npm registry, the one step that needs the network.
//   - The twins: every entry of picture-sources.json (beside this file) with a
//     `twin`, a file this repository already tracks byte for byte elsewhere
//     (public/marks, public/fonts, public/logos, public/brand, public/static/blogs,
//     deck/shots), copied to the motion path the entry names. An entry marked
//     `tracked` is in the repository under motion/ itself.
// A file already in place with the pinned hash is left alone. A file in place
// with another hash is reported and kept, unless --force. Pictures and fonts
// without a twin are listed in picture-sources.json with their source and
// licence and are fetched by hand.
//
// Usage: node motion/kit/vendor.mjs [--check] [--force]
//   --check  write nothing; exit 1 when a file is missing or differs
//   --force  overwrite a file in place whose hash differs
// Requires: Node 18 or later (fetch, zlib); the network only for a package that
// node_modules does not hold at the pinned version.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const KIT = dirname(fileURLToPath(import.meta.url));
const MOTION = dirname(KIT);
const ROOT = dirname(MOTION);
const CHECK = process.argv.includes('--check');
const FORCE = process.argv.includes('--force');

/** Each package: its files as [kit path, path inside the package, sha256]. */
const LIBS = [
  {
    name: 'gsap',
    version: '3.15.0',
    license: "GSAP Standard 'no charge' license",
    files: [
      ['gsap.min.js', 'dist/gsap.min.js', '92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb'],
      ['CustomEase.min.js', 'dist/CustomEase.min.js', '466e426a5c60c21c94b15a30a3dffacac9bb39ce8f4e07d071d7d4bb1be43390'],
      ['DrawSVGPlugin.min.js', 'dist/DrawSVGPlugin.min.js', 'beb19529f54c1212f1f5117d027be01afda2f363a4926d32aa979bc11140edc1'],
      ['MorphSVGPlugin.min.js', 'dist/MorphSVGPlugin.min.js', '19c891a412240d8521b13330813d9b551ea5b0f707907c365ffecaf1dfa0f5cf'],
      ['SplitText.min.js', 'dist/SplitText.min.js', '419f7027a5f086a12cb7988736d8fdd3a6ed2200229661de25b6628ca7ced344'],
      ['Flip.min.js', 'dist/Flip.min.js', 'cbe3ca726350f8d230da38a14ce2384e7772e05a45cee6144dd7fe6dde868c2f'],
      ['MotionPathPlugin.min.js', 'dist/MotionPathPlugin.min.js', 'ace44a07c6c179f5347d9b46a152d468e4c9f272ee0d68bf0354e00d60000693'],
    ],
  },
  {
    name: 'lottie-web',
    version: '5.13.0',
    license: "MIT",
    files: [
      ['lottie.min.js', 'build/player/lottie.min.js', '2eb762973aec914d981f426123040bfac9d26217239605e225ddc7cee17618ac'],
    ],
  },
  {
    name: 'fflate',
    version: '0.8.3',
    license: "MIT",
    files: [
      ['fflate.min.js', 'umd/index.js', '462ef8041fc970e3615a20a9dd2b2e3047a073b2da729ef4f02b634bba8b7b83'],
    ],
  },
  {
    name: '@paper-design/shaders',
    version: '0.0.78',
    license: "Apache-2.0",
    files: [
      ['paper-shaders/LICENSE', 'LICENSE', 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4'],
      ['paper-shaders/empty-pixel.js', 'dist/empty-pixel.js', 'c558d948eb72743ca1d7877a78b831ff014c3671e9256e2af03bc9d631368320'],
      ['paper-shaders/get-shader-color-from-string.js', 'dist/get-shader-color-from-string.js', '5b4a27c2ff3380adebe8b8957475866d05c6f8b442309d89f466f735bce33aed'],
      ['paper-shaders/get-shader-noise-texture.js', 'dist/get-shader-noise-texture.js', '54346e280909373cf4d519fb779f5cd6b22be4047b8eb78b7d5bdc9ec7987492'],
      ['paper-shaders/index.js', 'dist/index.js', '75463a3519906f9d054b63edc039a0b144420670f69a475d94af8efd5a84ed88'],
      ['paper-shaders/shader-color-spaces.js', 'dist/shader-color-spaces.js', '5fc24eba47d3cb41fffcf2d96b8fb3bd0e05df8b0fe30c84d2e4d97c55b6a648'],
      ['paper-shaders/shader-mount.js', 'dist/shader-mount.js', 'a7eb58aa60f2d59b669e031af01e1f9ee0974a7805b38ff14704438462c461b1'],
      ['paper-shaders/shader-sizing.js', 'dist/shader-sizing.js', 'db0eb176c9a66c03653770a542adcf4cf8efc07b0929d9e257f49c05d82013fe'],
      ['paper-shaders/shader-utils.js', 'dist/shader-utils.js', '26ba187ff4b02715bd98d8ff409c508efcc3881a1f45ceeb08d00b71b145eb2e'],
      ['paper-shaders/shaders/color-panels.js', 'dist/shaders/color-panels.js', '315399ea6ad8919cc59551eced981b6ff0883adbe55c0945c070ade38e14aa91'],
      ['paper-shaders/shaders/dithering.js', 'dist/shaders/dithering.js', 'affcb28b90283e736d2ce347fb562ce180cc9a66ad78db56b2fa3fea537943cc'],
      ['paper-shaders/shaders/dot-grid.js', 'dist/shaders/dot-grid.js', '83b337e772dbe244af72f269465f0515e2d59d7b0b7bd2866902547a782c2930'],
      ['paper-shaders/shaders/dot-orbit.js', 'dist/shaders/dot-orbit.js', '94be75d3759239d0c0631bc9fadf5e3452df0d7b8cdc9b3311778295fe9866ca'],
      ['paper-shaders/shaders/fluted-glass.js', 'dist/shaders/fluted-glass.js', 'd24d9c28febf9fc126b81a1e3d3a3faca7e1f2e20f17fcfad6fabf775f777fa8'],
      ['paper-shaders/shaders/gem-smoke.js', 'dist/shaders/gem-smoke.js', '91ae0321e6c1e63ce770f04e86f4dc6824a1538d5baacfa56a904084c905ee0e'],
      ['paper-shaders/shaders/god-rays.js', 'dist/shaders/god-rays.js', '861cd1325a9b438d8932228d537325d00ace5a4b3b91bf2f54e78ffb5c3128c3'],
      ['paper-shaders/shaders/grain-gradient.js', 'dist/shaders/grain-gradient.js', 'd4732a55df32bc49e188dd621ebcc8b03df2782caa5753c0139aabd0e5b0edf5'],
      ['paper-shaders/shaders/halftone-cmyk.js', 'dist/shaders/halftone-cmyk.js', '1f87f5cbbe77cfb27d8d858a009b403a5dbc2b94a355401f0c6addf379dbc386'],
      ['paper-shaders/shaders/halftone-dots.js', 'dist/shaders/halftone-dots.js', '52cf2cf58d6a5347e914bd5bbd6cdf9b363ca7d1e066a2d44ad4746e2a963e02'],
      ['paper-shaders/shaders/heatmap.js', 'dist/shaders/heatmap.js', '0598a6f56c757901830fbe583d5692ab2bbb9715f6c18f2caddfc85468c33c92'],
      ['paper-shaders/shaders/image-dithering.js', 'dist/shaders/image-dithering.js', 'c469583c807aeea5b7204ddd5a2e94b3da3d7eea605dd65643c18c8aa269e055'],
      ['paper-shaders/shaders/liquid-metal.js', 'dist/shaders/liquid-metal.js', '2bd894ec659cc42560fd69c1125823ee52a1f43bb9a702f52ea739b4a1d70063'],
      ['paper-shaders/shaders/mesh-gradient.js', 'dist/shaders/mesh-gradient.js', '474a8232726f5d925a86878af6f73c2de153eb6b0f482be88e5fe7d9f66461e1'],
      ['paper-shaders/shaders/metaballs.js', 'dist/shaders/metaballs.js', '5bc75a22008915252aa404940a9d1ae66556a26c4a4f4e7179cb06c10c840abf'],
      ['paper-shaders/shaders/neuro-noise.js', 'dist/shaders/neuro-noise.js', '71545b8ddaa9ac2ed1854673890a1478829e28b2be724254405617d22e79ab86'],
      ['paper-shaders/shaders/paper-texture.js', 'dist/shaders/paper-texture.js', 'b2fa3e8281bf85f9505880056d0cec947454604f4c780e11257ffec416d7e8ef'],
      ['paper-shaders/shaders/perlin-noise.js', 'dist/shaders/perlin-noise.js', '5ff2cddf0402c7861708bac52451bd091d1c94b18cb83450b911a73597ee4a4a'],
      ['paper-shaders/shaders/pulsing-border.js', 'dist/shaders/pulsing-border.js', '9713e1efa8bf3f1adc4420109b0ea43571948f364d1c90160807bb289b5ca42b'],
      ['paper-shaders/shaders/simplex-noise.js', 'dist/shaders/simplex-noise.js', '8f98cc23de724b25faf2c203a374a9f941f7cdb60f9037d0f977ed4829abd0d2'],
      ['paper-shaders/shaders/smoke-ring.js', 'dist/shaders/smoke-ring.js', 'fe0c6a3c2b842e909ab79965fbca272a70fce7b3b23c12d278f36bb101cfc92c'],
      ['paper-shaders/shaders/spiral.js', 'dist/shaders/spiral.js', 'e4836468d182bca65d0ccc43264bf99aaed8e9f10042b438c8c1ca33a230b173'],
      ['paper-shaders/shaders/static-mesh-gradient.js', 'dist/shaders/static-mesh-gradient.js', '3f9e12710fb91ecfa3000477f78c34fadb46532fde4aa5a60cb2896162de4ec4'],
      ['paper-shaders/shaders/static-radial-gradient.js', 'dist/shaders/static-radial-gradient.js', '3ec9892438405a57edbc51cdfcf4f439ef4989aeee9fb9b3094966e018f3e660'],
      ['paper-shaders/shaders/swirl.js', 'dist/shaders/swirl.js', '5e638f9d5411833757dd13aeeae7aaed8b969b3078216e5422e4b8a40aa2cd36'],
      ['paper-shaders/shaders/voronoi.js', 'dist/shaders/voronoi.js', '90ffd4604563f81e1803e63291ac8524b0c37f5d8a64e2fe484c6d3c978dc185'],
      ['paper-shaders/shaders/warp.js', 'dist/shaders/warp.js', 'e4628b715d9c72b147ada599dbb55c10e4db78f2e1b8f7275d0e03973202a74b'],
      ['paper-shaders/shaders/water.js', 'dist/shaders/water.js', '5d13d2f4d4ef0182cc390789a9cef847ee307fcb7ff3598e94dac87682e0f7ac'],
      ['paper-shaders/shaders/waves.js', 'dist/shaders/waves.js', '6d50a13378a2a598297b9acf5a6e35cb02d5f274c4482853191dc7af38903857'],
      ['paper-shaders/types.js', 'dist/types.js', '1be25523bc1d0b7406f69d344e5d70a4f259873faa274236a04002ba2b04b532'],
      ['paper-shaders/vertex-shader.js', 'dist/vertex-shader.js', 'cd9856f2e071e0c18794dd9c5a1663c11d72cbc68b0403b555d190f412b3e8db'],
    ],
  },
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const rel = (abs) => abs.slice(ROOT.length + 1);
const tally = { written: 0, kept: 0, missing: 0, differ: 0, failed: 0 };
const files = (n) => `${n} file${n === 1 ? '' : 's'}`;

/** Writes one file when it is not already in place with its hash; returns false on a refusal. */
function place(dest, bytes, want, from) {
  const got = sha256(bytes);
  if (got !== want) {
    console.error(`vendor: ${from} gives ${rel(dest)} the hash ${got.slice(0, 12)}, not ${want.slice(0, 12)}`);
    tally.failed += 1;
    return false;
  }
  if (existsSync(dest)) {
    const have = sha256(readFileSync(dest));
    if (have === want) {
      tally.kept += 1;
      return true;
    }
    if (!FORCE) {
      console.error(`vendor: ${rel(dest)} is in place with another hash (${have.slice(0, 12)}); kept (use --force to replace it)`);
      tally.differ += 1;
      return false;
    }
  }
  if (CHECK) {
    console.log(`vendor: missing ${rel(dest)}`);
    tally.missing += 1;
    return true;
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, bytes);
  tally.written += 1;
  return true;
}

/** The files of a tar archive, by path, from its 512-byte headers (ustar, with pax and GNU long names). */
function untar(buffer) {
  const files = new Map();
  let at = 0;
  let longName = null;
  while (at + 512 <= buffer.length) {
    const header = buffer.subarray(at, at + 512);
    if (header.every((b) => b === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '');
    const size = parseInt(field(124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156] || 48);
    const prefix = field(345, 155);
    const name = longName ?? (prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
    const body = buffer.subarray(at + 512, at + 512 + size);
    longName = null;
    if (type === 'x') {
      const path = /\d+ path=([^\n]*)\n/.exec(body.toString('utf8'));
      if (path) longName = path[1];
    } else if (type === 'L') {
      longName = body.toString('utf8').replace(/\0.*$/s, '');
    } else if (type === '0' || type === '\0') {
      files.set(name, Buffer.from(body));
    }
    at += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

/** A package's files: from node_modules at the pinned version, or from its registry tarball. */
async function packageFiles(lib) {
  const dir = join(ROOT, 'node_modules', lib.name);
  const manifest = join(dir, 'package.json');
  if (existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).version === lib.version) {
    return { from: `node_modules/${lib.name}`, read: (path) => readFileSync(join(dir, path)) };
  }
  const base = lib.name.split('/').pop();
  const url = `https://registry.npmjs.org/${lib.name}/-/${base}-${lib.version}.tgz`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  const files = untar(gunzipSync(Buffer.from(await response.arrayBuffer())));
  return {
    from: url,
    read: (path) => {
      const bytes = files.get(`package/${path}`);
      if (!bytes) throw new Error(`${url} has no package/${path}`);
      return bytes;
    },
  };
}

let ok = true;
for (const lib of LIBS) {
  const wanted = lib.files.filter(([dest, , want]) => {
    const abs = join(KIT, dest);
    return !(existsSync(abs) && sha256(readFileSync(abs)) === want);
  });
  tally.kept += lib.files.length - wanted.length;
  if (wanted.length === 0) {
    console.log(`vendor: ${lib.name} ${lib.version} (${lib.license}): ${files(lib.files.length)} in place`);
    continue;
  }
  if (CHECK) {
    for (const [dest] of wanted) {
      const abs = join(KIT, dest);
      if (existsSync(abs)) {
        console.error(`vendor: ${rel(abs)} is in place with another hash`);
        tally.differ += 1;
      } else {
        console.log(`vendor: missing ${rel(abs)}`);
        tally.missing += 1;
      }
    }
    continue;
  }
  let source;
  try {
    source = await packageFiles(lib);
  } catch (error) {
    console.error(`vendor: ${lib.name} ${lib.version}: ${error.message}`);
    tally.failed += wanted.length;
    ok = false;
    continue;
  }
  for (const [dest, path, want] of wanted) ok = place(join(KIT, dest), source.read(path), want, source.from) && ok;
  console.log(`vendor: ${lib.name} ${lib.version} (${lib.license}): ${wanted.length} of ${files(lib.files.length)} from ${source.from}`);
}

const manifest = JSON.parse(readFileSync(join(KIT, 'picture-sources.json'), 'utf8'));
const twins = manifest.files.filter((entry) => entry.twin);
for (const entry of twins) {
  const source = join(ROOT, entry.twin);
  if (!existsSync(source)) {
    console.error(`vendor: the twin ${entry.twin} of ${entry.path} is not in this checkout`);
    tally.failed += 1;
    ok = false;
    continue;
  }
  ok = place(join(MOTION, entry.path), readFileSync(source), entry.sha256, entry.twin) && ok;
}
const local = manifest.files.filter((entry) => !entry.twin && !entry.tracked).length;
console.log(`vendor: ${twins.length} twins from tracked copies; ${local} pictures and fonts have no twin and stay local (picture-sources.json gives each one's source and licence)`);
console.log(
  `vendor: ${CHECK ? 'checked' : 'done'}: ${tally.written} written, ${tally.kept} in place, ${tally.missing} missing, ${tally.differ} differ, ${tally.failed} failed`
);
process.exit(ok && tally.differ === 0 && tally.failed === 0 && !(CHECK && tally.missing > 0) ? 0 : 1);
