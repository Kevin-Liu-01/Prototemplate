"""Beat 6 planner (round 6): layout, slots, groups, paths. Round 7 plans with
demo.py, which uses the helpers here (page, cell, make_tri, RX, RY, BASE, SC);
the commands below read a round-6 plan (the round-6 plan.json is kept as
plan-round6.json).

A plan (JSON) holds
  layout   the three copies (quarter turns rot, the box's lower-left corner
           x, y in strip cells: x from the strip's left end, y up from its
           base) and the print's slide (to x, y cells, the lower left of the
           sheet's box; t0, dur, k; rot, quarter turns the sheet makes on the
           way, 0 here)
  groups   name -> [t0, dur] or, for a group that closes in the air,
           [t0, dur, close]: its halves reach their hover points at
           t0 + close and drop together over the rest. Round 6 has two, p1
           (the left pair: c1, c2) and p2 (the right pair: c3 and the print)
  ke       the pieces' one ease: sine ramps over the first and last ke of
           each move (and turn) with an even speed between; sine.inOut if absent
  waves    optional 'group.wave' -> [t0, dur] or [t0, dur, close]: inside a
           group, the pieces of one wave start and end together (round 5
           used them; round 6 has none)
  pieces   per piece: tri, kind, slot (page px), group, wave, path controls
           a1 n1 a2 n2, turn window rs re; optional pv (pivot corner) and,
           in a closing group, hv (page px above the slot) and rect
Every piece of a wave (or of a group without waves) starts and ends with it.

  python3 plan.py assign <layout.json> <out.json>      slots for a layout
  python3 plan.py optimise <in.json> <out.json> <groups> <iters> <seed> [fine] [60]
  python3 plan.py check <plan.json>                    the numbers at 60 fps

Round 6's slots were assigned by hand per pair (each small rectangle takes
one half from each triangle of its pair) and its paths optimised from
straight lines with optimise ... and then optimise ... fine 60. The pose is
sim.Plan's, which is lib/liuhui.js pose(); embed.py writes the plan into the
page."""
import sys, json, math, random, time, itertools
from geo import *
import sim

RX, RY, BASE = -4682.46, 1581.2, 2410.0
SC = 0.24308            # screen px per page px at the end framing
TW, TH = PW / U, PH / U
PRINT_X = (P['BL'][0] - RX) / U
PAR = {k: [('c2', 'c1'), ('a0', 'c3')] for k in ('qingL', 'qingR', 'zhuL', 'zhuR')}


def page(x, y):
    return (RX + x * U, BASE - y * U)


def cell(q):
    return ((q[0] - RX) / U, (BASE - q[1]) / U)


def make_tri(name, rot, x, y, printed=False):
    h = TH if rot in (0, 180) else TW
    px, py = page(x, y + h)
    return Tri(name, rot, px, py, printed=printed)


def tris_of(L):
    T = {'a0': Tri('a0', 0, P['BL'][0], P['T'][1], printed=True)}
    for i, (rot, x, y) in enumerate(L['copies']):
        T['c%d' % (i + 1)] = make_tri('c%d' % (i + 1), rot, x, y)
    return T


def slide_of(L):
    """the print's slide: its sheet goes from the page to the box whose lower
    left is at strip cells x, y, turned rot quarter turns (clockwise on
    screen) about its centroid on the way"""
    s = L.get('slide')
    if not s:
        return None
    rot = s.get('rot', 0)
    P0 = [P['T'], P['BL'], P['R']]
    c0 = area_centroid(P0)
    T1 = make_tri('a0s', rot, s['x'], s['y'])
    c1 = area_centroid([T1.v['T'], T1.v['BL'], T1.v['R']])
    return dict(dx=c1[0] - c0[0], dy=c1[1] - c0[1], cx=c0[0], cy=c0[1], phi=math.radians(90 * rot),
                t0=s['t0'], dur=s['dur'], k=s.get('k', 0.25), rot=rot)


