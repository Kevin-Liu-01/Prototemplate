#!/usr/bin/env python3
"""Cuts artifact pictures' tone grids to the house standard.

The standard is the Blue Marble's: standard.json beside this file holds the
fixed settings (no blur, gamma 1.2, autocontrast at 0.5 percent a tail), the
tone the solver aims for and the windows the lint holds every grid to. Per
picture only the crop, the channel, the polarity and the kind are chosen;
the black and white points are solved:

- a scene lands on the Blue Marble's mean tone and contrast over the region
  the picture is shown in;
- marks (writing, engraving, lines on a plain ground) keep the ground black
  and bring the marks up to white.

Reads the recipe JSON mood-tone.mjs writes on stdin and prints one manifest
entry per picture as a JSON line.
"""

import json
import math
import os
import sys
import hashlib
from io import BytesIO

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps, ImageStat

FILE_WIDTH = 1600
FILE_HEIGHT = 900

BAYER_8 = (
    (0, 32, 8, 40, 2, 34, 10, 42),
    (48, 16, 56, 24, 50, 18, 58, 26),
    (12, 44, 4, 36, 14, 46, 6, 38),
    (60, 28, 52, 20, 62, 30, 54, 22),
    (3, 35, 11, 43, 1, 33, 9, 41),
    (51, 19, 59, 27, 49, 17, 57, 25),
    (15, 47, 7, 39, 13, 45, 5, 37),
    (63, 31, 55, 23, 61, 29, 53, 21),
)


def binary(image, over):
    """255 where the 8-bit image is over `over`, else 0."""
    return image.point(lambda v: 255 if v > over else 0)


def ground_mask(rgb, bright, saturation):
    """255 where max(R, G, B) is over `bright` and saturation under `saturation`."""
    r, g, b = rgb.split()
    high = ImageChops.lighter(ImageChops.lighter(r, g), b)
    low = ImageChops.darker(ImageChops.darker(r, g), b)
    spread = ImageChops.subtract(high, low)
    allowed = high.point(lambda v: int(v * saturation))
    neutral = binary(ImageChops.subtract(allowed, spread), 0)
    return ImageChops.multiply(binary(high, bright), neutral)


def disc_extent(rgb, over):
    """The lit disc's bounding box on a black ground: any channel over `over`."""
    r, g, b = rgb.split()
    high = ImageChops.lighter(ImageChops.lighter(r, g), b)
    return binary(high, over).getbbox()


def crop_box(source, crop, width, height):
    """The source box, in source px, that `crop` maps onto the grid."""
    kind = crop['kind']
    if kind == 'box':
        factor = max(source.size) / crop['onLongSide']
        return tuple(round(v * factor) for v in crop['box'])
    if kind == 'disc':
        left, top, right, bottom = disc_extent(source, crop['limbOver'])
        # The right limb is the night side, so the radius comes from the
        # top and bottom limbs and the centre from the left limb.
        radius = (bottom - top) / 2
        cx = left + radius
        cy = (top + bottom) / 2
        scale = crop['radius'] / radius
        tx, ty = crop['centre']
        return (
            round(cx - tx / scale),
            round(cy - ty / scale),
            round(cx + (width - tx) / scale),
            round(cy + (height - ty) / scale),
        )
    if kind == 'subject':
        mask = crop['mask']
        subject = ImageChops.invert(
            ground_mask(source, mask['bright'], mask['saturation'])
        )
        left, top, right, bottom = subject.getbbox()
        scale = crop['fillHeight'] * height / (bottom - top)
        cx = (left + right) / 2
        cy = (top + bottom) / 2
        box_left = cx - crop['centreX'] * width / scale
        box_top = cy - crop['centreY'] * height / scale
        return (
            round(box_left),
            round(box_top),
            round(box_left + width / scale),
            round(box_top + height / scale),
        )
    raise ValueError(f'unknown crop kind {kind}')


