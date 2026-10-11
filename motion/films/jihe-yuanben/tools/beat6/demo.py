"""Beat 6 planner (round 8): one demonstration, then the strip prints in place.

Only two pieces move in the beat. After the cut, two 朱 halves close into the
朱 rectangle at the strip's left end (倒順相補). Round 8 takes them from two
copies that lie low over that end, each with its 朱 kite at its bottom: a
copy turned a half (◥, the print upside down) above the slot, and a copy
turned a quarter the other way (◢, lying on its long leg) to the right of it.
The ◥'s half on its long side drops down and in to the rectangle's lower
half, turning 51 degrees; the ◢'s half on its long side slides left along the
strip's top into the upper half, turning 39 degrees. Each turns about its own
centroid, inside its move, with one ease. Every other small rectangle then
prints in its slot in reading order (the upper row left to right, then the
lower row) while its source halves light up in the triangles and go. Nothing
else travels, and the cut does not part the pieces.

Why this pair (round 8, NOTES.md): two halves close along their kite
diagonal, which faces into their own triangle, so each has to leave through
its outer edge. With the strip under the copies, a rectangle's upper half can
come from above or from the side its long leg points to, and its lower half
only from below or from the other side, or from above before the upper half
is there. A ◢'s 朱 halves lie on its bottom edge and the foot of its long
side; a ◥'s on the foot of its right leg and its long side. The ◥'s long-side
half leaves down and to the left and the ◢'s leaves to the left, so the pair
closes from two sides with turns of 51 and 39 degrees; it ranks first of the
pairs `demo.py scan` tries (paper crossed, path and turn), and round 7's ◣ and
◤ ninth (NOTES.md, Round 8).

A plan (JSON, tools/beat6/plan.json) holds
  layout   the three copies: [rot, x, y], rot in degrees clockwise from the
           print (0 ◣, 90 ◤, 180 ◥, 270 ◢), x, y the lower left of the
           copy's box in strip cells (x from the strip's left end, y up from
           its base)
  part     how far the cut parts the pieces (0 in round 8: the cut is the
           hairline and the cut lines alone)
  ke       the demonstration's one ease: sine ramps over the first and last
           ke of the move (0.5 is sine.inOut)
  demo     t0, dur, the slot rectangle's kind (zhuL or zhuR: which diagonal
           it is cut on) and the two moving halves: tri, kind, role (the half
           of the slot rectangle it becomes: UL LR or UR LL), a1 n1 a2 n2
           (path bends, page px), rs re (turn window); each turns about its
           centroid
  sources  for every other rectangle, the kind of its halves and the
           triangles they come from (one triangle for a 黃 square)
  print    t0 (the first rectangle), gap, dur (each rectangle's reveal),
           rise, hold, go (a source's light: up over rise, held, then gone
           over go), lift (how far the light lightens a source), ghostC (the
           print's colour left once used)
  measure  t0, dur (the brush's one set)

   python3 demo.py scan                         which pair, and where (prints the best of each kind)
   python3 demo.py optimise plan.json out.json <iters> <seed> [fine]
   python3 demo.py check plan.json              the numbers at 60 fps
The pose is sim.Plan's (lib/liuhui.js pose()); embed.py writes the plan into
the page and report.py prints its numbers."""
import sys, json, math, random, itertools
from geo import *
import plan as PL, sim

SC = PL.SC

# The strip: four 朱 rectangles above (6 cells by 2), below 黃 青 黃 青 黃 青 黃 青
# (squares of 2, rectangles of 4 by 2), so the brackets 6, 8, 10 end on seams.
RECTS = {
    'Z0': (0, 1, 6), 'Z6': (6, 1, 6), 'Z12': (12, 1, 6), 'Z18': (18, 1, 6),
    'H0': (0, 0, 2), 'Q2': (2, 0, 4), 'H6': (6, 0, 2), 'Q8': (8, 0, 4),
    'H12': (12, 0, 2), 'Q14': (14, 0, 4), 'H18': (18, 0, 2), 'Q20': (20, 0, 4),
}
ORDER = ['Z6', 'Z12', 'Z18', 'H0', 'Q2', 'H6', 'Q8', 'H12', 'Q14', 'H18', 'Q20']
GLY = {0: '◣', 90: '◤', 180: '◥', 270: '◢'}