def apply_groups(d):
    WV = d.get('waves') or {}
    for q in d['pieces']:
        g = d['groups'][q['group']]
        w = WV.get('%s.%s' % (q['group'], q.get('wave', '')))
        q['t0'], q['dur'] = (w[0], w[1]) if w else (g[0], g[1])
        if (q.get('hv') or 0) > 0:
            gg = w if (w and len(w) > 2) else g
            q['t0'], q['dur'] = gg[0], gg[2]
            q['td'], q['dd'] = gg[0] + gg[2], gg[1] - gg[2]
        else:
            q.pop('td', None); q.pop('dd', None)
    return d


def load(d):
    """the plan's triangles, pieces (geo.piece_to plus the plan's fields) and sim.Plan"""
    apply_groups(d)
    T = tris_of(d['layout'])
    ps = []
    for q in d['pieces']:
        p = piece_to(T[q['tri']], q['kind'], [tuple(v) for v in q['slot']], None)
        for k, v in q.items():
            if k not in ('slot', 'tri', 'kind'):
                p[k] = v
        ps.append(p)
    return T, ps, sim.Plan(T, ps, slide_of(d['layout']), ke=d.get('ke'))


# ------------------------------------------------------------------ slots
def lower_slots(seq):
    out, x = [], 0
    for c in seq:
        out.append((c, x)); x += 2 if c == 'H' else 4
    return [x for c, x in out if c == 'Q'], [x for c, x in out if c == 'H']


def huang_slot(T, n, x0):
    px, py = page(x0, 0)
    C = [(px, py - 2 * U), (px + 2 * U, py - 2 * U), (px + 2 * U, py), (px, py)]
    ch = chir('huang')
    best = None
    for i in range(4):
        for j, kk in (((i + 1) % 4, (i + 3) % 4), ((i + 3) % 4, (i + 1) % 4)):
            st = [C[i], C[j], C[kk]]
            if (hand(st) > 0) != (ch > 0):
                continue
            p = piece_to(T[n], 'huang', st, None)
            if best is None or abs(p['th']) < best[0]:
                best = (abs(p['th']), st)
    return best[1]


def assign(L, force=PAR, wx=1.3, maxturn=math.radians(95)):
    """the lower-row sequence (seams at 6 and 14) and the slot of every piece
    that minimise the summed squared screen distances (sideways weighted wx),
    each small rectangle taking one half from each triangle of a forced pair;
    no piece turns more than a quarter"""
    T = tris_of(L)
    s = slide_of(L)
    A = [n for n, t in T.items() if t.rot == 0]
    B = [n for n, t in T.items() if t.rot != 0]
    def c0of(n, kind):
        c = area_centroid(T[n].poly(kind))
        return (c[0] + s['dx'], c[1] + s['dy']) if (n == 'a0' and s) else c
    memo = {}
    def ph(n, kind, x0, y0, w, hi):
        k = (n, kind, x0, y0, hi)
        if k not in memo:
            px, py = page(x0, y0 + 2)
            h = rect_halves(px, py, w * U, 2 * U, chir(kind))[hi]
            tri = T[n].tri(kind)
            th = wrap(ang(h[0], h[1]) - ang(tri[0], tri[1]))
            c0 = c0of(n, kind)
            c1 = ((h[0][0] + h[1][0] + h[2][0]) / 3, (h[0][1] + h[1][1] + h[2][1]) / 3)
            ddx, ddy = (c1[0] - c0[0]) * SC, (c1[1] - c0[1]) * SC
            memo[k] = (wx * ddx * ddx + ddy * ddy, dict(tri=n, kind=kind, slot=[list(v) for v in h]), abs(th))
        return memo[k]
    def rect(a, b, kind, x0, y0, w):
        best = None
        for ha in (0, 1):
            pa = ph(a, kind, x0, y0, w, ha); pb = ph(b, kind, x0, y0, w, 1 - ha)
            if max(pa[2], pb[2]) > maxturn:
                continue
            if best is None or pa[0] + pb[0] < best[0]:
                best = (pa[0] + pb[0], [pa[1], pb[1]])
        return best
    def pair(kind, r1, r2, y0, w):
        best = None
        for a in itertools.permutations(A):
            for b in itertools.permutations(B):
                m1, m2 = (a[0], b[0]), (a[1], b[1])
                if force and kind in force and set([m1, m2]) != set(map(tuple, force[kind])):
                    continue
                x = rect(m1[0], m1[1], kind, r1, y0, w); yv = rect(m2[0], m2[1], kind, r2, y0, w)
                if x is None or yv is None:
                    continue
                if best is None or x[0] + yv[0] < best[0]:
                    best = (x[0] + yv[0], x[1] + yv[1])
        return best
    def hcost(n, x0):
        c0 = c0of(n, 'huang'); c1 = page(x0 + 1, 1)
        ddx, ddy = (c1[0] - c0[0]) * SC, (c1[1] - c0[1]) * SC
        return wx * ddx * ddx + ddy * ddy
    zs = [0, 6, 12, 18]
    zbest = None
    for zl in itertools.combinations(zs, 2):
        zr = [z for z in zs if z not in zl]
        c1 = pair('zhuL', zl[0], zl[1], 2, 6); c2 = pair('zhuR', zr[0], zr[1], 2, 6)
        if c1 and c2 and (zbest is None or c1[0] + c2[0] < zbest[0]):
            zbest = (c1[0] + c2[0], c1[1] + c2[1])
    best = None
    for seq in [''.join(q) for q in bottom_orders()]:
        qs, hs = lower_slots(seq)
        hb = min((sum(hcost(n, x) for n, x in zip(perm, hs)), perm) for perm in itertools.permutations(list(T)))
        for ql in itertools.combinations(qs, 2):
            qr = [q for q in qs if q not in ql]
            c1 = pair('qingL', ql[0], ql[1], 0, 4); c2 = pair('qingR', qr[0], qr[1], 0, 4)
            if not (c1 and c2):
                continue
            tot = c1[0] + c2[0] + hb[0] + zbest[0]
            if best is None or tot < best[0]:
                hp = [dict(tri=n, kind='huang', slot=[list(v) for v in huang_slot(T, n, x)]) for n, x in zip(hb[1], hs)]
                best = (tot, seq, c1[1] + c2[1] + zbest[1] + hp)
    return best[1], best[2]