def fit(image, box, width, height, resample, pad=0):
    """Crops `box` and fits it to the grid, trimming the long side centred.
    Past the source the crop is `pad`, so the padding is unlit in the grid."""
    region = image.crop(box)
    if pad:
        left, top, right, bottom = box
        inside = (max(left, 0), max(top, 0), min(right, image.width), min(bottom, image.height))
        region = Image.new(image.mode, region.size, (pad,) * len(image.getbands()))
        region.paste(image.crop(inside), (inside[0] - left, inside[1] - top))
    return ImageOps.fit(region, (width, height), resample)


def encode_jpeg(tone, quality):
    out = BytesIO()
    tone.save(out, 'JPEG', quality=quality, optimize=True)
    return out.getvalue()


def fit_limb(tone, over):
    """A least squares circle through the first lit cell of each of the
    middle 80 percent of the disc's rows (the left limb)."""
    width, height = tone.size
    lit = binary(tone, over)
    _, top, _, bottom = lit.getbbox()
    rows = lit.tobytes()
    inset = (bottom - top) * 0.1
    points = []
    for y in range(int(top + inset), int(bottom - inset)):
        x = rows.find(b'\xff', y * width, (y + 1) * width)
        if x >= 0:
            points.append((x - y * width, y + 0.5))
    # Kasa fit: x^2 + y^2 + D x + E y + F = 0 solved by normal equations.
    sxx = syy = sxy = sx = sy = sxz = syz = sz = 0.0
    n = len(points)
    for x, y in points:
        z = x * x + y * y
        sxx += x * x
        syy += y * y
        sxy += x * y
        sx += x
        sy += y
        sxz += x * z
        syz += y * z
        sz += z
    matrix = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]]
    rhs = [-sxz, -syz, -sz]
    d, e, f = solve3(matrix, rhs)
    cx = -d / 2
    cy = -e / 2
    r = math.sqrt(max(0.0, cx * cx + cy * cy - f))
    return {'cx': cx, 'cy': cy, 'r': r, 'points': n}


def solve3(m, v):
    """Gaussian elimination for a 3 by 3 system."""
    a = [row[:] + [v[i]] for i, row in enumerate(m)]
    for col in range(3):
        pivot = max(range(col, 3), key=lambda i: abs(a[i][col]))
        a[col], a[pivot] = a[pivot], a[col]
        for i in range(3):
            if i != col:
                factor = a[i][col] / a[col][col]
                for j in range(col, 4):
                    a[i][j] -= factor * a[col][j]
    return [a[i][3] / a[i][i] for i in range(3)]


def bayer_threshold(width, height):
    """The 8 by 8 Bayer tile as an 8-bit threshold image: a cell is lit when
    tone / 255 is over (m + 0.5) / 64."""
    tile = Image.new('L', (8, 8))
    tile.putdata(
        [math.floor((BAYER_8[y][x] + 0.5) * 255 / 64) for y in range(8) for x in range(8)]
    )
    out = Image.new('L', (width, height))
    for y in range(0, height, 8):
        for x in range(0, width, 8):
            out.paste(tile, (x, y))
    return out


def dither(tone):
    """The tone screened at 1px cells, 255 for a lit cell."""
    threshold = bayer_threshold(*tone.size)
    return binary(ImageChops.subtract(tone, threshold), 0)



def view_geometry(grid_size, placement, view, disc):
    """Scale and offset that map file space (1600 by 900) onto the view, as
    the field draws the grid."""
    width, height = view['width'], view['height']
    if placement['kind'] == 'cover':
        scale = max(width / FILE_WIDTH, height / FILE_HEIGHT)
        offset_x = (width - FILE_WIDTH * scale) * placement['focusX']
        offset_y = (height - FILE_HEIGHT * scale) * placement['focusY']
    else:
        diameter = view['discDiameter']
        scale = diameter / (2 * disc['r'])
        limb = view['rampStart'] + view['discLimbShare'] * (view['rampEnd'] - view['rampStart'])
        offset_x = limb + diameter / 2 - disc['cx'] * scale
        offset_y = height / 2 - disc['cy'] * scale
    return scale, offset_x, offset_y