def tris_of(L):
    T = {'a0': Tri('a0', 0, P['BL'][0], P['T'][1], printed=True)}
    for i, (rot, x, y) in enumerate(L['copies']):
        T['c%d' % (i + 1)] = PL.make_tri('c%d' % (i + 1), rot, x, y)
    return T


def halves(kind, name):
    """the slot rectangle's two halves for this kind, by role (UL, LR, UR, LL)"""
    x0, row, w = RECTS[name]
    px, py = PL.page(x0, 2 * row + 2)
    out = {}
    for c, p1, p2 in rect_halves(px, py, w * U, 2 * U, chir(kind)):
        r = ('U' if abs(c[1] - py) < 1e-6 else 'L') + ('L' if abs(c[0] - px) < 1e-6 else 'R')
        out[r] = [tuple(c), tuple(p1), tuple(p2)]
    return out


def square(T, name, sq):
    """the 黃 square's slot, its corners in the piece's order, the smallest turn"""
    x0, row, w = RECTS[sq]
    px, py = PL.page(x0, 2 * row)
    C = [(px, py - 2 * U), (px + 2 * U, py - 2 * U), (px + 2 * U, py), (px, py)]
    best = None
    for i in range(4):
        for j, kk in (((i + 1) % 4, (i + 3) % 4), ((i + 3) % 4, (i + 1) % 4)):
            st = [C[i], C[j], C[kk]]
            if (hand(st) > 0) != (chir('huang') > 0):
                continue
            q = piece_to(T[name], 'huang', st, None)
            if best is None or abs(q['th']) < best[0]:
                best = (abs(q['th']), st)
    return best[1]


def assign(d):
    """every piece's slot: the demonstration's two by their roles, every other
    pair of halves by the roles that give the smaller turns (nothing else
    travels, so this only sets how each printed half lies in its rectangle)"""
    T = tris_of(d['layout'])
    D = d['demo']
    out = []
    hs = halves(D['kind'], 'Z0')
    for q in D['pieces']:
        out.append(dict(tri=q['tri'], kind=q['kind'], item='Z0', slot=[list(v) for v in hs[q['role']]], demo=True))
    for name in (ORDER if 'sources' in d else []):
        src = d['sources'][name]
        if src[0] == 'huang':
            out.append(dict(tri=src[1], kind='huang', item=name, slot=[list(v) for v in square(T, src[1], name)]))
            continue
        kind, a, b = src
        hs = halves(kind, name)
        best = None
        roles = list(hs)
        for ra in roles:
            rb = [r for r in roles if r != ra][0]
            pa = piece_to(T[a], kind, hs[ra], None)
            pb = piece_to(T[b], kind, hs[rb], None)
            m = max(abs(pa['th']), abs(pb['th']))
            if best is None or m < best[0] - 1e-9:
                best = (m, ra, rb)
        out.append(dict(tri=a, kind=kind, item=name, slot=[list(v) for v in hs[best[1]]]))
        out.append(dict(tri=b, kind=kind, item=name, slot=[list(v) for v in hs[best[2]]]))
    return out


def offset_convex(poly, m):
    """a convex polygon grown by m page px along every edge's normal"""
    n = len(poly)
    s = 1.0 if sim.area_signed(poly) > 0 else -1.0
    lines = []
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = s * dy / L, -s * dx / L
        lines.append(((p[0] + nx * m, p[1] + ny * m), (q[0] + nx * m, q[1] + ny * m)))
    return [sim._inter(*lines[i - 1], *lines[i]) for i in range(n)]


def bbox(poly):
    return (min(q[0] for q in poly), min(q[1] for q in poly), max(q[0] for q in poly), max(q[1] for q in poly))


