"""Write a beat 6 plan into lib/liuhui.js as its PLAN constant (round 8; v2 retimes it).

  python3 embed.py plan.json

Adds what the page needs beside the plan: the triangles in page px, every
piece's slot (demo.assign), the time each rectangle prints (demo.times) and
the box it prints across, the camera's end framing (fitted with the same
projection the page's camera uses; round 4's, since the strip and the print's
place are round 4's), the lamp, the measures. It checks that every copy lies
inside the window and clear of the measures. Nothing at render time reads
Python's output."""
import json, math, sys, re, os
from geo import U, P, PW, PH, FRAME_X
import plan as PL
import demo as DM

HERE = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(HERE, '..', '..', 'lib', 'liuhui.js')

T_CAM_END = 51.0   # round 8: the camera's one move ended here; v2 opens on the end framing (plan.json "tCamEnd", the shot's start)
PUSH = 1.025       # v2 fix round: the shot opens this much wider than the end framing and pushes in onto it
SAFE = (FRAME_X[0], FRAME_X[1], 30, 786)
NOTE_TOP = 2587.0   # the editors' note's first glyphs (page y)
MEASURE_TOP = 5.66  # strip cells: the top of the 24 over its bracket


def project(q, c):
    s = c['s']; x = (q[0] - c['cx']) * s; y = (q[1] - c['cy']) * s
    rz = math.radians(c.get('rz', 0)); rx = math.radians(c.get('rx', 0))
    x1 = x * math.cos(rz) - y * math.sin(rz); y1 = x * math.sin(rz) + y * math.cos(rz)
    y2 = y1 * math.cos(rx); z2 = y1 * math.sin(rx)
    d = 2400; k = d / (d - z2)
    return (960 + (x1 + c.get('ox', 0)) * k, 408 + (y2 + c.get('oy', 0)) * k)


def fit(box, base):
    corners = [(box[0], box[2]), (box[1], box[2]), (box[1], box[3]), (box[0], box[3])]
    c = dict(cx=(box[0] + box[1]) / 2, cy=(box[2] + box[3]) / 2, s=0.25, ox=0, oy=0)
    c.update(base)
    for _ in range(80):
        pr = [project(q, c) for q in corners]
        xs = [p[0] for p in pr]; ys = [p[1] for p in pr]
        w = max(xs) - min(xs); h = max(ys) - min(ys)
        c['s'] *= min((SAFE[1] - SAFE[0]) / w, (SAFE[3] - SAFE[2]) / h) ** 0.9
        pr = [project(q, c) for q in corners]
        mx = (max(p[0] for p in pr) + min(p[0] for p in pr)) / 2
        my = (max(p[1] for p in pr) + min(p[1] for p in pr)) / 2
        c['cx'] += (mx - (SAFE[0] + SAFE[1]) / 2) / c['s']
        c['cy'] += (my - (SAFE[2] + SAFE[3]) / 2) / c['s']
    return c


def page_y_at_window(c, wy, x):
    lo, hi = -5000.0, 9000.0
    for _ in range(60):
        m = (lo + hi) / 2
        if project((x, m), c)[1] < wy:
            lo = m
        else:
            hi = m
    return lo


def camera():
    """the end framing: the strip with its measures over it and the printed figure,
    the frame's lower edge above the editors' note (round 4's fit)"""
    RX, RY = PL.RX, PL.RY
    RW, RH = 24 * U, 4 * U
    box = (RX - 8, P['R'][0] + 8, RY - 400, RY + RH + 8)
    cam = fit(box, dict(rx=5, rz=0, oy=0))
    for _ in range(12):
        for _ in range(40):
            yb = max(page_y_at_window(cam, 816, x) for x in (600, 1500, 2500))
            if yb <= NOTE_TOP - 12:
                break
            cam['cy'] -= (yb - (NOTE_TOP - 12)) * 0.9
        corners = [(box[0], box[2]), (box[1], box[2]), (box[1], box[3]), (box[0], box[3])]
        for _ in range(40):
            pr = [project(q, cam) for q in corners]
            x0 = min(q[0] for q in pr); x1 = max(q[0] for q in pr)
            cam['s'] *= ((SAFE[1] - SAFE[0]) / (x1 - x0)) ** 0.9
            pr = [project(q, cam) for q in corners]
            x0 = min(q[0] for q in pr); x1 = max(q[0] for q in pr)
            cam['cx'] += ((x0 + x1) / 2 - (SAFE[0] + SAFE[1]) / 2) / cam['s']
    return {k: round(v, 5 if k == 's' else 2) for k, v in cam.items()}


