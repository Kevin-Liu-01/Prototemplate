#!/usr/bin/env node
/* oxlint-disable no-console -- a build script reporting to stdout. */
/**
 * Cuts the deck's mood pictures of writing from their source scans: the
 * two-tone 1600 by 900 pairs under deck/shots that the mood slides show.
 *
 * Usage: node scripts/mood-pictures.mjs <sources dir> [name ...]
 *
 * The sources are large scans and photographs that are not committed;
 * each recipe names its file and where it came from. For every recipe
 * the script crops a 16:9 box of the source in source px (a box may
 * reach past the source, and the padding is paper for a page that is
 * inverted, black otherwise), resizes it to the 800 by 450 cell grid,
 * takes the gray, blurs, sets the levels (an autocontrast stretch at a
 * half-percent cutoff, then the black and white points and a gamma
 * curve), inverts a page so its ink is the lit tone, and prints the
 * tone through the deck's 8 by 8 Bayer screen (the one
 * scripts/build-speed-marks.mjs uses): a cell is lit when its tone is
 * over the screen's threshold. Each lit cell is a 2 by 2 px square in
 * the 1600 by 900 file, lit cells white on black in `mood-<name>.jpg`
 * (the dark file) and the inverse in `mood-<name>-light.jpg`, saved at
 * JPEG quality 95 so every cell keeps its side of the threshold and
 * scripts/build-deck.mjs inlines the pair as two-color PNGs. A `keep`
 * box names the part of the source that is the subject: the rest is
 * filled by tiling the kept region's edge strip outward (its values held
 * near the strip's median, so a speck does not tile into a dotted line),
 * mirrored copy by copy, sideways first and then up and down, so a column rule, a facing
 * column or a page number beside the subject becomes paper with the same
 * grain and no seam. A `subject` crop
 * finds the object on a light studio ground (a pixel is ground when it
 * is brighter than `bright` and less saturated than `saturation`), fits
 * its height to `fillHeight` of the frame at `centreX`, `centreY`, and
 * darkens the ground to black through a feathered mask. The pixel work
 * runs in python3 with Pillow through child_process, as
 * scripts/mood-cells.mjs does.
 *
 * The recipes keep the picture's subject clear of the mood plate, which
 * sits lower right on the slide from about x 851 to 1463 and from about
 * y 643 down (cells 425 to 731, 321 down).
 */

import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'deck/shots');

const PICTURES = [
  {
    // The Metropolitan Museum of Art 1988.433.1, a Sumerian administrative
    // account of malt and barley groats, Jemdet Nasr period, about 3100 to
    // 2900 BC; Open Access photograph DP293245, public domain (CC0).
    name: 'tablet',
    source: 'met-327385-DP293245.jpg',
    crop: { kind: 'subject', bright: 150, saturation: 0.12, feather: 2, fillHeight: 0.62, centreX: 0.27, centreY: 0.47 },
    blur: 0.8,
    black: 60,
    white: 255,
    gamma: 1.8,
    invert: false,
  },
  {
    // The Oxford English Dictionary, volume III (D and E), Oxford, 1897,
    // the page with the entry for dictionary; the Internet Archive's scan
    // oxforddictionaryv3p1unse_a5h6, leaf 343, public domain. The kept
    // region is the middle column alone, between the rules at 1046 and
    // 1950 and below the page number; the 16 px gutter strips beside it
    // and the margin strip above it are the paper that fills the other
    // columns' place and the head of the page.
    name: 'dictionary',
    source: 'dictionary.jpg',
    crop: { kind: 'box', box: [1000, 130, 2600, 1030], keep: [1052, 250, 1935, 4271], keepStrip: 16 },
    blur: 0.5,
    black: 90,
    white: 235,
    gamma: 1,
    invert: true,
  },
  {
    // Samuel Johnson, A Dictionary of the English Language, London, 1755,
    // the grammar's page on the letter O; the Wellcome Collection's scan
    // b30451541_0001 on the Internet Archive, leaf 51, public domain.
    name: 'johnson',
    source: 'johnson.jpg',
    crop: { kind: 'box', box: [230, 3540, 1830, 4440] },
    blur: 0.5,
    black: 60,
    white: 230,
    gamma: 0.9,
    invert: true,
  },
  {
    // MS Gen 1671, University of Glasgow Library, Archives and Special
    // Collections: a marginal gloss of about 1500, from the library's
    // April 2007 Book of the Month on Johnson's Dictionary; the library's
    // 384 by 350 image is the only copy online.
    name: 'gloss',
    source: 'gloss.jpg',
    crop: { kind: 'box', box: [0, 0, 384, 216] },
    blur: 0.4,
    black: 60,
    white: 170,
    gamma: 1,
    invert: true,
  },
];