def apart(a, b):
    return a[2] <= b[0] or b[2] <= a[0] or a[3] <= b[1] or b[3] <= a[1]


def layout_ok(T, need=4.3, gap=0.34, top=13.0):
    """every copy inside the window's band for them (above the strip, under
    top, inside the frame's left edge and left of the page), and apart"""
    cs = [t for t in T.values() if not t.printed]
    for t in cs:
        cl = [PL.cell(t.v[k]) for k in ('T', 'BL', 'R')]
        if min(c[1] for c in cl) < need - 1e-6 or max(c[1] for c in cl) > top + 1e-6:
            return False
        if min(c[0] for c in cl) < -1.2 - 1e-6 or max(c[0] for c in cl) > 22.2 + 1e-6:
            return False
    for a, b in itertools.combinations(cs, 2):
        A = [a.v['T'], a.v['BL'], a.v['R']]
        B = [b.v['T'], b.v['BL'], b.v['R']]
        if sim.overlap(offset_convex(A, gap * U / 2), offset_convex(B, gap * U / 2)) > 1e-6:
            return False
    return True


class Demo:
    """the two moving halves (sim.Plan poses, about their centroids) against
    the eighteen resting pieces and each other"""

    def __init__(self, d):
        self.d = d
        self.T = T = tris_of(d['layout'])
        D = d['demo']
        slots = {(q['tri'], q['kind']): q for q in assign(d) if q.get('demo')}
        ps = []
        for q in D['pieces']:
            p = piece_to(T[q['tri']], q['kind'], [tuple(v) for v in slots[(q['tri'], q['kind'])]['slot']], None)
            p.update({k: v for k, v in q.items() if k not in ('tri', 'kind')})
            p.update(t0=D['t0'], dur=D['dur'])
            ps.append(p)
        self.ps = ps
        part = d.get('part', 0.0)
        self.pl = sim.Plan(T, ps, None, part=part, pd=part, ke=d.get('ke'))
        moving = {(q['tri'], q['kind']) for q in D['pieces']}
        rest = []
        for n, t in T.items():
            for kind in KIND:
                if (n, kind) in moving:
                    continue
                q = piece_to(t, kind, t.tri(kind), None)
                q.update(t0=1e9, dur=1.0)
                rest.append(q)
        rp = sim.Plan(T, rest, None, part=part, pd=part, ke=d.get('ke'))
        for q in rest:
            if q['tri'] == 'a0':
                q['part'] = [0.0, 0.0]   # the print's pieces stay whole on the page
        self.static = []
        for q in rest:
            M, u, H, th = rp.pose(q, 0.0)
            poly = [apply(M, v) for v in q['poly0']]
            self.static.append((q['tri'] + '.' + q['kind'], KIND[q['kind']]['col'], poly, bbox(poly)))

    def evaluate(self, fps=60, detail=False):
        """paper over paper (screen px2 s): over a resting piece of its own
        colour (same) or another (other), the two over each other (mm); the
        centroid's path and every corner's (tip, the longest), peak speed and
        turn rate; how far a half goes past its slot (past: below the upper
        row's floor or left of the strip's end)"""
        D = self.d['demo']
        n = int(round(D['dur'] * fps))
        same = other = mm = past = peak = vmax = wmax = 0.0
        ev = {}
        prev = None
        cpath = [0.0] * len(self.ps)
        floor = PL.BASE - 2 * U
        for i in range(n + 1):
            t = D['t0'] + D['dur'] * i / n
            cur = []
            for p in self.ps:
                M, u, H, th = self.pl.pose(p, t)
                cur.append(([apply(M, v) for v in p['poly0']], H, th))
            for k, (poly, H, th) in enumerate(cur):
                bb = bbox(poly)
                past += (max(0.0, bb[3] - floor - 0.5) + max(0.0, (PL.RX - 0.5) - bb[0])) * SC / fps
                col = self.ps[k]['col']
                for name, c2, sp, sb in self.static:
                    if apart(bb, sb):
                        continue
                    o = sim.overlap(poly, sp) * SC * SC
                    if o < 0.5:
                        continue
                    peak = max(peak, o)
                    if c2 == col:
                        same += o / fps
                    else:
                        other += o / fps
                    if detail:
                        e = ev.setdefault((self.ps[k]['tri'] + '.' + self.ps[k]['kind'], name), [0.0, 0.0, t, t])
                        e[0] += o / fps; e[1] = max(e[1], o); e[3] = t
            if i < n:
                o = sim.overlap(cur[0][0], cur[1][0]) * SC * SC
                if o > 0.5:
                    mm += o / fps
                    peak = max(peak, o)
                    if detail:
                        e = ev.setdefault(('pair', 'each other'), [0.0, 0.0, t, t])
                        e[0] += o / fps; e[1] = max(e[1], o); e[3] = t
            if prev is not None:
                for k, (c, q) in enumerate(zip(cur, prev)):
                    dd = math.dist(c[1], q[1]) * SC
                    cpath[k] += dd
                    vmax = max(vmax, dd * fps)
                    wmax = max(wmax, abs(c[2] - q[2]) * 180 / math.pi * fps)
            prev = cur
        tip = []
        for p in self.ps:
            best = 0.0
            for vi in range(len(p['poly0'])):
                L = 0.0
                pv = None
                for i in range(n + 1):
                    M, u, H, th = self.pl.pose(p, D['t0'] + D['dur'] * i / n)
                    q = apply(M, p['poly0'][vi])
                    if pv is not None:
                        L += math.dist(q, pv) * SC
                    pv = q
                best = max(best, L)
            tip.append(best)
        chord = [math.dist(p['hinge'], p['H1']) * SC for p in self.ps]
        turn = [abs(math.degrees(p['th'])) for p in self.ps]
        r = dict(same=same, other=other, mm=mm, past=past, peak=peak, vmax=vmax, wmax=wmax, cpath=cpath, tip=tip, chord=chord, turn=turn)
        if detail:
            r['events'] = ev
        return r

    def cost(self, fps=30):
        r = self.evaluate(fps)
        bend = sum(max(0.0, cp / max(ch, 1) - 1.06) for cp, ch in zip(r['cpath'], r['chord']))
        shape = sum(abs(q.get('a1', 1 / 3) - 1 / 3) + abs(q.get('a2', 2 / 3) - 2 / 3) for q in self.d['demo']['pieces'])
        c = (400 * (r['same'] + r['mm']) + 100 * r["other"] + 3000 * r["past"] + sum(r['cpath']) + 1.5 * max(r['cpath'])
             + 0.5 * sum(r['tip']) + 800 * bend + 30 * shape
             + 25 * max(0.0, r["vmax"] - 560) + 6 * max(0.0, r["wmax"] - 160))
        r['cost'] = c
        return c, r


