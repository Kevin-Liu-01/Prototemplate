#!/usr/bin/env python3
"""page-signature.py: reads the structural signature of one server-rendered page, the unit a parity review compares (gt-verify references/parity-review.md).

The signature holds what a reader, a crawler or an agent gets from the HTML
before any script runs: the head (title, description, robots, Open Graph and
Twitter tags, canonical, hreflang alternates, JSON-LD), the article's
headings with their ids, the in-page ids a deep link can target, the
article's links, images, iframes, videos, tables, code blocks (a hash of
each block's text, its line count, its line classes and its styled spans),
tabs, callouts and buttons, the visible article text (length, hash and
lines), the sidebar and table-of-contents links, every link on the page,
and the error markers Next.js leaves in a failed render (the error root,
a digest, a not-found or redirect fallback, a client-side bailout).

The article is the first <article>. The sidebar is aside#nd-sidebar and the
table of contents #nd-toc, as Fumadocs renders them; on another site those
two lists stay empty and the rest still reads. Hrefs are compared as paths:
a localhost or 127.0.0.1 origin on any port is stripped, and so is every
--strip-origin.

Usage:
  python3 page-signature.py <file.html> [--strip-origin https://example.com]... [--full]
  python3 page-signature.py --help

It prints the signature as JSON, without the text lines unless --full is
given. compare-signatures.py in this folder imports signature() from this
file to compare two fetches of the same routes.

Requires: Python 3.9 or later, standard library only.
Last real run: 2026-10-08, the docs parity review of gt-cloud #5217 (New
Onboarding and Dashboard session), 475 page fetches per side, as sig.py.
Copied into this skill on 2026-10-10.
"""
import argparse
import hashlib
import html
import json
import re
import sys
from html.parser import HTMLParser
from urllib.parse import parse_qs, unquote, urlparse

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}
BLOCK = {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'pre', 'div',
         'section', 'figure', 'figcaption', 'table', 'ul', 'ol', 'blockquote',
         'header', 'footer', 'details', 'summary', 'dt', 'dd', 'br', 'td', 'th',
         'button'}
LOCAL_ORIGIN = re.compile(r'^https?://(?:localhost|127\.0\.0\.1)(?::\d+)?')

# origins stripped from every href and src, set by set_strip_origins()
STRIP_ORIGINS = []

# Next.js error markers, read on the raw document before parsing
ERROR_MARKERS = [
    (r'id="__next_error__"', 'next_error_root'),
    (r'Application error: a (?:client|server)-side exception', 'application_error'),
    (r'This page could not be found', 'not_found_text'),
    (r'NEXT_HTTP_ERROR_FALLBACK;404', 'rsc_not_found'),
    (r'NEXT_REDIRECT', 'rsc_redirect'),
    (r'\\"digest\\":\\"[0-9]+\\"|"digest":"[0-9]+"', 'rsc_digest'),
    (r'data-dgst=', 'data_dgst'),
    (r'Internal Server Error', 'ise_text'),
    (r'Something went wrong', 'something_went_wrong'),
    (r'Unhandled Runtime Error', 'unhandled_runtime'),
    (r'nextjs__container_errors', 'dev_overlay_errors'),
    (r'<template data-dgst', 'template_dgst'),
    (r'BAILOUT_TO_CLIENT_SIDE_RENDERING', 'csr_bailout'),
]


def set_strip_origins(origins):
    """Origins (scheme and host, no trailing slash) removed from hrefs."""
    STRIP_ORIGINS[:] = [o.rstrip('/') for o in origins if o]


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


def norm_href(h):
    if h is None:
        return None
    h = html.unescape(h)
    m = LOCAL_ORIGIN.match(h)
    if m:
        return h[m.end():] or '/'
    for origin in STRIP_ORIGINS:
        if h.startswith(origin):
            return h[len(origin):] or '/'
    return h


