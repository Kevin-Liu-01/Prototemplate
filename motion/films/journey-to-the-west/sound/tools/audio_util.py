"""Small audio helpers for the jihe-yuanben mix (numpy + ffmpeg only).

load(path, sr=48000, mono=True) -> float32 array (or (n, 2) when mono=False)
save(path, x, sr=48000)         -> 32-bit float WAV (or 24-bit with bits=24)
extent(x, sr, floor_db=-50)     -> (start_s, end_s) of the sound above floor_db
"""
import subprocess
import wave
import numpy as np


def load(path, sr=48000, mono=True):
    ch = 1 if mono else 2
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', str(ch), '-ar', str(sr), '-'],
        check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(np.float32)
    return x if mono else x.reshape(-1, 2)


def save(path, x, sr=48000, bits=24):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    ch = x.shape[1]
    if bits == 24:
        q = np.clip(np.round(x * 8388607.0), -8388608, 8388607).astype('<i4')
        b = q.reshape(-1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
        with wave.open(path, 'wb') as w:
            w.setnchannels(ch)
            w.setsampwidth(3)
            w.setframerate(sr)
            w.writeframes(b)
    else:
        q = np.clip(np.round(x * 32767.0), -32768, 32767).astype('<i2')
        with wave.open(path, 'wb') as w:
            w.setnchannels(ch)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(q.tobytes())


def rms_db(x, sr, win=0.01):
    n = int(sr * win)
    m = len(x) // n
    f = x[: m * n].reshape(m, n)
    return 20 * np.log10(np.sqrt((f.astype(np.float64) ** 2).mean(1)) + 1e-9)


def extent(x, sr=48000, floor_db=-50, win=0.01):
    d = rms_db(x, sr, win)
    on = np.nonzero(d > floor_db)[0]
    if len(on) == 0:
        return (0.0, 0.0)
    return (on[0] * win, (on[-1] + 1) * win)


def lufs(path):
    """Integrated loudness and true peak by ffmpeg's ebur128."""
    r = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    tail = r[r.rfind('Summary:'):]
    import re
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
    tp = re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', tail)
    return I, float(tp.group(1)) if tp else None
