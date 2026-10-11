"""The pose lib/liuhui.js draws, and the checks, frame by frame (round 6).

A plan's layout puts three copies on the table (quarter turns of the print)
and slides the print's five pieces as one sheet from the page to its place
(slide: dx, dy page px over t0..t0+dur, ease etrap), turning the sheet by phi
about its centroid (cx, cy) on the way (round 6). Then every piece
moves on one cubic path from its parted seat (slid, for the print's) to its
slot: control points a1 and a2 of the way along the chord, bent sideways by
n1, n2 page px; one ease (sine.inOut); it turns in the page plane inside the
window rs..re of its move, and the fit from the print to the exact figure goes
with the turn. Optional fields:
  pv       the corner the piece follows its path by and turns about (a piece
           that tips over); its centroid otherwise
  hv td dd a half that closes in the air ends its move hv page px above its
           slot, waits for its partner, and drops with it over td..td+dd
Change one side, change the other (lib/liuhui.js pose())."""
import math
from geo import U, P, apply, wrap

FIG = [P['T'], P['BL'], P['R']]   # the printed triangle on the page


def esine(u):
    u = min(1.0, max(0.0, u))
    return -(math.cos(math.pi * u) - 1) / 2


def etrap(u, k=0.25):
    """the print's slide: sine ramps over the first and last k of the move and
    an even speed between; its peak speed is trap_peak(k) times the mean"""
    u = min(1.0, max(0.0, u))
    v = 1.0 / (1.0 - k)
    a = k * v * 2 / math.pi
    n = 2 * a + (1 - 2 * k) * v
    if u < k:
        return a * (1 - math.cos(math.pi / 2 * u / k)) / n
    if u > 1 - k:
        return (n - a * (1 - math.cos(math.pi / 2 * (1 - u) / k))) / n
    return (a + (u - k) * v) / n


def trap_peak(k=0.25):
    v = 1.0 / (1.0 - k)
    a = k * v * 2 / math.pi
    return v / (2 * a + (1 - 2 * k) * v)


def bez3(p0, p1, p2, p3, w):
    a = (1 - w) ** 3; b = 3 * (1 - w) ** 2 * w; c = 3 * (1 - w) * w * w; d = w ** 3
    return (a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1])


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def area_signed(poly):
    n = len(poly)
    return sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n)) / 2


def _inter(p1, p2, a, b):
    x1, y1 = p1; x2, y2 = p2; x3, y3 = a; x4, y4 = b
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-12:
        return p2
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


def overlap(a, b):
    """area of two convex polygons' intersection"""
    ax0 = min(q[0] for q in a); ax1 = max(q[0] for q in a); ay0 = min(q[1] for q in a); ay1 = max(q[1] for q in a)
    bx0 = min(q[0] for q in b); bx1 = max(q[0] for q in b); by0 = min(q[1] for q in b); by1 = max(q[1] for q in b)
    if ax1 <= bx0 or bx1 <= ax0 or ay1 <= by0 or by1 <= ay0:
        return 0.0
    clipper = b if area_signed(b) >= 0 else b[::-1]
    out = list(a)
    n = len(clipper)
    for i in range(n):
        p, q = clipper[i], clipper[(i + 1) % n]
        inp = out
        out = []
        if not inp:
            break
        s = inp[-1]
        for e in inp:
            ein = cross(p, q, e) >= 0
            sin_ = cross(p, q, s) >= 0
            if ein:
                if not sin_:
                    out.append(_inter(s, e, p, q))
                out.append(e)
            elif sin_:
                out.append(_inter(s, e, p, q))
            s = e
    return abs(area_signed(out)) if len(out) >= 3 else 0.0


def end_of(p):
    """when a piece lands: the end of its move, or of its drop if it closes in the air"""
    if (p.get('hv') or 0.0) > 0:
        return p['td'] + p['dd']
    return p['t0'] + p['dur']