def assign_pairs(L, blocks=(('c1', 'c2', 0), ('c3', 'a0', 12))):
    """round 6: each pair (a ◤ on the left, a ◣ on the right) fills its own
    twelve cells of the strip, x0..x0+12: lower row 黃 青 黃 青 (the ◤'s 黃,
    the ◣'s qingR over the ◤'s qingR, the ◣'s 黃, the ◣'s qingL under the
    ◤'s qingL), upper row two 朱 (the ◤'s zhuL over the ◣'s zhuL, the ◤'s
    zhuR under the ◣'s zhuR). Returns the pieces with their slots."""
    T = tris_of(L)

    def half(kind, x0, row, w, role):
        px, py = page(x0, 2 * row + 2)
        for c, p1, p2 in rect_halves(px, py, w * U, 2 * U, chir(kind)):
            r = ('U' if abs(c[1] - py) < 1e-6 else 'L') + ('L' if abs(c[0] - px) < 1e-6 else 'R')
            if r == role:
                return [list(c), list(p1), list(p2)]
        raise ValueError((kind, role))

    def square(name, x0, row):
        px, py = page(x0, 2 * row)
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
        return [list(v) for v in best[1]]

    out = []
    for q_, p_, x in blocks:
        for name, kind, sl in (
                (q_, 'huang', square(q_, x, 0)), (p_, 'huang', square(p_, x + 6, 0)),
                (p_, 'qingR', half('qingR', x + 2, 0, 4, 'UL')), (q_, 'qingR', half('qingR', x + 2, 0, 4, 'LR')),
                (p_, 'qingL', half('qingL', x + 8, 0, 4, 'LL')), (q_, 'qingL', half('qingL', x + 8, 0, 4, 'UR')),
                (q_, 'zhuL', half('zhuL', x, 1, 6, 'UL')), (p_, 'zhuL', half('zhuL', x, 1, 6, 'LR')),
                (q_, 'zhuR', half('zhuR', x + 6, 1, 6, 'LL')), (p_, 'zhuR', half('zhuR', x + 6, 1, 6, 'UR'))):
            out.append(dict(tri=name, kind=kind, slot=[[round(a, 3), round(b, 3)] for a, b in sl]))
    return out


