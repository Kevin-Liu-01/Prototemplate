#!/bin/zsh
# Composite the 4x recordings onto the rendered E1/E6 stills. Measures the crop
# geometry from the visual HTML (zoom included) with agent-browser session gtdocs.
export AGENT_BROWSER_SESSION=gtdocs
SP="$(cd "$(dirname "$0")/.." && pwd)"; cd "$SP/build"
geom() { agent-browser open "http://127.0.0.1:8765/build/visuals/$1.html" >/dev/null 2>&1; agent-browser set viewport 1600 900 1 >/dev/null 2>&1; agent-browser wait --fn "window.__centered === true" >/dev/null 2>&1; agent-browser eval "(() => { const c = document.querySelector('.crop'); const b = c.getBoundingClientRect(); return JSON.stringify({ x: b.left, y: b.top, w: b.width, h: b.height, rect: c.dataset.rect }); })()" 2>&1 | tail -1; }
E1=$(geom E1-hover-mask); E6=$(geom E6-sidebar-mask); echo "E1 $E1"; echo "E6 $E6"
python3 - "$E1" "$E6" "$SP" <<'PY'
import sys, json, subprocess
E1, E6, SP = sys.argv[1], sys.argv[2], sys.argv[3]
def parse(s):
    s = s.strip(); s = json.loads(s) if s.startswith('"') else s; return json.loads(s)
K = 2.4  # device px per stage px in the 3840-wide PNG
def build(g, webm, still, out, speed, rec_dpr, gif_fps=24):
    x, y, w, h = [float(v) for v in g['rect'].split(',')]
    cx, cy, cw, ch = g['x'] * K, g['y'] * K, g['w'] * K, g['h'] * K
    crop = f"crop={int(w*rec_dpr)}:{int(h*rec_dpr)}:{int(x*rec_dpr)}:{int(y*rec_dpr)}"
    vf = f"[1:v]{crop},setpts={speed}*PTS,scale={int(cw)}:{int(ch)}:flags=lanczos[v];[0:v][v]overlay={int(cx)}:{int(cy)}:shortest=1[b]"
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', webm]).decode().strip()) * speed
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '10', '-i', still, '-i', webm, '-filter_complex', vf + ';[b]fps=30,format=yuv420p[out]', '-map', '[out]', '-t', f'{dur:.2f}', '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', out + '.mp4'], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '10', '-i', still, '-i', webm, '-filter_complex', vf + f';[b]fps={gif_fps},scale=1400:-1:flags=lanczos,split[p1][p2];[p1]palettegen=max_colors=256:stats_mode=diff[pal];[p2][pal]paletteuse=dither=sierra2_4a:diff_mode=rectangle[out]', '-map', '[out]', '-t', f'{dur:.2f}', out + '.gif'], check=True)
    print('built', out.split('/')[-1], 'dur', round(dur, 1), 'overlay', int(cx), int(cy), int(cw), int(ch), crop)
build(parse(E1), f'{SP}/rec/toc4.webm', f'{SP}/build/out/E1-hover-mask.png', f'{SP}/build/out/E1-hover-mask', 1.0, 4, gif_fps=30)
build(parse(E6), f'{SP}/rec/react-stopmo2.mp4', f'{SP}/build/out/E6-sidebar-mask.png', f'{SP}/build/out/E6-sidebar-mask', 1.0, 4)
PY