RANGE = dict(n1=(-700.0, 700.0), n2=(-700.0, 700.0), a1=(0.1, 0.6), a2=(0.4, 0.9), rs=(0.0, 0.5), re=(0.5, 1.0))


def optimise(d, iters, seed, fine=False, fps=30):
    """random walk on the two halves' path bends and turn windows"""
    R = random.Random(seed)
    qs = d['demo']['pieces']
    best, br = Demo(d).cost(fps)
    for it in range(iters):
        frac = 0.25 if it < iters * 0.4 else (0.1 if it < iters * 0.8 else 0.04)
        if fine:
            frac = 0.05 if it < iters * 0.5 else 0.02
        free = [i for i, q in enumerate(qs) if not q.get('fixed')]
        j = R.choice(free)
        snap = dict(qs[j])
        for _ in range(1 if R.random() < 0.7 else 2):
            k = R.choice(list(RANGE))
            lo, hi = RANGE[k]
            qs[j][k] = min(hi, max(lo, qs[j].get(k, (lo + hi) / 2) + R.gauss(0, (hi - lo) * frac * 0.5)))
        if qs[j]['re'] - qs[j]['rs'] < 0.35:
            qs[j].clear(); qs[j].update(snap); continue
        c, r = Demo(d).cost(fps)
        if c < best:
            best, br = c, r
        else:
            qs[j].clear(); qs[j].update(snap)
    return best, br