class Plan:
    def __init__(self, tris, pieces, slide=None, part=0.1, pd=0.1, ke=None):
        self.tris = tris
        self.pieces = pieces
        self.slide = slide
        # every piece's one ease: sine.inOut, or (ke) sine ramps over the
        # first and last ke of the move with an even speed between
        self.ease = esine if ke is None else (lambda u, k=ke: etrap(u, k))
        phi = slide.get('phi', 0.0) if slide else 0.0
        for P0 in pieces:
            T = tris[P0['tri']]
            O = T.v['O']
            c0 = P0['c0']
            v = (c0[0] - O[0], c0[1] - O[1]); l = math.hypot(*v) or 1
            pv = [v[0] / l * part * U, v[1] / l * part * U]
            if P0['col'] != 'huang':
                tip = T.v['T' if P0['col'] == 'zhu' else 'R']
                dg = (tip[0] - O[0], tip[1] - O[1]); dl = math.hypot(*dg)
                nx, ny = -dg[1] / dl, dg[0] / dl
                if (c0[0] - O[0]) * nx + (c0[1] - O[1]) * ny < 0:
                    nx, ny = -nx, -ny
                pv = [pv[0] + nx * pd * U, pv[1] + ny * pd * U]
            P0['part'] = pv
            th = P0['th']
            M = P0['M']
            co, si = math.cos(-th), math.sin(-th)
            A = M[:4]
            P0['Fm'] = [co * A[0] - si * A[1], si * A[0] + co * A[1], co * A[2] - si * A[3], si * A[2] + co * A[3]]
            hg = T.v[P0['pv']] if P0.get('pv') else c0
            P0['hinge'] = hg
            P0['H1'] = apply(M, hg)
            # the turn a piece makes on its own: for the print's, what is left
            # after the sheet's turn on its slide
            P0['res'] = wrap(th - phi) if (slide and P0['tri'] == 'a0') else th

    def sheet(self, t):
        """the print's sheet on its slide at time t: (w, angle, offset)"""
        s = self.slide
        w = etrap((t - s['t0']) / s['dur'], s.get('k', 0.25))
        return w, s.get('phi', 0.0) * w, (s['dx'] * w, s['dy'] * w)

    def seat(self, P0, t, pk=1.0):
        """where a piece's hinge lies before its own move (after the parting
        and, for the print's, carried by the sheet), and the sheet's angle"""
        q = (P0['hinge'][0] + P0['part'][0] * pk, P0['hinge'][1] + P0['part'][1] * pk)
        s = self.slide
        if not s or P0['tri'] != 'a0':
            return q, 0.0
        w, a, d = self.sheet(t)
        cx, cy = s.get('cx', 0.0), s.get('cy', 0.0)
        co, si = math.cos(a), math.sin(a)
        x, y = q[0] - cx, q[1] - cy
        return (cx + co * x - si * y + d[0], cy + si * x + co * y + d[1]), a

    def slide_off(self, P0, t):
        """how far the sheet has carried a piece's hinge (compatibility)"""
        q, a = self.seat(P0, t, 1.0)
        return (q[0] - P0['hinge'][0] - P0['part'][0], q[1] - P0['hinge'][1] - P0['part'][1])

    def sliding(self, P0, t):
        s = self.slide
        return bool(s) and P0['tri'] == 'a0' and s['t0'] < t < s['t0'] + s['dur']

    def moving(self, P0, t):
        return P0['t0'] < t < end_of(P0) or self.sliding(P0, t)

    def pose(self, P0, t, pk=1.0):
        u = min(1.0, max(0.0, (t - P0['t0']) / P0['dur']))
        E = self.ease
        w = E(u)
        rs, re = P0.get('rs', 0.0), P0.get('re', 1.0)
        r = E((u - rs) / max(1e-9, re - rs))
        H0, a = self.seat(P0, t, pk)
        hv = P0.get('hv') or 0.0
        H1 = P0['H1'] if hv <= 0 else (P0['H1'][0], P0['H1'][1] - hv)
        dx, dy = H1[0] - H0[0], H1[1] - H0[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        n1, n2 = P0.get('n1', 0.0), P0.get('n2', 0.0)
        a1 = P0.get('a1'); a2 = P0.get('a2')
        a1 = 1.0 / 3 if a1 is None else a1
        a2 = 2.0 / 3 if a2 is None else a2
        c1 = (H0[0] + dx * a1 + nx * n1, H0[1] + dy * a1 + ny * n1)
        c2 = (H0[0] + dx * a2 + nx * n2, H0[1] + dy * a2 + ny * n2)
        H = bez3(H0, c1, c2, H1, w)
        uo = u
        if hv > 0:
            v = min(1.0, max(0.0, (t - P0['td']) / P0['dd']))
            H = (H[0], H[1] + hv * E(v))
            uo = min(1.0, max(0.0, (t - P0['t0']) / (P0['td'] + P0['dd'] - P0['t0'])))
        th = a + P0['res'] * r
        co, si = math.cos(th), math.sin(th)
        F = P0['Fm']
        Fv = [1 + (F[0] - 1) * r, F[1] * r, F[2] * r, 1 + (F[3] - 1) * r]
        Lm = [co * Fv[0] - si * Fv[1], si * Fv[0] + co * Fv[1], co * Fv[2] - si * Fv[3], si * Fv[2] + co * Fv[3]]
        hx, hy = P0['hinge']
        Mx = [Lm[0], Lm[1], Lm[2], Lm[3], H[0] - (Lm[0] * hx + Lm[2] * hy), H[1] - (Lm[1] * hx + Lm[3] * hy)]
        return Mx, uo, H, th

    def polys(self, t):
        out = []
        for P0 in self.pieces:
            M, u, H, th = self.pose(P0, t)
            out.append(([apply(M, q) for q in P0['poly0']], u, P0, H, th))
        return out


def evaluate(plan, sc, t0, t1, fps=30, detail=False, vcap=1300.0, wcap=220.0):
    """overlap of every moving piece with anything (screen px^2 s): moving
    over moving (mm), over landed (ml), over resting (mr), a copy's piece over
    the printed figure (mf); the largest single overlap; peak speed and turn
    rate, and how far they pass the caps."""
    n = int(round((t1 - t0) * fps))
    tot = dict(mm=0.0, ml=0.0, mr=0.0, mf=0.0)
    peak = vmax = wmax = vpen = wpen = 0.0
    ev = []
    prev = None
    for i in range(n + 1):
        t = t0 + i / fps
        cur = plan.polys(t)
        st = ['m' if plan.moving(c[2], t) else ('l' if c[1] >= 1 else 'r') for c in cur]
        for a in range(len(cur)):
            if st[a] != 'm':
                continue
            pa, Pa = cur[a][0], cur[a][2]
            if Pa['tri'] != 'a0':
                o = overlap(pa, FIG) * sc * sc
                if o > 0.5:
                    tot['mf'] += o / fps
                    if detail:
                        ev.append((round(t, 4), 'mf', Pa['tri'] + '.' + Pa['kind'], 'figure', round(o)))
            for b in range(len(cur)):
                if b == a or (st[b] == 'm' and b < a):
                    continue
                Pb = cur[b][2]
                if Pa['tri'] == 'a0' and Pb['tri'] == 'a0' and plan.sliding(Pa, t) and plan.sliding(Pb, t):
                    continue
                o = overlap(pa, cur[b][0]) * sc * sc
                if o <= 0.5:
                    continue
                peak = max(peak, o)
                k = 'm' + st[b]
                tot[k] += o / fps
                if detail:
                    ev.append((round(t, 4), k, Pa['tri'] + '.' + Pa['kind'], Pb['tri'] + '.' + Pb['kind'], round(o)))
        if prev is not None:
            for c, q in zip(cur, prev):
                v = math.dist(c[3], q[3]) * sc * fps
                w = abs(c[4] - q[4]) * 180 / math.pi * fps
                vmax = max(vmax, v); wmax = max(wmax, w)
                vpen += max(0.0, v - vcap) / fps
                wpen += max(0.0, w - wcap) / fps
        prev = cur
    out = dict(tot, peak=peak, vmax=vmax, wmax=wmax, vpen=vpen, wpen=wpen, plan=plan)
    if detail:
        out['events'] = ev
    return out


def path_len(pl, p, n=48):
    L = 0.0
    prev = None
    e = end_of(p)
    for k in range(n + 1):
        t = p['t0'] + (e - p['t0']) * k / n
        M, u, H, th = pl.pose(p, t)
        if prev is not None:
            L += math.dist(H, prev)
        prev = H
    return L
