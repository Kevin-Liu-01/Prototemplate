"""Small audio helpers for the modern-hebrew sound lane (numpy and ffmpeg only).

load(path, sr=48000, mono=True)  float array (or (n, 2) when mono=False)
save(path, x, sr=48000, bits=24) WAV
rms_db(x, sr, win)               short-time level in dB
extent(x, sr, floor_db)          first and last moment above floor_db
lufs(path)                       integrated loudness and true peak by ebur128
"""
import re
import subprocess
import wave

import numpy as np


def load(path, sr=48000, mono=True):
    ch = 1 if mono else 2
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', str(ch), '-ar', str(sr), '-'],
                         check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    return x if mono else x.reshape(-1, 2)


def save(path, x, sr=48000, bits=24):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    ch = x.shape[1]
    with wave.open(path, 'wb') as w:
        w.setnchannels(ch)
        w.setframerate(sr)
        if bits == 24:
            q = np.clip(np.round(x * 8388607.0), -8388608, 8388607).astype('<i4')
            w.setsampwidth(3)
            w.writeframes(q.reshape(-1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes())
        else:
            q = np.clip(np.round(x * 32767.0), -32768, 32767).astype('<i2')
            w.setsampwidth(2)
            w.writeframes(q.tobytes())


def rms_db(x, sr=48000, win=0.01):
    if x.ndim == 2:
        x = x.mean(1)
    n = int(sr * win)
    m = len(x) // n
    f = x[: m * n].reshape(m, n)
    return 20 * np.log10(np.sqrt((f ** 2).mean(1)) + 1e-9)


def extent(x, sr=48000, floor_db=-50, win=0.01):
    d = rms_db(x, sr, win)
    on = np.nonzero(d > floor_db)[0]
    if len(on) == 0:
        return (0.0, 0.0)
    return (on[0] * win, (on[-1] + 1) * win)


def lufs(path):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    tail = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
    tp = re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', tail)
    return I, float(tp.group(1)) if tp else None