# ------------------------------------------------------------------ checks
def check(d, fps=60, window=None, detail=False, vcap=1300.0, wcap=220.0):
    T, ps, pl = load(d)
    if window is None:
        t0 = min([p['t0'] for p in ps] + ([pl.slide['t0']] if pl.slide else [])) - 0.02
        t1 = max(sim.end_of(p) for p in ps) + 0.02
    else:
        t0, t1 = window
    r = sim.evaluate(pl, SC, t0, t1, fps=fps, detail=detail, vcap=vcap, wcap=wcap)
    r['ps'] = ps
    return r


W = dict(ov=300.0, peak=40.0, v=25.0, w=25.0, ex=600.0, rise=60.0, below=600.0, out=3000.0)
EXFREE = {'zhu': 1.06}  # path over chord allowed free of cost (1.15 for other groups)
XL, XR = -2.45, 24.6    # strip cells: the window's left edge; a copy's piece stays off the page
RANGE = dict(n1=(-1500.0, 1500.0), n2=(-1500.0, 1500.0), a1=(-0.2, 1.2), a2=(-0.2, 1.2), rs=(0.0, 0.7), re=(0.3, 1.0))


def cost(d, group, fps=30, detail=False):
    g = d['groups'][group]
    r = check(d, fps=fps, window=(g[0] - 0.02, g[0] + g[1] + 0.02), detail=detail)
    pl = r['plan']
    ex = rise = below = out = 0.0
    ybot = BASE + 2.0
    for q, p in zip(d['pieces'], r['ps']):
        if q['group'] != group:
            continue
        Lp = sim.path_len(pl, p, 24)
        H0 = (p['hinge'][0] + p['part'][0], p['hinge'][1] + p['part'][1])
        o = pl.slide_off(p, 1e9)
        ch = math.dist((H0[0] + o[0], H0[1] + o[1]), p['H1'])
        ex += max(0.0, Lp / max(ch, 1.0) - EXFREE.get(group, 1.15))
        e = sim.end_of(p)
        prev = None
        for k in range(25):
            t = p['t0'] + (e - p['t0']) * k / 24
            M, u, H, th = pl.pose(p, t)
            my = max(apply(M, v)[1] for v in p['poly0'])
            below += max(0.0, my - ybot) * SC / 24
            xs = [cell(apply(M, v))[0] for v in p['poly0']]
            out += max(0.0, XL - min(xs)) / 24 + (max(0.0, max(xs) - XR) / 24 if p['tri'] != 'a0' else 0.0)
            if prev is not None:
                rise += max(0.0, prev[1] - H[1]) * SC
            prev = H
    ov = r['mm'] + r['ml'] + r['mr'] + r['mf']
    r.update(ex=ex, rise=rise, below=below, ov=ov, out=out)
    r['cost'] = (W['ov'] * ov + W['peak'] * r['peak'] + W['v'] * 50 * r['vpen'] + W['w'] * 50 * r['wpen']
                 + W['ex'] * ex + W['rise'] * rise + W['below'] * below + W['out'] * out)
    return r


