"""Numbers for a beat 6 plan (round 8): the layout, the demonstration (paths,
chords, peak speed and turn, every overlap of paper at 60 fps by pair), the
print schedule with each rectangle's sources, the measures and the still
frame before beat 7, the stretch, and the slots measured against the strip.
python3 report.py plan.json

Screen numbers are at the end framing's scale, in px of a 1920 x 1080 frame."""
import sys, math, json
from collections import defaultdict
from geo import *
import plan as PL, sim, demo as DM

BEAT7 = 57.55
TCUT = 53.472   # "cutting" (lib/cues.js)


def main(path):
    d = json.load(open(path))
    sc = PL.SC
    T = DM.tris_of(d['layout'])
    print('end-frame scale %.5f (cell %.1f px)' % (sc, U * sc))
    for n, t in T.items():
        xs = [PL.cell(q)[0] for q in t.v.values()]; ys = [PL.cell(q)[1] for q in t.v.values()]
        print('  %s rot %3d  strip cells x %.2f..%.2f, y %.2f..%.2f%s' % (n, t.rot, min(xs), max(xs), min(ys), max(ys), ' (the print, on the page)' if t.printed else ''))
    D = d['demo']
    land = D['t0'] + D['dur']
    print('cut %.3f; demonstration %.3f-%.3f (%.2f s), from the cut %.3f s' % (TCUT, D['t0'], land, D['dur'], D['t0'] - TCUT))
    # where the copies lie in the frame at the end framing (the page's camera
    # projection, embed.py): their tops under the window's top edge, the
    # nearest to the frame's left edge, the nearest to the page's edge
    import embed as EM
    cam = EM.camera()
    pts = {n: [EM.project(t.v[k], cam) for k in ('T', 'BL', 'R')] for n, t in T.items() if not t.printed}
    edge = EM.project((0.0, PL.RY), cam)[0]
    print('  under the window top: ' + ', '.join('%s %.0f px' % (n, min(q[1] for q in v)) for n, v in pts.items())
          + '; nearest the frame edge %.0f px; nearest the page edge %.0f px' % (min(q[0] for v in pts.values() for q in v), edge - max(q[0] for v in pts.values() for q in v)))
    Dm = DM.Demo(d)
    r = Dm.evaluate(fps=60, detail=True)
    print('60 fps: over a resting piece of its own colour %.2f px2 s, of another %.2f, the two over each other %.2f, past the slot %.2f; largest overlap %.0f px2'
          % (r['same'], r['other'], r['mm'], r['past'], r['peak']))
    for key, v in sorted(r['events'].items(), key=lambda kv: -kv[1][0]):
        print('  %-12s over %-12s %8.2f px2 s  max %5.0f px2  %.3f-%.3f' % (key[0], key[1], v[0], v[1], v[2], v[3]))
    for q, cp, ch, tip, th in zip(D['pieces'], r['cpath'], r['chord'], r['tip'], r['turn']):
        print('  %s %s %s -> %s: centroid path %.0f px (chord %.0f), the farthest corner %.0f px, turn %.0f deg about its centroid' % (
            q['tri'], DM.GLY[T[q['tri']].rot], q['kind'], q['role'], cp, ch, tip, th))
    print('  peak speed %.0f px/s (centroid), peak turn %.0f deg/s' % (r['vmax'], r['wmax']))
    tp = DM.times(d)
    pr = d['print']
    print('rest %.2f s; print-in %.3f-%.3f, %d rectangles %.3f s apart, each %.2f s; a source lit over %.2f s, held %.2f s, gone over %.2f s (the last gone at %.3f)' % (
        pr['t0'] - land, pr['t0'], tp[DM.ORDER[-1]] + pr['dur'], len(DM.ORDER), pr['gap'], pr['dur'], pr['rise'], pr['hold'], pr['go'],
        tp[DM.ORDER[-1]] + pr['rise'] + pr['hold'] + pr['go']))
    asg = DM.assign(d)
    for name in DM.ORDER:
        src = [q['tri'] + '.' + q['kind'] for q in asg if q['item'] == name]
        x0, row, w = DM.RECTS[name]
        print('  %.3f %-4s %s cells %d-%d: %s' % (tp[name], name, 'upper' if row else 'lower', x0, x0 + w, ', '.join(src)))
    M = d['measure']
    print('measures %.3f-%.3f (%.2f s); whole frame still %.2f s before beat 7 (%.2f)' % (M['t0'], M['t0'] + M['dur'], M['dur'], BEAT7 - M['t0'] - M['dur'], BEAT7))
    lo, hi = DM.stretch_all(d)
    print('stretch: principal stretches %.4f to %.4f (%.1f percent)' % (lo, hi, 100 * max(1 - lo, hi - 1)))
    # every slot measured: the halves of each rectangle tile it exactly
    worst = 0.0
    for name, (x0, row, w) in DM.RECTS.items():
        polys = []
        for q in asg:
            if q['item'] != name:
                continue
            p = piece_to(T[q['tri']], q['kind'], [tuple(v) for v in q['slot']], None)
            polys.append(p['poly1'])
        area = sum(abs(sim.area_signed(pp)) for pp in polys)
        xs = [v[0] for pp in polys for v in pp]; ys = [v[1] for pp in polys for v in pp]
        px, py = PL.page(x0, 2 * row + 2)
        err = max(abs(min(xs) - px), abs(max(xs) - (px + w * U)), abs(min(ys) - py), abs(max(ys) - (py + 2 * U)), abs(area - w * U * 2 * U) / U)
        worst = max(worst, err)
    print('slots: every rectangle tiled by its halves to within %.2g page px; the strip x %.2f..%.2f, y %.1f..%.1f page px' % (worst, PL.RX, PL.RX + 24 * U, PL.RY, PL.BASE))
    # the demonstration lands exactly
    e = 0.0
    for p in Dm.ps:
        M_, u, H, th = Dm.pl.pose(p, land)
        e = max(e, max(math.dist(apply(M_, v), apply(p['M'], v)) for v in p['poly0']))
    print('the demonstration lands on its slot to within %.2g page px' % e)
    return r


if __name__ == '__main__':
    main(sys.argv[1])