def shown(tone, placement, view, disc, subject=None):
    """The grid as drawn at the view size, and the region the standard is
    measured over: right of the ramp, and only the subject when the grid
    holds a disc or a masked object on its ground."""
    width, height = view['width'], view['height']
    scale, offset_x, offset_y = view_geometry(tone.size, placement, view, disc)
    grid_x = tone.size[0] / (FILE_WIDTH * scale)
    grid_y = tone.size[1] / (FILE_HEIGHT * scale)
    sampled = tone.transform(
        (width, height),
        Image.AFFINE,
        (grid_x, 0, -offset_x * grid_x, 0, grid_y, -offset_y * grid_y),
        Image.NEAREST,
        fillcolor=0,
    )
    region = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(region)
    if disc is None:
        draw.rectangle((view['rampEnd'], 0, width - 1, height - 1), fill=255)
    else:
        cx = offset_x + disc['cx'] * scale
        cy = offset_y + disc['cy'] * scale
        r = disc['r'] * scale
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
        if view['rampEnd'] > 0:
            draw.rectangle((0, 0, view['rampEnd'] - 1, height - 1), fill=0)
    if subject is not None:
        mask = subject.transform(
            (width, height),
            Image.AFFINE,
            (grid_x, 0, -offset_x * grid_x, 0, grid_y, -offset_y * grid_y),
            Image.NEAREST,
            fillcolor=0,
        )
        region = ImageChops.multiply(region, binary(mask, 127))
    return sampled, region


def region_histogram(tone, placement, view, disc, subject=None):
    """The 256-bin histogram of the grid over the region it is shown in."""
    sampled, region = shown(tone, placement, view, disc, subject)
    return sampled.histogram(mask=region), sampled, region


def levels_table(black, white, gamma):
    table = []
    for v in range(256):
        t = (v - black) / max(1, white - black)
        table.append(round(min(1.0, max(0.0, t)) ** gamma * 255))
    return table


def autocontrast(image, region_mask, cutoff):
    """Stretches the tone so `cutoff` of each tail clips, over the mask."""
    histogram = image.histogram(mask=region_mask)
    cut = sum(histogram) * cutoff
    lo, seen = 0, 0
    while lo < 255 and seen + histogram[lo] <= cut:
        seen += histogram[lo]
        lo += 1
    hi, seen = 255, 0
    while hi > lo and seen + histogram[hi] <= cut:
        seen += histogram[hi]
        hi -= 1
    span = max(1, hi - lo)
    return image.point([round(min(255.0, max(0.0, (v - lo) * 255.0 / span))) for v in range(256)])


def otsu(histogram):
    total = sum(histogram)
    mean_all = sum(i * h for i, h in enumerate(histogram)) / total
    best, best_t, weight, mean = -1.0, 0, 0.0, 0.0
    for t in range(256):
        weight += histogram[t] / total
        mean += t * histogram[t] / total
        if 0 < weight < 1:
            between = (mean_all * weight - mean) ** 2 / (weight * (1 - weight))
            if between > best:
                best, best_t = between, t
    return best_t


def stats(histogram, tone_floor, table=None):
    """Mean, standard deviation and the shares at white and at the floor, on
    0..1, of the histogram mapped through `table`."""
    mapped = [0] * 256
    for v, count in enumerate(histogram):
        mapped[table[v] if table else v] += count
    n = sum(mapped)
    mean = sum(v * c for v, c in enumerate(mapped)) / n / 255
    var = sum(c * (v / 255 - mean) ** 2 for v, c in enumerate(mapped)) / n
    return {
        'mean': round(mean, 4),
        'std': round(math.sqrt(var), 4),
        'whiteShare': round(sum(mapped[250:]) / n, 4),
        'blackShare': round(sum(mapped[: tone_floor + 1]) / n, 4),
    }