def norm_img(src):
    if not src:
        return src
    src = html.unescape(src)
    if '/_next/image' in src:
        q = parse_qs(urlparse(src).query)
        if 'url' in q:
            return 'next-image:' + unquote(q['url'][0])
    return norm_href(src)


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []  # (tag, attrs, flags)
        self.head = {'title': '', 'meta': {}, 'links': [], 'jsonld': []}
        self.in_title = False
        self.in_script = None
        self.script_buf = []
        self.art_depth = None
        self.headings = []
        self.cur_heading = None
        self.links = []
        self.page_links = []
        self.sidebar_links = []
        self.toc_links = []
        self.imgs = []
        self.tables = 0
        self.table_heads = []
        self.cur_th = None
        self.pres = []
        self.cur_pre = None
        self.cur_fig = None
        self.figs = []
        self.text = []
        self.buttons = []
        self.cur_button = None
        self.cur_tab = []
        self.tablists = []
        self.tabpanels = 0
        self.callouts = 0
        self.ids = []
        self.iframes = []
        self.videos = []
        self.cur_a = None
        self.data_attrs = {}

    def has_flag(self, flag):
        return any(flag in f for _, _, f in self.stack)

    def stack_has(self, tag):
        return any(t == tag for t, _, _ in self.stack)

    def in_article(self):
        return self.art_depth is not None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        flags = set()
        cls = a.get('class') or ''
        if tag in ('svg', 'style', 'noscript', 'template'):
            flags.add('skip')
        if 'sr-only' in cls.split() and self.has_flag('button'):
            flags.add('sronly')
        if tag == 'button':
            flags.add('button')
        if a.get('hidden') is not None or a.get('aria-hidden') == 'true':
            flags.add('hidden')
        if tag == 'title' and not self.stack_has('svg'):
            self.in_title = True
        if tag == 'meta':
            k = a.get('name') or a.get('property') or a.get('http-equiv')
            if k:
                self.head['meta'].setdefault(k, []).append(a.get('content'))
        if tag == 'link' and a.get('rel') in ('canonical', 'alternate'):
            self.head['links'].append((a.get('rel'), a.get('hreflang'), norm_href(a.get('href')), a.get('type')))
        if tag == 'script':
            self.in_script = a.get('type') or 'js'
            self.script_buf = []
        if tag == 'aside' and a.get('id') == 'nd-sidebar':
            flags.add('sidebar')
        if a.get('id') == 'nd-toc':
            flags.add('toc')
        if self.art_depth is None and tag == 'article':
            self.art_depth = len(self.stack) + 1
            flags.add('article')
            self.data_attrs = {k: v for k, v in a.items() if k.startswith('data-')}
        if a.get('id') and self.in_article():
            self.ids.append(a['id'])
        if self.in_article():
            self._article_start(tag, a, cls, flags)
        if tag == 'a':
            href = norm_href(a.get('href'))
            self.page_links.append(href)
            if self.has_flag('sidebar') or 'sidebar' in flags:
                self.sidebar_links.append(href)
            if self.has_flag('toc') or 'toc' in flags:
                self.toc_links.append(href)
        if tag in BLOCK and self.in_article():
            self.text.append('\n')
        if tag not in VOID:
            self.stack.append((tag, a, flags))

    def _article_start(self, tag, a, cls, flags):
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.cur_heading = [tag, a.get('id'), []]
        if tag == 'a':
            self.cur_a = [norm_href(a.get('href')), []]
        if tag == 'img':
            self.imgs.append((norm_img(a.get('src')), a.get('alt')))
        if tag == 'iframe':
            self.iframes.append(a.get('src'))
        if tag in ('video', 'source') and a.get('src'):
            self.videos.append(norm_href(a.get('src')))
        if tag == 'table':
            self.tables += 1
            self.table_heads.append([])
        if tag == 'th':
            self.cur_th = []
        if tag == 'figure':
            self.cur_fig = {'title': [], 'pres': 0}
            self.figs.append(self.cur_fig)
        if tag == 'figcaption' or (self.cur_fig is not None and 'fd-codeblock-title' in cls):
            flags.add('figtitle')
        if tag == 'pre':
            self.cur_pre = {'text': [], 'lines': 0, 'lineclasses': {}, 'styled': 0}
        if tag == 'span' and self.cur_pre is not None:
            if 'line' in cls.split():
                self.cur_pre['lines'] += 1
                extra = ' '.join(sorted(c for c in cls.split() if c != 'line'))
                if extra:
                    self.cur_pre['lineclasses'][extra] = self.cur_pre['lineclasses'].get(extra, 0) + 1
            if a.get('style'):
                self.cur_pre['styled'] += 1
        if a.get('role') == 'tablist':
            self.tablists.append([])
            flags.add('tablist')
        if a.get('role') == 'tab':
            flags.add('tab')
            self.cur_tab = []
        if a.get('role') == 'tabpanel':
            self.tabpanels += 1
        if 'callout' in cls.lower() or a.get('data-callout') is not None:
            self.callouts += 1
        if tag == 'button':
            self.cur_button = [a.get('aria-label'), []]

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'script' and self.in_script:
            if self.in_script == 'application/ld+json':
                body = ''.join(self.script_buf)
                try:
                    self.head['jsonld'].append(json.loads(body))
                except ValueError:
                    self.head['jsonld'].append(body)
            self.in_script = None
        if tag in VOID:
            return
        idx = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                idx = i
                break
        if idx is None:
            return
        closing = self.stack[idx:]
        del self.stack[idx:]
        for t, _, f in reversed(closing):
            if self.in_article():
                self._article_end(t, f)
            if 'article' in f:
                self.art_depth = None

    def _article_end(self, t, f):
        if t in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6') and self.cur_heading and self.cur_heading[0] == t:
            self.headings.append((t, self.cur_heading[1], norm(''.join(self.cur_heading[2]))))
            self.cur_heading = None
        if t == 'a' and self.cur_a is not None:
            self.links.append((self.cur_a[0], norm(''.join(self.cur_a[1]))))
            self.cur_a = None
        if t == 'th' and self.cur_th is not None:
            self.table_heads[-1].append(norm(''.join(self.cur_th)))
            self.cur_th = None
        if t == 'pre' and self.cur_pre is not None:
            txt = ''.join(self.cur_pre['text'])
            self.pres.append({
                'hash': hashlib.md5(txt.encode()).hexdigest()[:10],
                'len': len(txt),
                'lines': self.cur_pre['lines'],
                'lineclasses': self.cur_pre['lineclasses'],
                'styled': self.cur_pre['styled'],
                'title': norm(''.join(self.cur_fig['title'])) if self.cur_fig else None,
                'head': txt[:60],
            })
            self.cur_pre = None
        if t == 'figure':
            self.cur_fig = None
        if 'tab' in f and self.tablists:
            self.tablists[-1].append(norm(''.join(self.cur_tab)))
        if t == 'button' and self.cur_button is not None:
            self.buttons.append((self.cur_button[0], norm(''.join(self.cur_button[1]))))
            self.cur_button = None
        if t in BLOCK:
            self.text.append('\n')

    def handle_data(self, d):
        if self.in_title:
            self.head['title'] += d
        if self.in_script:
            self.script_buf.append(d)
            return
        if self.has_flag('skip') or self.stack_has('style') or self.stack_has('svg'):
            return
        if self.has_flag('sronly'):
            if self.cur_button is not None:
                self.cur_button[1].append(d)
            return
        if not self.in_article():
            return
        if self.cur_pre is not None:
            self.cur_pre['text'].append(d)
        if self.cur_heading is not None:
            self.cur_heading[2].append(d)
        if self.cur_a is not None:
            self.cur_a[1].append(d)
        if self.cur_th is not None:
            self.cur_th.append(d)
        if self.cur_fig is not None and self.has_flag('figtitle'):
            self.cur_fig['title'].append(d)
        if self.has_flag('tab'):
            self.cur_tab.append(d)
        if self.cur_button is not None:
            self.cur_button[1].append(d)
        self.text.append(d)


