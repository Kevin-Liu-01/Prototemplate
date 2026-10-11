"""Tone correction on a Mandarin take: TD-PSOLA, numpy only.

A text-to-speech voice can read a syllable in the wrong tone in every take.
retune() re-pitches that one syllable of the voice's own take to the contour
its tone needs, keeping the voice (the grains are its own glottal periods, so
the formants do not move) and everything around the syllable sample for
sample. tune.py builds corrected takes with it.

retune(x, sr, t0, t1, contour, ref, stretch=1.0) -> (y, shift, (a, b))
    x: mono float signal; [t0, t1]: the syllable (s), whose voiced frames are
    re-pitched; contour: [(u, st)] breakpoints, u from 0 to 1 over the voiced
    span, st in semitones against ref (Hz; the voice's speech median);
    stretch: the voiced span's new length as a multiple of the old (grains
    repeated or dropped). shift(t) maps a time of x to the same instant of y;
    (a, b) is the re-pitched span of x in seconds.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tones import yin  # noqa: E402


def f0_track(x, sr):
    """F0 every 5 ms (YIN, floor 70 Hz) on a 16 kHz copy."""
    n = int(len(x) * 16000 / sr)
    x16 = np.interp(np.arange(n) * sr / 16000, np.arange(len(x)), x)
    f0, hop = yin(x16, sr=16000, fmin=70, fmax=450, hop=0.005, win=0.025, th=0.25)
    return f0, hop


def lowpass(x, sr, fc=900.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / sr)
    X[f > fc] *= np.clip(1 - (f[f > fc] - fc) / 300.0, 0, 1)
    return np.fft.irfft(X, len(x))


def epochs(x, sr, f0, hop, t0, t1):
    """Pitch marks (sample indices) over the voiced frames in [t0, t1]: one
    per glottal period, on the positive peaks of the low-passed signal."""
    idx = np.arange(int(t0 / hop), min(len(f0), int(t1 / hop) + 1))
    v = idx[~np.isnan(f0[idx])]
    if len(v) < 4:
        raise ValueError('no voicing in %.3f-%.3f' % (t0, t1))
    a, b = v[0] * hop, (v[-1] + 1) * hop
    lp = lowpass(x, sr)

    def T_at(s):
        k = int(s / sr / hop)
        k = min(max(k, v[0]), v[-1])
        f = f0[k]
        if np.isnan(f):
            near = v[np.argmin(np.abs(v - k))]
            f = f0[near]
        return sr / f

    s = int(a * sr)
    T = T_at(s)
    m = s + int(np.argmax(lp[s: s + int(T)]))
    marks = []
    while m < b * sr:
        marks.append(m)
        T = T_at(m)
        lo, hi = int(m + 0.75 * T), int(m + 1.25 * T)
        if hi >= len(x):
            break
        m = lo + int(np.argmax(lp[lo:hi]))
    return np.array(marks)


def contour_hz(contour, u, ref):
    us = [c[0] for c in contour]
    st = [c[1] for c in contour]
    return ref * 2 ** (np.interp(u, us, st) / 12)


def retune(x, sr, t0, t1, contour, ref, stretch=1.0):
    x = np.asarray(x, dtype=np.float64)
    f0, hop = f0_track(x, sr)
    M = epochs(x, sr, f0, hop, t0, t1)
    P = np.diff(M)
    P = np.concatenate([P[:1], P])  # local period at each mark
    A, B = int(M[0]), int(M[-1])
    D = int(round((B - A) * (stretch - 1)))
    span_out = (B - A) + D
    N = len(x) + D
    y = np.zeros(N)
    w = np.zeros(N)
    # before the syllable: the take as it is, fading out over the first period
    P0 = int(P[0])
    wp = np.ones(A)
    wp[A - P0:] = 0.5 * (1 + np.cos(np.linspace(0, np.pi, P0)))
    y[:A] += x[:A] * wp
    w[:A] += wp
    # after: fading in over the last period, moved by D
    PL = int(P[-1])
    wq = np.ones(len(x) - B)
    wq[:PL] = 0.5 * (1 - np.cos(np.linspace(0, np.pi, PL)))
    y[B + D:] += x[B:] * wq
    w[B + D:] += wq
    # the grains, at the new pitch
    o = float(A)
    while o <= A + span_out + 0.5:
        u = (o - A) / max(1, span_out)
        tin = A + (o - A) / stretch
        k = int(np.argmin(np.abs(M - tin)))
        m, p = int(M[k]), int(P[k])
        g = x[m - p: m + p + 1]
        h = np.hanning(len(g))
        oi = int(round(o))
        lo = oi - p
        y[lo: lo + len(g)] += g * h
        w[lo: lo + len(g)] += h
        o += sr / contour_hz(contour, min(1.0, u), ref)
    # Normalise by the windows' overlap averaged over about a period, so the
    # syllable keeps its level at any pitch without lifting the grains' tails.
    k = int(0.008 * sr)
    ws = np.convolve(w, np.ones(k) / k, mode='same')
    y = np.where(ws > 0.05, y / np.maximum(ws, 0.05), y)

    def shift(t):
        s = t * sr
        if s <= A:
            return t
        if s >= B:
            return t + D / sr
        return (A + (s - A) * stretch) / sr

    return y, shift, (A / sr, B / sr)