const CUT_PY = `
import json, sys
from PIL import Image, ImageChops, ImageFilter, ImageOps

recipes = json.loads(sys.argv[1])
src_dir, out_dir = sys.argv[2], sys.argv[3]
W, H, CW, CH = 1600, 900, 800, 450
CUTOFF = 0.005
BAYER = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
]


def fill(image, pad):
    return pad if len(image.getbands()) == 1 else tuple([pad] * len(image.getbands()))


def steadied(edge, give=8):
    # the strip with its values held within give of its median, so a speck
    # or the foot of a letter caught in the margin does not tile into a
    # dotted line while the paper's grain stays
    histogram = edge.convert('L').histogram()
    total, seen, median = sum(histogram), 0, 0
    while median < 255 and seen + histogram[median] < total / 2:
        seen += histogram[median]
        median += 1
    lo, hi = max(0, median - give), min(255, median + give)
    return edge.point(lambda v: min(max(v, lo), hi))


def keep_region(source, keep, strip, pad):
    left, top, right, bottom = keep
    canvas = Image.new(source.mode, source.size, fill(source, pad))
    canvas.paste(source.crop((left, top, right, bottom)), (left, top))
    sides = [
        (left > 0, steadied(source.crop((left, top, left + strip, bottom))), -1, left, Image.FLIP_LEFT_RIGHT),
        (right < source.width, steadied(source.crop((right - strip, top, right, bottom))), 1, right - strip, Image.FLIP_LEFT_RIGHT),
    ]
    for present, edge, step, start, flip in sides:
        if not present:
            continue
        x, mirrored = start, True
        while -strip < x + step * strip < source.width:
            x += step * strip
            canvas.paste(edge.transpose(flip) if mirrored else edge, (x, top))
            mirrored = not mirrored
    # then up and down, the filled band's own top and bottom strips across the whole width
    bands = [
        (top > 0, steadied(canvas.crop((0, top, source.width, top + strip))), -1, top),
        (bottom < source.height, steadied(canvas.crop((0, bottom - strip, source.width, bottom))), 1, bottom - strip),
    ]
    for present, edge, step, start in bands:
        if not present:
            continue
        y, mirrored = start, True
        while -strip < y + step * strip < source.height:
            y += step * strip
            canvas.paste(edge.transpose(Image.FLIP_TOP_BOTTOM) if mirrored else edge, (0, y))
            mirrored = not mirrored
    return canvas


def padded_crop(image, box, pad):
    left, top, right, bottom = box
    region = image.crop(box)
    if pad:
        inside = (max(left, 0), max(top, 0), min(right, image.width), min(bottom, image.height))
        canvas = Image.new(image.mode, region.size, fill(image, pad))
        if inside[0] < inside[2] and inside[1] < inside[3]:
            canvas.paste(image.crop(inside), (inside[0] - left, inside[1] - top))
        region = canvas
    return region


def levels(image, black, white, gamma):
    histogram = image.histogram()
    total = sum(histogram)
    lo, seen = 0, 0
    while lo < 255 and seen + histogram[lo] <= total * CUTOFF:
        seen += histogram[lo]
        lo += 1
    hi, seen = 255, 0
    while hi > lo and seen + histogram[hi] <= total * CUTOFF:
        seen += histogram[hi]
        hi -= 1
    span = max(1, hi - lo)
    table = []
    for v in range(256):
        stretched = min(255.0, max(0.0, (v - lo) * 255.0 / span))
        t = min(1.0, max(0.0, (stretched - black) / (white - black))) ** gamma
        table.append(round(t * 255))
    return image.point(table)


def ground_mask(source, bright, saturation):
    r, g, b = [c.load() for c in source.split()]
    mask = Image.new('L', source.size, 0)
    px = mask.load()
    w, h = source.size
    for y in range(h):
        for x in range(w):
            mx = max(r[x, y], g[x, y], b[x, y])
            mn = min(r[x, y], g[x, y], b[x, y])
            if mx > bright and (mx - mn) <= saturation * mx:
                px[x, y] = 255
    return mask


for recipe in recipes:
    source = Image.open(f"{src_dir}/{recipe['source']}").convert('RGB')
    crop = recipe['crop']
    pad = 255 if recipe['invert'] else 0
    subject = None
    if crop['kind'] == 'box':
        if 'keep' in crop:
            source = keep_region(source, crop['keep'], crop['keepStrip'], pad)
        box = tuple(crop['box'])
    else:
        small = source.resize((source.width // 8, source.height // 8), Image.BOX)
        ground = ground_mask(small, crop['bright'], crop['saturation']).resize(source.size, Image.NEAREST)
        subject_mask = ImageChops.invert(ground)
        left, top, right, bottom = subject_mask.getbbox()
        scale = crop['fillHeight'] * CH / (bottom - top)
        cx, cy = (left + right) / 2, (top + bottom) / 2
        box_left = cx - crop['centreX'] * CW / scale
        box_top = cy - crop['centreY'] * CH / scale
        box = (round(box_left), round(box_top), round(box_left + CW / scale), round(box_top + CH / scale))
        subject = padded_crop(subject_mask, box, 0).resize((CW, CH), Image.LANCZOS)
    region = padded_crop(source, box, pad).resize((CW, CH), Image.LANCZOS)
    tone = region.convert('L')
    if subject is not None:
        ground = ImageChops.invert(subject.point(lambda v: 255 if v > 127 else 0))
        if crop['feather'] > 0:
            ground = ground.filter(ImageFilter.GaussianBlur(crop['feather']))
        tone = ImageChops.multiply(tone, ImageChops.invert(ground))
    if recipe['blur'] > 0:
        tone = tone.filter(ImageFilter.GaussianBlur(recipe['blur']))
    tone = levels(tone, recipe['black'], recipe['white'], recipe['gamma'])
    if recipe['invert']:
        tone = ImageChops.invert(tone)
    cells = Image.new('L', (CW, CH), 0)
    tp, cp = tone.load(), cells.load()
    lit = 0
    for y in range(CH):
        row = BAYER[y % 8]
        for x in range(CW):
            if tp[x, y] / 255 > (row[x % 8] + 0.5) / 64:
                cp[x, y] = 255
                lit += 1
    dark = cells.resize((W, H), Image.NEAREST)
    dark.save(f"{out_dir}/mood-{recipe['name']}.jpg", 'JPEG', quality=95, optimize=True)
    ImageChops.invert(dark).save(f"{out_dir}/mood-{recipe['name']}-light.jpg", 'JPEG', quality=95, optimize=True)
    print(json.dumps({'name': recipe['name'], 'box': list(box), 'lit': lit / (CW * CH)}))
`;

const [sourcesDir, ...names] = process.argv.slice(2);
if (!sourcesDir) {
  console.error('usage: node scripts/mood-pictures.mjs <sources dir> [name ...]');
  process.exit(2);
}
const chosen = names.length ? PICTURES.filter((p) => names.includes(p.name)) : PICTURES;
const run = spawnSync('python3', ['-c', CUT_PY, JSON.stringify(chosen), resolve(sourcesDir), outDir], {
  maxBuffer: 1 << 24,
});
if (run.status !== 0) {
  throw new Error(`python3 with Pillow is required: ${run.stderr.toString()}`);
}
for (const line of run.stdout.toString().trim().split('\n')) {
  const { name, box, lit } = JSON.parse(line);
  const dark = join(outDir, `mood-${name}.jpg`);
  console.log(
    `${name}: source box ${box.join(', ')}, ${(lit * 100).toFixed(1)}% lit, ${statSync(dark).size} bytes -> ${dark} and its light twin`
  );
}
