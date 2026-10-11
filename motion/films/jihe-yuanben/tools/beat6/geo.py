"""Beat 6 geometry (round 4): the print, the copies, the strip and its slots.

Page px, y down. The print's corners are measured (the inner edge of the
outline); its inner points are where the exact 6-8-10 figure puts them under
the print's own grid (cells 216.42 px wide, 198.69 px tall), so every piece is
fitted to the exact figure by the same stretch (+-4.3 percent at U = 207.2).
lib/liuhui.js computes the same points."""
import math, itertools
import numpy as np

U = 207.2
# the frame's span for the strip and the print: the strip from x 120 (the
# letterbox safe area's left edge), the print's right corner up to x 1890
FRAME_X = (120.0, 1890.0)
BL0 = (1188.0, 2410.0)
EX = (2486.5 - 1188.0) / 6.0
EY = (2410.0 - 820.5) / 8.0
EXACT = dict(T=(0, -8), BL=(0, 0), R=(6, 0), O=(2, -2), Lt=(0, -2), Bt=(2, 0), Ht=(3.6, -3.2))
P = {k: (BL0[0] + EX * v[0], BL0[1] + EY * v[1]) for k, v in EXACT.items()}
PW, PH = P['R'][0] - P['BL'][0], P['BL'][1] - P['T'][1]
KIND = {
    'zhuL': dict(col='zhu', poly=['T', 'Lt', 'O'], tri=['Lt', 'T', 'O']),
    'zhuR': dict(col='zhu', poly=['T', 'O', 'Ht'], tri=['Ht', 'T', 'O']),
    'qingL': dict(col='qing', poly=['R', 'Bt', 'O'], tri=['Bt', 'R', 'O']),
    'qingR': dict(col='qing', poly=['R', 'O', 'Ht'], tri=['Ht', 'R', 'O']),
    'huang': dict(col='huang', poly=['BL', 'Bt', 'O', 'Lt'], tri=['BL', 'Bt', 'Lt']),
}


def area_centroid(poly):
    a = cx = cy = 0.0
    n = len(poly)
    for i in range(n):
        x0, y0 = poly[i]
        x1, y1 = poly[(i + 1) % n]
        c = x0 * y1 - x1 * y0
        a += c
        cx += (x0 + x1) * c
        cy += (y0 + y1) * c
    a *= 0.5
    return (cx / (6 * a), cy / (6 * a))


def hand(tri):
    (x0, y0), (x1, y1), (x2, y2) = tri
    return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0)


def affine(src, dst):
    A, b = [], []
    for (x, y), (u, v) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0]); b.append(u)
        A.append([0, 0, 0, x, y, 1]); b.append(v)
    s = np.linalg.solve(np.array(A, float), np.array(b, float))
    return [s[0], s[3], s[1], s[4], s[2], s[5]]  # a b c d e f (canvas order)


def apply(m, q):
    return (m[0] * q[0] + m[2] * q[1] + m[4], m[1] * q[0] + m[3] * q[1] + m[5])


def ang(a, b):
    return math.atan2(b[1] - a[1], b[0] - a[0])


def wrap(a):
    return math.atan2(math.sin(a), math.cos(a))


class Tri:
    """The print (rot 0, printed) or a copy turned rot degrees (clockwise on
    screen, quarter turns); x0, y0 the top left of its box."""

    def __init__(self, name, rot, x0, y0, printed=False):
        self.name, self.rot, self.printed = name, rot % 360, printed
        self.x0, self.y0 = x0, y0
        bx, by = P['BL'][0], P['T'][1]
        th = math.radians(self.rot)
        co, si = round(math.cos(th)), round(math.sin(th))
        rotp = {k: (co * (q[0] - bx) - si * (q[1] - by), si * (q[0] - bx) + co * (q[1] - by)) for k, q in P.items()}
        mx = min(v[0] for v in rotp.values()); my = min(v[1] for v in rotp.values())
        self.v = {k: (v[0] - mx + x0, v[1] - my + y0) for k, v in rotp.items()}
        self.w = max(v[0] for v in rotp.values()) - mx
        self.h = max(v[1] for v in rotp.values()) - my

    def poly(self, kind):
        return [self.v[n] for n in KIND[kind]['poly']]

    def tri(self, kind):
        return [self.v[n] for n in KIND[kind]['tri']]


def rect_halves(x0, y0, w, h, chir):
    """the two halves of a rectangle cut on the diagonal whose triangles have
    the given handedness, each as (right-angle corner, long-leg end, short-leg end)"""
    TL, TR, BR, BLc = (x0, y0), (x0 + w, y0), (x0 + w, y0 + h), (x0, y0 + h)
    for diag in ('TRBL', 'TLBR'):
        tris = [(TL, TR, BLc), (BR, BLc, TR)] if diag == 'TRBL' else [(TR, TL, BR), (BLc, BR, TL)]
        hs = []
        for c, p1, p2 in tris:
            if math.dist(c, p1) < math.dist(c, p2):
                p1, p2 = p2, p1
            hs.append([c, p1, p2])
        if (hand(hs[0]) > 0) == (chir > 0):
            return hs
    raise ValueError


def chir(kind):
    return hand([P[n] for n in KIND[kind]['tri']])


def piece_to(T, kind, slot_tri, slotid):
    tri = T.tri(kind)
    M = affine(tri, slot_tri)
    th = wrap(ang(slot_tri[0], slot_tri[1]) - ang(tri[0], tri[1]))
    poly = [apply(M, q) for q in T.poly(kind)]
    return dict(tri=T.name, kind=kind, col=KIND[kind]['col'], slot=slotid, M=M, th=th,
                c0=area_centroid(T.poly(kind)), c1=area_centroid(poly), poly0=T.poly(kind), poly1=poly,
                slot_tri=[tuple(q) for q in slot_tri])


def stretch(p):
    """principal stretches of a piece's fit (print to exact)"""
    s = np.linalg.svd(np.array([[p['M'][0], p['M'][2]], [p['M'][1], p['M'][3]]]), compute_uv=False)
    return float(s.min()), float(s.max())


# ------------------------------------------------------------------ the layout
def layout(cells, rots, right_px, GV=120.0, dy=0.0):
    """The strip left of the page, its lower edge dy above the print's base;
    the copies above it at the given strip cells (left edge of each box), the
    last copy's box ending at right_px. The frame's scale s is set by the
    strip and the print."""
    widths = [PW if r in (0, 180) else PH for r in rots]
    RX = right_px - (cells[-1] * U + widths[-1])
    RY = 2410.0 - 4 * U - dy
    s = (FRAME_X[1] - FRAME_X[0]) / ((P['R'][0] + 8) - (RX - 8))
    T = {'a0': Tri('a0', 0, P['BL'][0], P['T'][1], printed=True)}
    for i, (r, c) in enumerate(zip(rots, cells)):
        h = PH if r in (0, 180) else PW
        T['c%d' % (i + 1)] = Tri('c%d' % (i + 1), r, RX + c * U, RY - GV - h)
    return dict(T=T, RX=RX, RY=RY, s=s, SXE=RX + 24 * U, G=P['BL'][0] - (RX + 24 * U))


def bottom_orders():
    """lower-row sequences of 4 黃 (H, 2 wide) and 4 青 (Q, 4 wide) with cut
    points at 6 and 14 (brackets 6 | 8 | 10)."""
    out = set()
    for seq in set(itertools.permutations('HHHHQQQQ')):
        x = 0; cuts = {0}
        for c in seq:
            x += 2 if c == 'H' else 4
            cuts.add(x)
        if 6 in cuts and 14 in cuts:
            out.add(seq)
    return sorted(out)
