"""Builds tone-corrected Mandarin takes from the voice's own takes.

   python3 kit/sound/tones/tune.py <spec.json> [name ...]     (every take in the spec's "tune" section, or those named)
   python3 kit/sound/tones/pitch.py --ref <ref_hz> <out>/<name>.wav ...     (the check)

A voice can read a syllable in the wrong tone in every take. psola.py
re-pitches only that syllable, on the voice's own glottal periods, to the
contour its tone needs; the rest of each take is kept sample for sample. Each
take is a list of pieces cut inside pauses, levelled to one speech RMS, joined
with 8 ms fades and the given silences, as splice.py builds them; the .json's
alignment lists each printed character at its onset (the first sound of its
consonant), shifted by the piece's offset and through the retunes.

The spec is splice.py's, with "ref_hz" (the voice's speech median, Hz), named
"contours" ({"<name>": [[u, st], ...]}: u from 0 to 1 over the syllable's
voiced span, st in semitones against ref_hz; take a contour from the voice's
own clean tones elsewhere in its takes) and a "tune" section whose pieces may
hold "retune": [[t0, t1, "<contour name>" or [[u, st], ...], stretch], ...],
the syllable's span in the source take, its contour, and its voiced span's new
length as a multiple of the old.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from psola import retune  # noqa: E402
from splice import build_take, load_spec  # noqa: E402


def main():
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    takes, cfg = load_spec(args[0], 'tune')
    if not cfg['ref_hz']:
        raise SystemExit('the spec needs "ref_hz", the voice\'s speech median in Hz')
    sr, ref, named = cfg['sr'], cfg['ref_hz'], cfg['contours']
    for entry in takes.values():
        for p in entry['pieces']:
            p['retune'] = [[a, b, named[c] if isinstance(c, str) else c, s] for a, b, c, s in p.get('retune', [])]

    def fix(x, a, b, contour, stretch):
        y, shift, _ = retune(x, sr, a, b, contour, ref, stretch)
        return y, shift

    for k in (args[1:] or takes):
        build_take(k, takes[k], cfg, fix)


if __name__ == '__main__':
    main()
