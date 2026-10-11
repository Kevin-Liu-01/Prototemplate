"""Writes STORYBOARD.md (the film as built, v2) from audio/cues.json and
audio/events.json, so every time in it is the time in the render.
   python3 tools/storyboard.py
The 100 s cut's version of this tool is archive-100s/tools/storyboard.py."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
C = json.load(open(ROOT + 'audio/cues.json'))
EV = json.load(open(ROOT + 'audio/events.json'))
L = {l['id']: l for l in C['lines']}
B = {b['n']: b for b in C['beats']}
B6 = C['liuhui']


def W(i, w, n=0):
    return [x for x in L[i]['words'] if x[0].lower() == w.lower()][n][1]


def Z(i, k):
    return L[i]['chars'][k][1]


def f(t):
    return '%.2f' % t


# The words as SCRIPT-v2.md writes them (the takes were given the numbers as said).
WRITTEN = {'sixteen oh six': '1606', 'two sixty-three CE': '263 CE', 'two hundred and fifty': '250', 'fifteen paces by sixteen': '15 paces by 16'}


def said(i):
    l = L[i]
    text = l['text']
    for a, b in WRITTEN.items():
        text = text.replace(a, b)
    return '%s %s to %s: %s' % (l['who'], f(l['S']), f(l['E']), text)


EVB = lambda kind, a, b: [e for e in EV if e['kind'] == kind and a <= e['t'] < b]
rows = []
rows.append(('1. The title column', B[1], [said('en01'), said('en02')],
             'LOC vol. 1 sp=8, the head of the title column 幾何原本第一卷之首 beside the collector\'s red seal, the page tilted 30 degrees under one lamp.',
             'From black the lamp comes up (0 to 0.6, power2.out). The camera holds the head of the column and pushes in slowly for the whole shot (scale 1.42 to 1.56, power1.inOut), with no track down. On "title" (%s) the brush draws the wavy title line beside 幾何原本 (0.9 s, power2.out). On "word for geometry" (%s) it rings 幾何, tight to the two characters (0.9 s, power1.inOut); the ring stays on the page.' % (f(W('en01', 'title')), f(W('en01', 'word'))),
             'Cite: LOC. Sub: the two lines, rolling up through the two-row bar; line 2 carries over the cut until its reading floor, moving to the top row on the cut frame.'))
rows.append(('2. The Kircher plate', B[2], [said('en03'), said('en04')],
             'Kircher\'s plate (Villanova master): Ricci on the left, Xu on the right, the seal-script panel and the cross between them.',
             'A slow push in for the whole shot (scale 0.80 to 0.87). Both men are in one wide lamp for line 3. On "one" (%s) the lamp narrows onto Ricci and stays there (0.7 s, power2.inOut). The Clavius 1574 title page is gone; no names are set in this shot\'s subtitles.' % f(W('en04', 'one')),
             'Cite: Kircher. Sub: both lines; line 4 carries over the cut until its floor, moving to the top row on the cut frame.'))
rows.append(('3. The credit columns', B[3], [said('zh2'), said('zh3')],
             'The two credit columns on vol. 1 sp=8, both whole in the frame from the cut: 泰西利瑪竇口譯 and 吳淞徐光啓筆受, with the IHS seals of Ricci\'s preface across the fold.',
             'The lamp comes up on 泰西 (0.6 s). A warm read light runs down Ricci\'s column with her voice; circles land on 泰 西 利 瑪 竇 at their character times, and 口譯 is ringed from 口 (%s, 0.72 s). In the 0.45 s gap the read light moves to Xu\'s column; 吳 淞 徐 光 啓 are circled and 筆受 is ringed from 筆 (%s). The camera pushes in slowly from both whole columns to the two rings (power1.inOut) and holds them side by side, still, for 0.5 s before the cut. No camera cross.' % (f(Z('zh2', 5)), f(Z('zh3', 5))),
             'Cite: LOC. Sub: 泰西利瑪竇口譯 Matteo Ricci translated by mouth. over 吳淞徐光啓筆受 Xu Guangqi wrote it down with the brush.; the second carries into shot 4 until its floor, moving to the top row on the cut frame.'))
w15 = [x for x in L['en07']['words'] if x[0] == 'fifteen'][0]
w16 = [x for x in L['en07']['words'] if x[0] == 'sixteen'][0]
rows.append(('4. The Nine Chapters page', B[4], [said('en07'), said('en08')],
             'Siku Quanshu Nine Chapters vols 1 to 3 p. 19, bitonal, toned to paper; close on the column 今有田廣十五步從十六步問為田幾何答曰一畝.',
             'Six reading circles: under 十 五 步 on "fifteen paces" (%s, %s, %s) and under 十 六 步 on "by sixteen" (%s, %s, %s). The camera travels down to 問為田幾何 (1.9 s, power2.inOut, from %s), and on "first two characters" (%s) the brush rings 幾何 alone (0.6 s). The ring holds to the cut, so line 8 has its reading floor before line 9 takes both rows, and from the end of the travel the camera keeps pushing in slowly on it (scale 0.620 to 0.635, sine.in).' % (
                 f(w15[1]), f((w15[1] + w15[2]) / 2), f(W('en07', 'paces')), f(w16[1]), f((w16[1] + w16[2]) / 2), f(w16[2]), f(L['en08']['S'] - 0.15), f(W('en08', 'first'))),
             'Cite: Siku p. 19. Sub: both lines; line 6 carries in from shot 3 in the top row.'))
taps = EVB('tap', B[5]['start'], B[5]['end'])
rows.append(('5. Liu Hui\'s figure (round 8\'s design, retimed)', B[5], [said('en09')],
             'The 句股容圓圖 (Siku vols 7 to 9 p. 132), supplied by the Qing editors, from the cut 2.5 percent wider than round 8\'s end framing: the figure on its page and, on the dark table left of it, three plain paper copies of the triangle in a row low over the strip\'s place (upside down, on its long leg, upside down).',
             'From the cut the camera pushes in slowly onto round 8\'s end framing (scale 0.237 to 0.243, the window\'s lower edge on one page line, sine.out), landing on "cutting". The regions and the copies take their colours one to a phrase, 0.4 s each: 朱 on "commentary" (%s), 青 on "sixty-three" (%s), 黃 on "justified" (%s). On "cutting" (%s) the hairline runs along every cut and is gone as the demonstration starts (%s); nothing parts. The one demonstration (0.95 s): two 朱 halves turn into the strip\'s first rectangle, one tap as they land on "apart" (%s). A rest of 0.25 s. Through "and reassembling them" the other eleven rectangles print in place in reading order, 0.12 s apart (%s to %s), their sources lightening and clearing. As the line ends the brush measures the strip in one 0.25 s set (%s): the circle with its diameter and 4, then 6, 8 and 10 under 24. A %.2f s still hold to the cut.' % (
                 f(B6['colours'][0]), f(B6['colours'][1]), f(B6['colours'][2]), f(B6['cut']), f(B6['demo']), f(taps[0]['t']), f(B6['print']), f(B6['print'] + 10 * B6['gap'] + 0.1), f(B6['measure']), B6['hold']),
             'Cite: 句股容圓圖 and its note, supplied by the Qing editors (原本缺圖今補). Sub: the line, in two rows set by hand (A commentary written in 263 CE justified those methods / by cutting figures apart and reassembling them.).'))
rows.append(('6. Clavius\'s DEFINITIONES', B[6], [said('en10')],
             'Clavius 1574 fol. 1r: EVCLIDIS ELEMENTVM PRIMVM, DEFINITIONES and Def. 1, PVNCTVM est, cuius pars nulla est. The Clavius 1591 page is gone.',
             'A slow push in (scale 1.00 to 1.06). On "defines" (%s) the brush underlines DEFINITIONES (0.6 s). The shot holds to the line\'s reading floor.' % f(W('en10', 'defines')),
             'Cite: Clavius 1574 fol. 1r. Sub: the line.'))
rows.append(('7. The 界說 slip', B[7], [said('en11')],
             'The first text page of 卷一: the heading 界說三十六則 and the one-column note under it; the page still carries the rings of lines 1, 5 and 6.',
             'On "made one" (%s) the brush rings the heading\'s 界說. On "meaning" (%s) the note column lifts off as a slip hinged at its foot and stands toward the camera (1.0 s, power2.inOut); its shadow falls on the page and the place it left is bare paper. The camera takes the standing slip whole (1.2 s, power2.inOut; the depth-of-field bands fade to 0.4) and holds. On "boundaries" (%s) the brush rings the slip\'s last 界說 (in 故曰界說). No Mandarin in this shot.' % (f(W('en11', 'made')), f(W('en11', 'meaning')), f(W('en11', 'boundaries'))),
             'Cite: LOC. Sub: the line.'))
tso = W('en12', 'so')
rows.append(('8. A, B, C hand off to 甲乙丙丁', B[8], [said('en12'), said('zh6')],
             'Clavius 1574 fol. 21v, the Prop. I.1 figure lettered A B C D; hard cut on "so" (%s) to the 1607 Prop. I.1 (LOC vol. 1 sp=23), lettered 丙 甲 乙 丁.' % f(tso),
             'On "sounds" (%s) the figure\'s ink lifts off as one indigo sheet (0.8 s). After the cut it travels in and settles with A on 甲 and B on 乙 (1.2 s, power3.out). On each Stem\'s first sound (%s, %s, %s, %s) that Latin letter sinks into the paper as the brush rings the Stem; then the rest of the indigo sinks (0.5 s, from %s), leaving four vermilion rings, held %.2f s before the cut (the gloss\'s reading floor).' % ((f(W('en12', 'sounds')),) + tuple(f(Z('zh6', i)) for i in range(4)) + (f(B[8]['sink']), B[8]['end'] - B[8]['sink'] - 0.5)),
             'Cite: Clavius 1574 fol. 21v, then LOC. Sub: line 12, then 甲 乙 丙 丁 These are four Heavenly Stems., which clears on the cut.'))
rows.append(('9. 幾何 on both books', B[9], [said('en14'), said('en15'), said('en16')],
             'The Nine Chapters page p. 19 again, carrying line 8\'s ring on 幾何 (and the six circles), framed on its two problems; the 1607 first text page slides in from the right and brings its 幾何 (in 依賴十府中幾何府屬) to the same height.',
             'On "ordinary word" (%s) the brush rings the 幾何 that ends the second problem (又有田廣十二步從十四步問為田幾何). On "Ricci and Xu" (%s) the 1607 page slides in with its soft edge shadow (1.0 s, power2.inOut) and the camera eases back to hold both books; on "quantity" (%s) the brush rings the 幾何府 幾何. During line 16 (%s to %s, sine.inOut) the camera eases back and to the right across the 1607 page until its title column, with line 1\'s ring on 幾何, stands beside the 幾何府 ring; the Nine Chapters ring leaves at the left edge.' % (
                 f(W('en14', 'ordinary')), f(W('en15', 'Ricci')), f(W('en15', 'quantity')), f(L['en16']['S']), f(L['en16']['E'])),
             'Cite: the Siku cite, then Left/Right (two lines) from the first frame the 1607 page\'s edge is in the window. Sub: the three lines, rolling.'))
rows.append(('10. The closing title', B[10], [said('en17')],
             'The empty table under the lamp. 幾何原本 in one column (Noto Serif CJK TC 600, 148 px) at the centre of the window. The EB Garamond block is gone.',
             'The column arrives in reading order (90 ms stagger, opacity and an 8 px rise, power3.out) while line 17 plays over it. The subtitle holds to its reading floor; as it clears the brush adds one vermilion stop after 本 (%s, 0.3 s) in a clear frame. Hold to the end (%s). The bed resolves on its last piano note at the cut to this shot.' % (f(B[10]['stop']), f(C['duration'])),
             'Cite: the image credits in three lines (no ETH line); the second says that both Source Library pages are toned and that the figure on p. 132 is coloured, copied and cut, the third is the CC BY-SA 4.0 notice. Sub: the last line to its floor.'))

out = ['# jihe-yuanben: storyboard (the film as built, v2)', '',
       'Written by `tools/storyboard.py` from `audio/cues.json` (the takes\' own timings) and `audio/events.json` (the picture\'s mark and paper cues). Times are film seconds; cuts sit on the 60 fps frame grid. N is the narrator (Frederick Surrey, `kit/audio/voice-series.json`), R the Mandarin reader (Yun, three takes of the 100 s cut reused). The words are `SCRIPT-v2.md`\'s; the pictures follow `CONCEPT.md` with SCRIPT-v2\'s changes; `NOTES.md` (v2 build) says where the build departs from either. The 100 s cut\'s storyboard is `archive-100s/STORYBOARD.md`.', '',
       '%.2f s, 1920 x 1080, a 2.35:1 window (1920 x 816) between two 132 px bars on a warm black table. Ten beats, eleven shots, hard cuts only.' % C['duration'], '']
for title, b, sp, pic, mot, bars in rows:
    out.append('## %s (%s to %s)' % (title, f(b['start']), f(b['end'])))
    out.append('')
    out.append('- **Spoken:** ' + ' / '.join(sp))
    out.append('- **Picture:** ' + pic)
    out.append('- **Motion:** ' + mot)
    out.append('- **Bars:** ' + bars)
    out.append('')
out.append('## Subtitles (the rolling two-row bar)')
out.append('')
out.append('| line | in | out | hold | floor | rows |')
out.append('| --- | --- | --- | --- | --- | --- |')
for s in C['subs']:
    out.append('| %s | %s | %s | %.2f | %.2f | %d |' % (s['id'], f(s['t0']), f(s['t1']), s['t1'] - s['t0'], s['floor'], s['rows']))
out.append('')
out.append('## Sound cues from the picture')
out.append('')
kinds = {}
for e in EV:
    k = e['kind'] + (':' + e['mark'] if e.get('mark') else '')
    kinds.setdefault(k, []).append(f(e['t']))
for k, v in kinds.items():
    out.append('- %s (%d): %s' % (k, len(v), ', '.join(v)))
out.append('')
open(ROOT + 'STORYBOARD.md', 'w').write('\n'.join(out))
print('STORYBOARD.md', len(out), 'lines')
