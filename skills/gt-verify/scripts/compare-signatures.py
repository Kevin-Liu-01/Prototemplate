#!/usr/bin/env python3
"""compare-signatures.py: fetches the same routes from two servers and reports every structural difference between the two renders, page by page (gt-verify references/parity-review.md).

Two steps, each a subcommand:

  fetch    GETs every route in a route list from --before and --after,
           following redirects, and saves each body with its status, final
           URL, time and redirect count under <dir>/before and <dir>/after.
           A route already saved with status 200 is skipped, so a rerun
           fills only the gaps. The route list is a text file with one path
           per line (# starts a comment); a path may be followed by a tab
           and a Cookie header value, for a variant chosen by a cookie.
  compare  reads both sides' saved pages, builds each page's signature with
           page-signature.py (beside this file) and writes
           <out>/diffs.json: per route, every field that differs (status,
           final URL, error markers, head tags, headings, in-page ids,
           links, media, tables, code blocks, buttons, text, sidebar and
           TOC links, the page's link set). It prints how many routes
           differ in each field. Lists that hold the same items in another
           order read "order-only"; localhost ports and the two bases are
           stripped before anything is compared (fetch records the bases in
           <dir>/bases.json).

Usage:
  python3 compare-signatures.py fetch --before <base url> --after <base url> --routes <file> --dir <dir> [--jobs 3] [--timeout 180]
  python3 compare-signatures.py compare --dir <dir> [--out <dir>/report] [--match <regex>] [--ignore-button <name>]... [--strip-origin <origin>]...
  python3 compare-signatures.py --help

--ignore-button drops a button by its name from the comparison (a control
the change adds on purpose, such as a copy-link button on every heading).
Exit 0 on success, 2 on a usage error. A difference is data for the review,
not a failure.

Requires: Python 3.9 or later, standard library only; page-signature.py in
the same folder.
Last real run: 2026-10-08, the docs parity review of gt-cloud #5217 (New
Onboarding and Dashboard session), as compare.py beside a fetch script that
read the routes from a dev server's prerender manifest. Copied into this
skill on 2026-10-10, with the fetch step reading a route list instead.
"""
import argparse
import collections
import concurrent.futures as cf
import difflib
import glob
import importlib.util
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SIDES = ('before', 'after')
LOCAL_ORIGIN = re.compile(r'^https?://(?:localhost|127\.0\.0\.1)(?::\d+)?')