def scan():
    """every pair of 朱 halves that close Z0 with a turn of at most a quarter,
    each copy on a half-cell grid near the slot, straight paths: the best
    places for each kind of pair (the search behind round 8's choice)"""
    small = []
    for rot in (0, 90, 180, 270):
        T = PL.make_tri('c', rot, 0, 4.3)
        for kind in ('zhuL', 'zhuR'):
            for role, st in halves(kind, 'Z0').items():
                if abs(math.degrees(piece_to(T, kind, st, None)['th'])) <= 91:
                    small.append((rot, kind, role))
    out = []
    for a, b in itertools.product(small, small):
        if a[1] != b[1] or a[2] >= b[2]:
            continue
        hs = halves(a[1], 'Z0')
        best = None
        for xa, ya, xb, yb in itertools.product([x * 0.5 for x in range(-2, 18)], (4.3, 4.8), [x * 0.5 for x in range(-2, 18)], (4.3, 4.8)):
            d = dict(layout=dict(copies=[[a[0], xa, ya], [b[0], xb, yb]]), part=0.0, ke=0.4,
                     demo=dict(t0=0.0, dur=0.92, kind=a[1], pieces=[dict(tri='c1', kind=a[1], role=a[2]), dict(tri='c2', kind=b[1], role=b[2])]))
            T = tris_of(d['layout'])
            if not layout_ok(T):
                continue
            Dm = Demo(d)
            if max(math.dist(p['hinge'], p['H1']) for p in Dm.ps) * SC > 420:
                continue
            c, r = Dm.cost(fps=10)
            if best is None or c < best[0]:
                best = (c, (xa, ya), (xb, yb), r)
        if best:
            out.append((best[0], a, b, best))
    for c, a, b, (cc, pa, pb, r) in sorted(out):
        print('%6.0f  %s %s->%s at %s + %s %s->%s at %s  same %.0f other %.0f mm %.0f  path %s  turn %s' % (
            c, GLY[a[0]], a[1], a[2], pa, GLY[b[0]], b[1], b[2], pb, r['same'], r['other'], r['mm'],
            [round(v) for v in r['cpath']], [round(v) for v in r['turn']]))


def times(d):
    """the print schedule: each rectangle's time, in reading order"""
    p = d['print']
    return {name: round(p['t0'] + i * p['gap'], 4) for i, name in enumerate(ORDER)}


def stretch_all(d):
    T = tris_of(d['layout'])
    lo, hi = 9.0, 0.0
    for q in assign(d):
        s = stretch(piece_to(T[q['tri']], q['kind'], [tuple(v) for v in q['slot']], None))
        lo, hi = min(lo, s[0]), max(hi, s[1])
    return lo, hi


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'scan':
        scan()
        sys.exit()
    d = json.load(open(sys.argv[2]))
    if cmd == 'optimise':
        fine = 'fine' in sys.argv[6:]
        c, r = optimise(d, int(sys.argv[4]), int(sys.argv[5]), fine=fine, fps=60 if fine else 30)
        json.dump(d, open(sys.argv[3], 'w'), indent=1)
        print(round(c), {k: round(v, 2) for k, v in r.items() if isinstance(v, float)}, 'path', [round(v) for v in r['cpath']], 'tip', [round(v) for v in r['tip']])
    elif cmd == 'check':
        r = Demo(d).evaluate(fps=60, detail=True)
        print({k: round(v, 2) for k, v in r.items() if isinstance(v, float)}, 'path', [round(v) for v in r['cpath']], 'chord', [round(v) for v in r['chord']], 'tip', [round(v) for v in r['tip']], 'turn', [round(v) for v in r['turn']])
        print('stretch', stretch_all(d))