def camera_start(cam):
    """v2 fix round: the framing the shot opens on, PUSH wider than the end
    framing, with the window's lower edge on the same page line (so the
    editors' note stays out of frame), for a slow push in onto round 8's end
    framing"""
    c = dict(cam)
    c['s'] = cam['s'] / PUSH
    xs = (600, 1500, 2500)
    target = max(page_y_at_window(cam, 816, x) for x in xs)
    for _ in range(80):
        yb = max(page_y_at_window(c, 816, x) for x in xs)
        c['cy'] -= (yb - target) * 0.9
    return {k: round(v, 5 if k == 's' else 2) for k, v in c.items()}


def build(path):
    d = json.load(open(path))
    T = DM.tris_of(d['layout'])
    cam = camera()
    cam0 = camera_start(cam)
    # every copy inside the window (60 px from its edges) and clear of the measures,
    # at the end framing and at the framing the shot opens on
    for t in T.values():
        if t.printed:
            continue
        for q in t.v.values():
            for c in (cam, cam0):
                x, y = project(q, c)
                assert 60 <= x <= 1860 and 30 <= y <= 816, (t.name, q, (x, y))
            # every copy's piece is a source and goes before the measures,
            # so a copy only has to lie clear of the strip
            assert PL.cell(q)[1] >= 4.25, (t.name, PL.cell(q))
    tp = DM.times(d)
    D = d['demo']
    land = round(D['t0'] + D['dur'], 4)
    dq = {(q['tri'], q['kind']): q for q in D['pieces']}
    pieces = []
    for q in DM.assign(d):
        e = dict(tri=q['tri'], kind=q['kind'], item=q['item'], slot=[[round(a, 3), round(b, 3)] for a, b in q['slot']])
        if q.get('demo'):
            m = dq[(q['tri'], q['kind'])]
            e.update(demo=True, tp=land, a1=round(m['a1'], 4), n1=round(m['n1'], 2), a2=round(m['a2'], 4), n2=round(m['n2'], 2),
                     rs=round(m['rs'], 4), re=round(m['re'], 4))
            if m.get('pv'):
                e['pv'] = m['pv']
        else:
            e['tp'] = tp[q['item']]
        pieces.append(e)
    items = []
    for name in ['Z0'] + DM.ORDER:
        x0, row, w = DM.RECTS[name]
        items.append(dict(name=name, t=land if name == 'Z0' else tp[name], x0=round(PL.RX + x0 * U, 3), x1=round(PL.RX + (x0 + w) * U, 3)))
    tris = [dict(name=n, rot=t.rot, x0=round(t.x0, 3), y0=round(t.y0, 3), printed=bool(t.printed)) for n, t in T.items()]
    M = d['measure']
    assert M['t0'] >= tp[DM.ORDER[-1]] + d['print']['dur'] - 1e-6, 'the measures start before the print ends'
    out = dict(
        U=U, RX=round(PL.RX, 3), RY=round(PL.RY, 3), part=d.get('part', 0.0), pd=d.get('part', 0.0), ke=d.get('ke'),
        tris=tris, pieces=pieces, items=items,
        demo=dict(t0=D['t0'], dur=D['dur']),
        print={k: d['print'][k] for k in ('dur', 'rise', 'hold', 'go', 'lift', 'ghostC')},
        camEnd=cam, camStart=cam0, tCamEnd=d.get('tCamEnd', T_CAM_END),
        lampEnd=dict(lx=960, ly=410, lrx=1560, lry=760, lamp=0.5, core=34), dofk=0.32,
        tMeasure=M['t0'], measureDur=M['dur'],
        measures=dict(circleX=3, brackets=[[0, 6], [6, 14], [14, 24]]),
    )
    return out


if __name__ == '__main__':
    PLAN = build(sys.argv[1])
    src = open(JS).read()
    body = json.dumps(PLAN, ensure_ascii=False, separators=(',', ':'))
    src2 = re.sub(r'/\*PLAN\*/.*?/\*END\*/', lambda m: '/*PLAN*/ ' + body + ' /*END*/', src, flags=re.S)
    assert src2 != src or body in src
    open(JS, 'w').write(src2)
    print('embedded', len(PLAN['pieces']), 'pieces,', len(PLAN['items']), 'rectangles; camEnd', PLAN['camEnd'], 'camStart', PLAN['camStart'], 'measures', PLAN['tMeasure'], PLAN['measureDur'])
    for nm, c in (('end', PLAN['camEnd']), ('start', PLAN['camStart'])):
        print('  %-5s window lower edge at page y %.1f (the note starts at %.0f)' % (nm, max(page_y_at_window(c, 816, x) for x in (600, 1500, 2500)), NOTE_TOP))