def load_signature_module():
    spec = importlib.util.spec_from_file_location('page_signature', os.path.join(HERE, 'page-signature.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def route_key(path, cookie=''):
    key = path.strip('/').replace('/', '__') or '_root'
    key = re.sub(r'[^A-Za-z0-9_.@=-]', '_', key)
    if cookie:
        key += '@' + re.sub(r'[^A-Za-z0-9_.-]', '-', cookie)
    return key


def read_routes(path):
    items = []
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            line = line.rstrip('\n')
            if not line.strip() or line.lstrip().startswith('#'):
                continue
            route, _, cookie = line.partition('\t')
            items.append((route.strip(), cookie.strip()))
    return items


def fetch_one(base, side_dir, route, cookie, timeout):
    key = route_key(route, cookie)
    body_path = os.path.join(side_dir, key + '.html')
    meta_path = body_path + '.json'
    if os.path.exists(meta_path):
        with open(meta_path, encoding='utf-8') as fh:
            if json.load(fh).get('status') == 200:
                return
    req = urllib.request.Request(base.rstrip('/') + route, headers={'User-Agent': 'compare-signatures'})
    if cookie:
        req.add_header('Cookie', cookie)

    redirects = []

    class Count(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            redirects.append(args[-1])
            return super().redirect_request(*args, **kwargs)

    opener = urllib.request.build_opener(Count)
    started = time.time()
    status, final, body = 0, '', b''
    try:
        with opener.open(req, timeout=timeout) as res:
            status, final, body = res.status, res.geturl(), res.read()
    except urllib.error.HTTPError as err:
        status, final, body = err.code, err.geturl(), err.read()
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        status, final = 0, repr(err)
    with open(body_path, 'wb') as fh:
        fh.write(body)
    with open(meta_path, 'w', encoding='utf-8') as fh:
        json.dump({'path': route, 'cookie': cookie, 'status': status, 'final': final,
                   'time': round(time.time() - started, 3), 'redirects': len(redirects)}, fh)


def cmd_fetch(args):
    items = read_routes(args.routes)
    if not items:
        print('compare-signatures: the route list is empty', file=sys.stderr)
        return 2
    bases = {'before': args.before, 'after': args.after}
    os.makedirs(args.dir, exist_ok=True)
    with open(os.path.join(args.dir, 'bases.json'), 'w', encoding='utf-8') as fh:
        json.dump(bases, fh)
    started = time.time()
    with cf.ThreadPoolExecutor(max(1, args.jobs) * 2) as pool:
        futures = []
        for side in SIDES:
            side_dir = os.path.join(args.dir, side)
            os.makedirs(side_dir, exist_ok=True)
            for route, cookie in items:
                futures.append(pool.submit(fetch_one, bases[side], side_dir, route, cookie, args.timeout))
        for fut in futures:
            fut.result()
    print(f'fetched {len(items)} routes per side in {time.time() - started:.1f}s into {args.dir}')
    return 0


def load(dir_, side, key):
    with open(os.path.join(dir_, side, key + '.html.json'), encoding='utf-8') as fh:
        meta = json.load(fh)
    try:
        with open(os.path.join(dir_, side, key + '.html'), encoding='utf-8', errors='replace') as fh:
            raw = fh.read()
    except FileNotFoundError:
        raw = ''
    return meta, raw


def strip_local(value, origins):
    value = LOCAL_ORIGIN.sub('', value or '')
    for origin in origins:
        if value.startswith(origin):
            value = value[len(origin):] or '/'
    return value


def og_norm(og, origins):
    return {k: [strip_local(x, origins) for x in v] for k, v in og.items()}


def jsonld_norm(j, origins):
    text = json.dumps(j, sort_keys=True, ensure_ascii=False)
    text = re.sub(r'https?://(?:localhost|127\.0\.0\.1)(?::\d+)?', '', text)
    for origin in origins:
        text = text.replace(origin, '')
    return json.loads(text)


def multiset_diff(a, b):
    ca = collections.Counter(map(_hashable, a))
    cb = collections.Counter(map(_hashable, b))
    return sorted((ca - cb).items(), key=str), sorted((cb - ca).items(), key=str)


def _hashable(item):
    if isinstance(item, list):
        return tuple(_hashable(x) for x in item)
    return item


def list_diff(a, b):
    d = multiset_diff(a, b)
    return d if (d[0] or d[1]) else 'order-only'


def compare_key(sigmod, dir_, key, ignore_buttons, origins):
    mb, rb = load(dir_, 'before', key)
    ma, ra = load(dir_, 'after', key)
    diffs = {}
    if mb['status'] != ma['status']:
        diffs['status'] = (mb['status'], ma['status'])
    fb, fa = strip_local(mb['final'], origins), strip_local(ma['final'], origins)
    if fb != fa:
        diffs['final_url'] = (fb, fa)
    if mb['status'] != 200 or ma['status'] != 200:
        diffs.setdefault('status', (mb['status'], ma['status']))
        return diffs
    sb, sa = sigmod.signature(rb), sigmod.signature(ra)
    if sb['errors'] != sa['errors']:
        diffs['errors'] = (sb['errors'], sa['errors'])
    for field in ('title', 'description', 'robots', 'canonical', 'hreflang', 'alt_other'):
        if sb[field] != sa[field]:
            diffs[field] = (sb[field], sa[field])
    if og_norm(sb['og'], origins) != og_norm(sa['og'], origins):
        diffs['og'] = (og_norm(sb['og'], origins), og_norm(sa['og'], origins))
    jb, ja = jsonld_norm(sb['jsonld'], origins), jsonld_norm(sa['jsonld'], origins)
    if jb != ja:
        diffs['jsonld'] = (jb, ja)
    if sb['article_found'] != sa['article_found']:
        diffs['article_found'] = (sb['article_found'], sa['article_found'])
    if sb['headings'] != sa['headings']:
        diffs['headings'] = list_diff(sb['headings'], sa['headings'])
    # in-page ids a deep link can target; framework-generated ids are dropped
    generated = re.compile(r'^(radix-|_R_|«|:r)')
    ib = [i for i in sb['ids'] if i != 'nd-page' and not generated.match(i)]
    ia = [i for i in sa['ids'] if i != 'nd-page' and not generated.match(i)]
    if ib != ia:
        d = multiset_diff(ib, ia)
        if d[0] or d[1]:
            diffs['ids'] = d
    if sb['links'] != sa['links']:
        diffs['links'] = list_diff(sb['links'], sa['links'])
    for field in ('imgs', 'iframes', 'videos', 'tables', 'table_heads', 'tabpanels', 'callouts', 'figs', 'tablists'):
        if sb[field] != sa[field]:
            diffs[field] = (sb[field], sa[field])
    pb = [(p['hash'], p['lines'], json.dumps(p['lineclasses'], sort_keys=True), p['title']) for p in sb['pres']]
    pa = [(p['hash'], p['lines'], json.dumps(p['lineclasses'], sort_keys=True), p['title']) for p in sa['pres']]
    if pb != pa:
        diffs['pres'] = multiset_diff(pb, pa)
    styled_b = [p['styled'] for p in sb['pres']]
    styled_a = [p['styled'] for p in sa['pres']]
    if styled_b != styled_a and len(styled_b) == len(styled_a):
        diffs['pre_styled_tokens'] = (sum(styled_b), sum(styled_a))
    # a button's name is its aria-label, or its text when it has none
    nb = [b[0] or b[1] for b in sb['buttons'] if (b[0] or b[1]) not in ignore_buttons and b[1] not in ignore_buttons]
    na = [b[0] or b[1] for b in sa['buttons'] if (b[0] or b[1]) not in ignore_buttons and b[1] not in ignore_buttons]
    if collections.Counter(nb) != collections.Counter(na):
        diffs['buttons'] = multiset_diff(nb, na)
    if sb['text_hash'] != sa['text_hash']:
        ud = list(difflib.unified_diff(sb['text_lines'], sa['text_lines'], 'before', 'after', n=0, lineterm=''))
        diffs['text'] = {'len': (sb['text_len'], sa['text_len']), 'diff': ud[:80]}
    for field in ('sidebar_links', 'toc_links'):
        if sb[field] != sa[field]:
            diffs[field] = list_diff(sb[field], sa[field])
    set_b, set_a = set(map(str, sb['page_links'])), set(map(str, sa['page_links']))
    if set_b != set_a:
        diffs['page_links_set'] = (sorted(set_b - set_a), sorted(set_a - set_b))
    return diffs


def cmd_compare(args):
    sigmod = load_signature_module()
    origins = [o.rstrip('/') for o in args.strip_origin]
    bases_path = os.path.join(args.dir, 'bases.json')
    if os.path.exists(bases_path):
        with open(bases_path, encoding='utf-8') as fh:
            origins += [b.rstrip('/') for b in json.load(fh).values()]
    sigmod.set_strip_origins(origins)
    before_dir = os.path.join(args.dir, 'before')
    keys = sorted(os.path.basename(f)[:-len('.html.json')] for f in glob.glob(os.path.join(before_dir, '*.html.json'))
                  if os.path.exists(os.path.join(args.dir, 'after', os.path.basename(f))))
    if args.match:
        pat = re.compile(args.match)
        keys = [k for k in keys if pat.search(k)]
    if not keys:
        print(f'compare-signatures: no route was fetched on both sides under {args.dir}', file=sys.stderr)
        return 2
    out = args.out or os.path.join(args.dir, 'report')
    os.makedirs(out, exist_ok=True)
    results = {}
    for key in keys:
        try:
            results[key] = compare_key(sigmod, args.dir, key, set(args.ignore_button), origins)
        except Exception as err:  # one unreadable page must not hide the rest
            results[key] = {'compare_error': repr(err)}
    with open(os.path.join(out, 'diffs.json'), 'w', encoding='utf-8') as fh:
        json.dump(results, fh, indent=1, ensure_ascii=False, default=str)
    counts = collections.Counter(field for d in results.values() for field in d)
    same = sum(1 for d in results.values() if not d)
    print(f'{len(keys)} routes compared, {same} identical; report: {os.path.join(out, "diffs.json")}')
    for field, n in counts.most_common():
        print(f'  {field:22} {n}')
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description='Fetch routes from two servers and compare their page signatures.')
    sub = ap.add_subparsers(dest='cmd', required=True)
    f = sub.add_parser('fetch', help='GET every route from both bases and save the bodies')
    f.add_argument('--before', required=True, help='base URL of the reference render (main, production)')
    f.add_argument('--after', required=True, help='base URL of the render under review')
    f.add_argument('--routes', required=True, help='route list: one path per line, optionally a tab and a Cookie value')
    f.add_argument('--dir', required=True, help='folder for the saved pages')
    f.add_argument('--jobs', type=int, default=3, help='parallel requests per side (default 3)')
    f.add_argument('--timeout', type=float, default=180, help='seconds per request (default 180)')
    c = sub.add_parser('compare', help='compare the saved pages and write diffs.json')
    c.add_argument('--dir', required=True, help='the folder fetch wrote')
    c.add_argument('--out', help='report folder (default <dir>/report)')
    c.add_argument('--match', help='compare only route keys matching this regex')
    c.add_argument('--ignore-button', action='append', default=[], help='a button name left out of the comparison (repeatable)')
    c.add_argument('--strip-origin', action='append', default=[], help='an origin stripped from hrefs, besides localhost (repeatable)')
    args = ap.parse_args(argv)
    return cmd_fetch(args) if args.cmd == 'fetch' else cmd_compare(args)


if __name__ == '__main__':
    sys.exit(main())
