#!/bin/zsh
# usage: gfsurvey.sh <outdir> <exportWidth> '<shaderSettingsJSON>' '<effectSettingsJSON>' <shaderSize> <shaderOpacity> <effectOpacity> t1 t2 ...
export AGENT_BROWSER_SESSION=glyph
OUT="$1"; W="$2"; SSET="$3"; ESET="$4"; SSIZE="$5"; SOP="$6"; EOP="$7"; shift 7; mkdir -p "$OUT"
cat <<EOF | agent-browser eval --stdin 2>&1 | tail -1
(async () => { const studio = window.glyphfield.studio; let src = JSON.parse(studio.readSource());
  Object.values(src.elements).filter(e => e.kind === 'shader').forEach(e => { Object.assign(e.data.settings, $SSET); e.data.shaderSize = $SSIZE; e.data.opacity = $SOP; e.style.opacity = $SOP; });
  Object.values(src.elements).filter(e => e.kind === 'effect').forEach(e => { Object.assign(e.data.settings, $ESET); e.data.opacity = $EOP; e.style.opacity = $EOP; });
  src.metadata.designLab.exportSettings.width = $W;
  let ok = 'ERR'; for (let k = 0; k < 6; k++) { try { await studio.applySource(src); ok = 'ok'; break; } catch (e) { ok = 'ERR ' + e.message; await new Promise(r => setTimeout(r, 1500)); } }
  await new Promise(r => setTimeout(r, 2500)); await studio.invoke('design.workspace.activate', { target: 'artboard-4d2e3a5a-c20e-4889-9e73-83af21ba7f06' }); await new Promise(r => setTimeout(r, 1000)); return ok; })()
EOF
for t in "$@"; do
cat <<EOF | agent-browser eval --stdin 2>&1 | tail -1 | sed 's/^"//; s/"$//' | tr -d '\n' > "$OUT/t$t.b64"
(async () => { const studio = window.glyphfield.studio; await studio.invoke('design.frame.seek', { timeMs: $t }); await new Promise(r => setTimeout(r, 800)); let art = null; for (let k = 0; k < 4; k++) { try { art = await studio.invoke('design.export', { format: 'png', download: false }); break; } catch (e) { await new Promise(r => setTimeout(r, 1200)); } } if (!art) return 'ERR'; const buf = new Uint8Array(await art.blob.arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); return btoa(bin); })()
EOF
python3 -c "
import base64, re
s = open('$OUT/t$t.b64').read(); c = re.sub(r'[^A-Za-z0-9+/=]', '', s)
d = base64.b64decode(c + '=' * (-len(c) % 4)) if len(c) > 100 else b''
open('$OUT/t$t.png', 'wb').write(d)
"; rm -f "$OUT/t$t.b64"; done
