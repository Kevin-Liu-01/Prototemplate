#!/usr/bin/env python3
"""Offline test of page-signature.py and compare-signatures.py: two loopback servers serve fixture pages, fetch saves both sides, and compare reports exactly the planted differences.

Run: python3 skills/gt-verify/scripts/page-signature.test.py (pnpm test:skill-scripts runs it).
It binds 127.0.0.1 only and touches no network.
"""
import http.server
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import threading

HERE = os.path.dirname(os.path.abspath(__file__))

PAGE = """<!doctype html><html><head><title>Quickstart</title>
<meta name="description" content="Start here">
<link rel="canonical" href="{origin}/docs/quickstart">
<script type="application/ld+json">{{"@type":"TechArticle","url":"{origin}/docs/quickstart"}}</script>
</head><body>
<aside id="nd-sidebar"><a href="{origin}/docs/quickstart">Quickstart</a><a href="/docs/config">Config</a></aside>
<article data-page="quickstart">
<h1 id="quickstart">Quickstart</h1>
<p>Install the package, then {verb} the provider.</p>
<h2 id="{h2id}">Configure</h2>
<pre><span class="line">npm i gt-next</span></pre>
<button aria-label="Copy Text">copy</button>{extra_button}
<a href="/docs/config">Config</a>
</article>
<div id="nd-toc"><a href="#quickstart">Quickstart</a></div>
</body></html>"""

ERROR_PAGE = '<html><body><div id="__next_error__"></div><p>Application error: a client-side exception has occurred</p></body></html>'


def serve(pages):
    """A loopback server answering each path in pages; a missing path is 404."""

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802 (the stdlib's name)
            if self.path == '/old':
                self.send_response(308)
                self.send_header('Location', '/docs/quickstart')
                self.end_headers()
                return
            body = pages.get(self.path)
            self.send_response(200 if body is not None else 404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write((body or 'not found').encode())

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f'http://127.0.0.1:{server.server_address[1]}'


def main():
    failures = []

    def check(cond, what):
        if not cond:
            failures.append(what)

    before_pages, after_pages = {}, {}
    before, before_url = serve(before_pages)
    after, after_url = serve(after_pages)
    page = PAGE.format(origin=before_url, verb='wrap', h2id='configure', extra_button='')
    before_pages.update({'/docs/quickstart': page, '/docs/same': page, '/docs/broken': page})
    anchor_button = '<button><span class="sr-only">Copy Anchor Link</span></button>'
    after_pages.update({
        '/docs/quickstart': PAGE.format(origin=after_url, verb='mount', h2id='configure-it', extra_button=anchor_button),
        '/docs/same': PAGE.format(origin=after_url, verb='wrap', h2id='configure', extra_button=anchor_button),
        '/docs/broken': ERROR_PAGE,
    })
    try:
        with tempfile.TemporaryDirectory() as tmp:
            routes = os.path.join(tmp, 'routes.txt')
            with open(routes, 'w') as fh:
                fh.write('# fixture routes\n/docs/quickstart\n/docs/same\n/docs/broken\n/old\n/docs/missing\n')
            work = os.path.join(tmp, 'run')
            script = os.path.join(HERE, 'compare-signatures.py')
            fetch = subprocess.run([sys.executable, script, 'fetch', '--before', before_url, '--after', after_url,
                                    '--routes', routes, '--dir', work, '--timeout', '10'], capture_output=True, text=True)
            check(fetch.returncode == 0, f'fetch exit {fetch.returncode}: {fetch.stderr}')
            compare = subprocess.run([sys.executable, script, 'compare', '--dir', work,
                                      '--ignore-button', 'Copy Anchor Link'],
                                     capture_output=True, text=True)
            check(compare.returncode == 0, f'compare exit {compare.returncode}: {compare.stderr}')
            with open(os.path.join(work, 'report', 'diffs.json')) as fh:
                diffs = json.load(fh)
            check(diffs.get('docs__same') == {}, f'an identical page reads identical: {diffs.get("docs__same")}')
            q = diffs.get('docs__quickstart', {})
            check(set(q) == {'headings', 'ids', 'text'}, f'quickstart differs in headings, ids and text only: {sorted(q)}')
            check('buttons' not in q, 'an ignored button is left out')
            check('canonical' not in q and 'jsonld' not in q, 'origins are stripped from head tags')
            broken = diffs.get('docs__broken', {})
            check('errors' in broken, f'error markers are reported: {sorted(broken)}')
            check(diffs.get('old') == q, 'a redirect is compared at the page it lands on')
            check(diffs.get('docs__missing') == {'status': [404, 404]}, f'a route that is not 200 on either side is flagged: {diffs.get("docs__missing")}')
            with open(os.path.join(work, 'before', 'old.html.json')) as fh:
                meta = json.load(fh)
            check(meta['status'] == 200 and meta['redirects'] == 1, f'fetch follows and counts redirects: {meta}')

            spec = importlib.util.spec_from_file_location('page_signature', os.path.join(HERE, 'page-signature.py'))
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            sig = mod.signature(before_pages['/docs/quickstart'])
            check(sig['headings'] == [('h1', 'quickstart', 'Quickstart'), ('h2', 'configure', 'Configure')], f'headings: {sig["headings"]}')
            check(sig['sidebar_links'] == ['/docs/quickstart', '/docs/config'], f'sidebar links, loopback origin stripped: {sig["sidebar_links"]}')
            check(sig['toc_links'] == ['#quickstart'], f'toc links: {sig["toc_links"]}')
            check(len(sig['pres']) == 1 and sig['pres'][0]['lines'] == 1, 'one code block with one line')
            check(sig['errors'] == [], 'a clean page has no error markers')
            cli = subprocess.run([sys.executable, os.path.join(HERE, 'page-signature.py'), '--help'], capture_output=True, text=True)
            check(cli.returncode == 0, 'page-signature.py --help exits 0')
    finally:
        before.shutdown()
        after.shutdown()

    if failures:
        for f in failures:
            print('FAIL', f)
        return 1
    print('page-signature and compare-signatures: all checks pass')
    return 0


if __name__ == '__main__':
    sys.exit(main())
