#!/usr/bin/env python3
"""Download the Google Fonts files the site self-hosts under public/fonts/google.

Each entry mirrors a next/font/google call the site used to make: the same
family, weight and style, latin subset, fetched from the css2 endpoint with a
woff2-capable browser UA so Google serves the same static woff2 it served the
build. Re-run to refresh; MANIFEST.json records where every file came from.
"""
import json, re, sys, urllib.request, pathlib

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
OUT = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'fonts' / 'google'
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
]

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def css_for(family, ital, wght):
    fam = family.replace(' ', '+')
    axis = f'ital,wght@{ital},{wght}' if ital else f'wght@{wght}'
    return fetch(f'https://fonts.googleapis.com/css2?family={fam}:{axis}&display=swap').decode()

def block_for(css, subset):
    # blocks look like: /* latin */ @font-face { ... src: url(...) format('woff2'); unicode-range: ...; }
    for m in re.finditer(r'/\* ([a-z-]+) \*/\s*@font-face \{(.*?)\}', css, re.S):
        if m.group(1) == subset:
            body = m.group(2)
            url = re.search(r'src: url\(([^)]+)\)', body).group(1)
            ur = re.search(r'unicode-range: ([^;]+);', body).group(1)
            return url, ur
    raise SystemExit(f'no {subset} block for {css[:200]}')

manifest = []
OUT.mkdir(parents=True, exist_ok=True)
for family, ital, wght, subset in WANT:
    slug = family.lower().replace(' ', '-')
    name = f"{slug}-{wght}{'-italic' if ital else ''}{'' if subset == 'latin' else '-' + subset}.woff2"
    css = css_for(family, ital, wght)
    url, ur = block_for(css, subset)
    data = fetch(url)
    if data[:4] != b'wOF2':
        raise SystemExit(f'{name}: not a woff2 ({data[:4]!r}) from {url}')
    (OUT / name).write_bytes(data)
    manifest.append({'file': name, 'family': family, 'weight': wght, 'style': 'italic' if ital else 'normal',
                     'subset': subset, 'unicodeRange': ur, 'source': url, 'bytes': len(data),
                     'license': 'SIL Open Font License 1.1'})
    print(f'{name:44} {len(data):7d} B  {url.split("/s/")[-1][:60] if "/s/" in url else url}')
(OUT / 'MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'{len(manifest)} files -> {OUT}')