def optimise(d, group, iters, seed, log=True, temp=0.0, fine=False, fps=30):
    """random walk on one group's path bends, turn windows, hover heights and
    close time; fine: small steps only (a polish of a plan that is nearly
    clear); fps: the sampling of the overlap check (60 for the last polish)"""
    R = random.Random(seed)
    ps = d['pieces']
    idx = [j for j, q in enumerate(ps) if q['group'] == group and not q.get('fixed')]
    g = d['groups'][group]
    best = cost(d, group, fps=fps)
    cur = best['cost']
    t0 = time.time()
    for it in range(iters):
        frac = 0.25 if it < iters * 0.4 else (0.1 if it < iters * 0.8 else 0.04)
        if fine:
            frac = 0.06 if it < iters * 0.5 else 0.025
        snap = [(j, dict(ps[j])) for j in idx]
        gsnap = list(g)
        mv = R.random()
        if len(g) > 2 and mv < 0.06:
            g[2] = min(g[1] - 0.12, max(0.2, g[2] + R.gauss(0, 0.05 * frac / 0.25)))
        elif mv < 0.12 and any((ps[j].get('hv') or 0) > 0 for j in idx):
            j = R.choice([j for j in idx if (ps[j].get('hv') or 0) > 0])
            nv = max(40.0, ps[j]['hv'] + R.gauss(0, 120 * frac / 0.25))
            for k in idx:
                if ps[k].get('rect') == ps[j].get('rect') and (ps[k].get('hv') or 0) > 0:
                    ps[k]['hv'] = nv
        else:
            j = R.choice(idx)
            q = ps[j]
            keys = list(RANGE) if q['kind'] != 'huang' else ['n1', 'n2', 'a1', 'a2']
            for _ in range(1 if R.random() < 0.7 else 2):
                key = R.choice(keys)
                lo, hi = RANGE[key]
                q[key] = min(hi, max(lo, q.get(key, (lo + hi) / 2) + R.gauss(0, (hi - lo) * frac * 0.5)))
            if q.get('re', 1) - q.get('rs', 0) < 0.3:
                for jj, old in snap:
                    ps[jj].clear(); ps[jj].update(old)
                continue
        r = cost(d, group, fps=fps)
        if r['cost'] < cur or (temp > 0 and R.random() < math.exp(-(r['cost'] - cur) / max(1e-9, temp * (1 - it / iters)))):
            cur = r['cost']
            if r['cost'] < best['cost']:
                best = r
                best['snap'] = ([(j, dict(ps[j])) for j in idx], list(g))
        else:
            for jj, old in snap:
                ps[jj].clear(); ps[jj].update(old)
            g[:] = gsnap
        if log and it % 300 == 0:
            print(group, it, round(best['cost']), 'ov %.1f mm %.1f ml %.1f mr %.1f mf %.1f peak %.0f v %.0f w %.0f ex %.2f rise %.1f' % (
                best['ov'], best['mm'], best['ml'], best['mr'], best['mf'], best['peak'], best['vmax'], best['wmax'], best['ex'], best['rise']),
                round(time.time() - t0), 's', flush=True)
    if 'snap' in best:
        for j, q in best['snap'][0]:
            ps[j].clear(); ps[j].update(q)
        g[:] = best['snap'][1]
    apply_groups(d)
    return best


def save(d, path):
    out = dict(d)
    out['pieces'] = [{k: v for k, v in q.items() if k not in ('t0', 'dur', 'td', 'dd')} for q in d['pieces']]
    json.dump(out, open(path, 'w'), indent=1)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'assign':
        spec = json.load(open(sys.argv[2]))
        seq, asg = assign(spec['layout'])
        d = dict(spec, seq=seq, pieces=[])
        for a in asg:
            q = dict(a, a1=1 / 3, n1=0.0, a2=2 / 3, n2=0.0, rs=0.0, re=1.0)
            q['group'] = spec['group_of'][KIND[a['kind']]['col']]
            d['pieces'].append(q)
        save(d, sys.argv[3])
        print('seq', seq)
    elif cmd == 'pairs':
        # pairs <layout.json> <out.json>: round 6's slots, straight paths,
        # groups p1 (c1, c2) and p2 (c3, a0) from the spec's 'groups'
        spec = json.load(open(sys.argv[2]))
        d = dict(spec, seq='HQHQHQHQ', pieces=[])
        for a in assign_pairs(spec['layout']):
            d['pieces'].append(dict(a, group='p2' if a['tri'] in ('c3', 'a0') else 'p1',
                                    a1=1 / 3, n1=0.0, a2=2 / 3, n2=0.0, rs=0.15, re=0.85))
        save(d, sys.argv[3])
    elif cmd == 'optimise':
        # optimise <in> <out> <groups> <iters> <seed> [fine] [60]
        d = json.load(open(sys.argv[2]))
        fine = 'fine' in sys.argv[7:]
        fps = 60 if '60' in sys.argv[7:] else 30
        if fps == 60:
            W['ov'], W['peak'] = 1200.0, 120.0
        for gname in sys.argv[4].split(','):
            optimise(d, gname, int(sys.argv[5]), int(sys.argv[6]), fine=fine, fps=fps)
        save(d, sys.argv[3])
    elif cmd == 'check':
        d = json.load(open(sys.argv[2]))
        r = check(d, fps=60, detail=True)
        print({k: round(v, 1) for k, v in r.items() if isinstance(v, float)})