def base_tone(source, picture, standard):
    """The crop on the grid in the chosen channel and polarity, stretched by
    the autocontrast and otherwise linear."""
    width, height = picture['width'], picture['height']
    box = crop_box(source, picture['crop'], width, height)
    pad = 255 if picture['invert'] else 0
    if picture['channel'] == 'red':
        channel = source.split()[0]
    else:
        channel = source.convert('L')
    subject = None
    if picture['crop']['kind'] == 'subject':
        mask = picture['crop']['mask']
        ground = ground_mask(source, mask['bright'], mask['saturation'])
        subject = fit(ImageChops.invert(ground), box, width, height, Image.LANCZOS)
        subject = binary(subject, 127).filter(ImageFilter.GaussianBlur(mask['feather']))
    tone = fit(channel, box, width, height, Image.LANCZOS, pad)
    if subject is not None:
        tone = ImageChops.multiply(tone, subject)
    tone = autocontrast(tone, binary(subject, 127) if subject is not None else None, standard['tone']['autocontrastCutoff'])
    if picture['invert']:
        tone = ImageChops.invert(tone)
        if subject is not None:
            tone = ImageChops.multiply(tone, subject)
    return tone, box, subject


def solve(histogram, picture, standard):
    """The black and white points for the picture's kind, from the histogram
    of the region it is shown in."""
    gamma = standard['tone']['gamma']
    floor = standard['screen']['toneFloor']
    if picture['kind'] == 'scene':
        target = standard['tone']['scene']
        best = None
        for black in range(0, 245, 5):
            for white in range(black + 40, 256, 5):
                s = stats(histogram, floor, levels_table(black, white, gamma))
                err = (s['mean'] - target['mean']) ** 2 + (s['std'] - target['std']) ** 2
                if best is None or err < best[0]:
                    best = (err, black, white)
        return best[1], best[2]
    black = otsu(histogram)
    marks = histogram[black + 1:]
    total = sum(marks)
    white, seen = 255, 0
    for i, count in enumerate(marks):
        seen += count
        if total and seen >= total * standard['tone']['marks']['whitePercentile']:
            white = black + 1 + i
            break
    return black, max(white, black + 40)


def text_lines(tone):
    """Rows of six or more letter-sized marks: the detector the lint reads.
    Measured on the grid at 800 wide, lit marks and dark marks both."""
    small = tone.resize((800, round(800 * tone.height / tone.width)), Image.BILINEAR)
    best = 0
    for image in (small, ImageChops.invert(small)):
        threshold = otsu(image.histogram())
        w, h = image.size
        lit = [v > threshold for v in image.tobytes()]
        if sum(lit) > 0.5 * len(lit):
            continue
        best = max(best, count_lines(lit, w, h))
    return best


def count_lines(lit, w, h):
    parent = {}
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    labels = [0] * (w * h)
    nxt = 1
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if not lit[i]:
                continue
            left = labels[i - 1] if x and lit[i - 1] else 0
            up = labels[i - w] if y and lit[i - w] else 0
            if left and up:
                a, b = find(left), find(up)
                labels[i] = min(a, b)
                if a != b:
                    parent[max(a, b)] = min(a, b)
            elif left or up:
                labels[i] = left or up
            else:
                parent[nxt] = nxt
                labels[i] = nxt
                nxt += 1
    boxes = {}
    for i, l in enumerate(labels):
        if not l:
            continue
        r = find(l)
        x, y = i % w, i // w
        b = boxes.get(r)
        if b is None:
            boxes[r] = [x, y, x, y, 1]
        else:
            b[0] = min(b[0], x); b[1] = min(b[1], y); b[2] = max(b[2], x); b[3] = max(b[3], y); b[4] += 1
    glyphs = []
    for x0, y0, x1, y1, n in boxes.values():
        bw, bh = x1 - x0 + 1, y1 - y0 + 1
        if 6 <= bh <= 40 and 2 <= bw <= 3 * bh and n >= 0.15 * bw * bh:
            glyphs.append(((y0 + y1) / 2, bh, x0, x1))
    glyphs.sort()
    used = [False] * len(glyphs)
    lines = 0
    for i, (cy, bh, _, _) in enumerate(glyphs):
        if used[i]:
            continue
        row = sorted(
            (j for j, g in enumerate(glyphs) if not used[j] and abs(g[0] - cy) < 0.3 * bh and 0.6 < g[1] / bh < 1.6),
            key=lambda j: glyphs[j][2],
        )
        chain = row[:1]
        for j in row[1:]:
            if glyphs[j][2] - glyphs[chain[-1]][3] < 1.5 * bh:
                chain.append(j)
            else:
                if len(chain) >= 6:
                    break
                chain = [j]
        if len(chain) >= 6:
            for j in chain:
                used[j] = True
            lines += 1
    return lines


