#!/usr/bin/env python3
"""Download the Google Fonts files the site self-hosts under public/fonts/google.

Each entry mirrors a next/font/google call the site used to make: the same
family, weight and style, latin subset, fetched from the css2 endpoint with a
woff2-capable browser UA so Google serves the same static woff2 it served the
build. Re-run to refresh; MANIFEST.json records where every file came from.
"""
import json, re, sys, urllib.parse, urllib.request, pathlib

# --help prints this docstring and downloads nothing
if {'--help', '-h'} & set(sys.argv[1:]):
    print(__doc__)
    sys.exit(0)

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
OUT = pathlib.Path(__file__).resolve().parents[2] / 'public' / 'fonts' / 'google'
# family, italic(0/1), weight, subset
WANT = [
    ('Sora', 0, 300, 'latin'), ('Sora', 0, 400, 'latin'), ('Sora', 0, 500, 'latin'),
    ('Instrument Sans', 0, 400, 'latin'), ('Instrument Sans', 0, 500, 'latin'),
    ('Instrument Sans', 1, 400, 'latin'), ('Instrument Sans', 1, 500, 'latin'),
    ('Fraunces', 0, 600, 'latin'),
    ('Space Grotesk', 0, 500, 'latin'), ('Space Grotesk', 0, 700, 'latin'),
    ('Cinzel', 0, 400, 'latin'), ('Cinzel', 0, 500, 'latin'), ('Cinzel', 0, 600, 'latin'),
    ('Cinzel', 0, 400, 'latin-ext'), ('Cinzel', 0, 600, 'latin-ext'),
    ('Marcellus', 0, 400, 'latin'), ('Aboreto', 0, 400, 'latin'),
    ('Julius Sans One', 0, 400, 'latin'), ('Federo', 0, 400, 'latin'), ('Forum', 0, 400, 'latin'),
    # the speed marks (public/marks, scripts/build/speed-marks.mjs): the faces are converted to outlines at
    # build time, so the site never loads them; a fifth field names the exact css2 axis tuple for a variable
    # face and a sixth the file name, since Anybody is fetched at width 150 rather than at its default width
    ('Michroma', 0, 400, 'latin'), ('Orbitron', 0, 900, 'latin'),
    ('Anybody', 0, 900, 'latin', 'ital,wdth,wght@0,150,900', 'anybody-150-900.woff2'),
    ('Anybody', 1, 900, 'latin', 'ital,wdth,wght@1,150,900', 'anybody-150-900-italic.woff2'),
    ('Anybody', 1, 500, 'latin', 'ital,wdth,wght@1,150,500', 'anybody-150-500-italic.woff2'),
]
# the presenter's Details slide (src/app/present/slides/TypeDetailSlide.tsx) sets Google's Inter in red over the rsms
# build; css2's text= parameter returns Google's own cut of a face holding only the given characters, with its wght
# axis and its feature list as Google serves them. The text is the slide's specimen strings plus a to z, the
# characters its scramble draws from. Fields: family, css2 axis tuple, text, file name
TEXT_CUTS = [
    ('Inter', 'wght@100..900',
     'Gg Ra 0123 Illegal 10Ol 0 skips in 100 songs a little while ago General Translation Inter '
     'abcdefghijklmnopqrstuvwxyz', 'inter-specimen.woff2'),
]

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def css_for(family, ital, wght, axis=None, text=None):
    fam = family.replace(' ', '+')
    if axis is None:
        axis = f'ital,wght@{ital},{wght}' if ital else f'wght@{wght}'
    cut = f'&text={urllib.parse.quote(text)}' if text else ''
    return fetch(f'https://fonts.googleapis.com/css2?family={fam}:{axis}{cut}&display=swap').decode()

def block_for(css, subset):
    # blocks look like: /* latin */ @font-face { ... src: url(...) format('woff2'); unicode-range: ...; }
    for m in re.finditer(r'/\* ([a-z-]+) \*/\s*@font-face \{(.*?)\}', css, re.S):
        if m.group(1) == subset:
            body = m.group(2)
            url = re.search(r'src: url\(([^)]+)\)', body).group(1)
            ur = re.search(r'unicode-range: ([^;]+);', body).group(1)
            return url, ur
    raise SystemExit(f'no {subset} block for {css[:200]}')

def save(name, url, record, axis=None):
    data = fetch(url)
    if data[:4] != b'wOF2':
        raise SystemExit(f'{name}: not a woff2 ({data[:4]!r}) from {url}')
    (OUT / name).write_bytes(data)
    manifest.append({'file': name, **record, 'source': url, 'bytes': len(data),
                     'license': 'SIL Open Font License 1.1', **({'axis': axis} if axis else {})})
    print(f'{name:44} {len(data):7d} B  {url.split("/s/")[-1][:60] if "/s/" in url else url[:60]}')

manifest = []
OUT.mkdir(parents=True, exist_ok=True)
for entry in WANT:
    family, ital, wght, subset = entry[:4]
    axis = entry[4] if len(entry) > 4 else None
    slug = family.lower().replace(' ', '-')
    name = entry[5] if len(entry) > 5 else f"{slug}-{wght}{'-italic' if ital else ''}{'' if subset == 'latin' else '-' + subset}.woff2"
    css = css_for(family, ital, wght, axis)
    url, ur = block_for(css, subset)
    save(name, url, {'family': family, 'weight': wght, 'style': 'italic' if ital else 'normal',
                     'subset': subset, 'unicodeRange': ur}, axis)
for family, axis, text, name in TEXT_CUTS:
    # a text= answer is a single @font-face with no subset comment
    css = css_for(family, 0, None, axis, text)
    url = re.search(r'src: url\(([^)]+)\)', css).group(1)
    ur = re.search(r'unicode-range: ([^;]+);', css).group(1)
    save(name, url, {'family': family, 'style': 'normal', 'text': text, 'unicodeRange': ur}, axis)
(OUT / 'MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'{len(manifest)} files -> {OUT}')