def signature(raw):
    """The structural signature of one HTML document, as a dict."""
    errs = []
    for pat, name in ERROR_MARKERS:
        n = len(re.findall(pat, raw))
        if n:
            errs.append((name, n))
    p = Parser()
    p.feed(raw)
    lines = [norm(line) for line in ''.join(p.text).split('\n')]
    lines = [line for line in lines if line]
    vis = ' '.join(lines)
    head_links = p.head['links']
    return {
        'title': norm(p.head['title']),
        'description': p.head['meta'].get('description'),
        'robots': p.head['meta'].get('robots'),
        'og': {k: v for k, v in p.head['meta'].items() if k.startswith('og:') or k.startswith('twitter:')},
        'canonical': [link[2] for link in head_links if link[0] == 'canonical'],
        'hreflang': sorted((link[1], link[2]) for link in head_links if link[0] == 'alternate' and link[1]),
        'alt_other': sorted((str(link[3]), str(link[2])) for link in head_links if link[0] == 'alternate' and not link[1]),
        'jsonld': p.head['jsonld'],
        'article_found': bool(p.text) or bool(p.headings),
        'article_data': p.data_attrs,
        'headings': p.headings,
        'ids': p.ids,
        'links': p.links,
        'imgs': p.imgs,
        'iframes': p.iframes,
        'videos': p.videos,
        'tables': p.tables,
        'table_heads': p.table_heads,
        'pres': p.pres,
        'figs': len(p.figs),
        'tablists': p.tablists,
        'tabpanels': p.tabpanels,
        'callouts': p.callouts,
        'buttons': p.buttons,
        'text_len': len(vis),
        'text_hash': hashlib.md5(vis.encode()).hexdigest()[:12],
        'text_lines': lines,
        'sidebar_links': p.sidebar_links,
        'toc_links': p.toc_links,
        'page_links': p.page_links,
        'errors': errs,
        'raw_len': len(raw),
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description='Print the structural signature of a saved HTML page as JSON.')
    ap.add_argument('file', help='a saved HTML document')
    ap.add_argument('--strip-origin', action='append', default=[], help='an origin to strip from hrefs (repeatable)')
    ap.add_argument('--full', action='store_true', help='include the visible text lines')
    args = ap.parse_args(argv)
    set_strip_origins(args.strip_origin)
    with open(args.file, encoding='utf-8', errors='replace') as fh:
        sig = signature(fh.read())
    if not args.full:
        sig.pop('text_lines')
    json.dump(sig, sys.stdout, indent=1, ensure_ascii=False)
    sys.stdout.write('\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