def run(recipe):
    standard = recipe['standard']
    view = recipe['view']
    preview_dir = recipe.get('previewDir')
    os.makedirs(recipe['outDir'], exist_ok=True)
    if preview_dir:
        os.makedirs(preview_dir, exist_ok=True)
    for picture in recipe['pictures']:
        source = Image.open(os.path.join(recipe['sourcesDir'], picture['source'])).convert('RGB')
        base, box, subject = base_tone(source, picture, standard)
        disc = None
        if picture['crop']['kind'] == 'disc':
            limb = fit_limb(base, picture['crop']['limbOver'])
            factor = FILE_WIDTH / base.size[0]
            disc = {'cx': limb['cx'] * factor, 'cy': limb['cy'] * factor, 'r': limb['r'] * factor}
        histogram, _, _ = region_histogram(base, picture['placement'], view, disc, subject)
        black, white = solve(histogram, picture, standard)
        tone = base.point(levels_table(black, white, standard['tone']['gamma']))
        quality = standard['file']['quality']
        data = encode_jpeg(tone, quality)
        if len(data) > picture['cap']:
            quality = standard['file']['fallbackQuality']
            data = encode_jpeg(tone, quality)
        name = f"mood-{picture['name']}.jpg"
        out = os.path.join(recipe['outDir'], name)
        with open(out, 'wb') as handle:
            handle.write(data)
        # The numbers are read back from the file, JPEG error included.
        written = Image.open(out).convert('L')
        histogram, sampled, region = region_histogram(written, picture['placement'], view, disc, subject)
        measured = stats(histogram, standard['screen']['toneFloor'])
        screened = dither(sampled)
        lit = screened.histogram(mask=region)
        measured['litShare'] = round(lit[255] / sum(lit), 4)
        entry = {
            'name': picture['name'],
            'file': name,
            'sha256': hashlib.sha256(data).hexdigest(),
            'width': written.size[0],
            'height': written.size[1],
            'bytes': len(data),
            'quality': quality,
            'source': picture['source'],
            'sourceBox': list(box),
            'crop': picture['crop'],
            'channel': picture['channel'],
            'invert': picture['invert'],
            'kind': picture['kind'],
            'placement': picture['placement'],
            'writing': picture['writing'],
            'levels': {'black': black, 'white': white},
            'house': {
                'blur': 0,
                'gamma': standard['tone']['gamma'],
                'autocontrastCutoff': standard['tone']['autocontrastCutoff'],
            },
            'region': measured,
            'textLines': text_lines(written),
        }
        if disc is not None:
            entry['disc'] = {k: round(v, 1) for k, v in disc.items()}
        if preview_dir:
            preview = os.path.join(preview_dir, f"preview-{picture['name']}.png")
            screened.save(preview, 'PNG', optimize=True)
        sys.stdout.write(json.dumps(entry) + '\n')
        sys.stdout.flush()


if __name__ == '__main__':
    run(json.load(sys.stdin))
