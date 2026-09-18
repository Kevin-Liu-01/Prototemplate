#!/bin/zsh
# usage: gfexport.sh <artboardId> <exportWidth> <outfile.png> [timeMs] [hideLabel]
export AGENT_BROWSER_SESSION=glyph
AB="$1"; W="$2"; OUT="$3"; T="${4:-}"; HIDE="${5:-}"
SEEK=""; [ -n "$T" ] && SEEK="await studio.invoke('design.frame.seek', { timeMs: $T }); await new Promise(r => setTimeout(r, 900));"
HIDEJS=""; [ -n "$HIDE" ] && HIDEJS="try { studio.activate('$HIDE'); await new Promise(r => setTimeout(r, 600)); } catch (e) { out.hideErr = e.message; }"
RES=$(cat <<EOF | agent-browser eval --stdin 2>&1 | tail -1
(async () => { const studio = window.glyphfield.studio; const out = {};
  await studio.invoke('design.workspace.activate', { target: '$AB' });
  await new Promise(r => setTimeout(r, 1200));
  let src = null; for (let i = 0; i < 12; i++) { try { src = JSON.parse(studio.readSource()); break; } catch (e) { await new Promise(r => setTimeout(r, 700)); } }
  if (!src) return JSON.stringify({ err: 'readSource never ready' });
  if (src.metadata.designLab.exportSettings.width !== $W) { src.metadata.designLab.exportSettings.width = $W; await studio.applySource(src); await new Promise(r => setTimeout(r, 3000)); await studio.invoke('design.workspace.activate', { target: '$AB' }); await new Promise(r => setTimeout(r, 800)); }
  $HIDEJS
  $SEEK
  let art = null, lastErr = null; for (let k = 0; k < 4; k++) { try { art = await studio.invoke('design.export', { format: 'png', download: false }); break; } catch (e) { lastErr = e.message; await new Promise(r => setTimeout(r, 1800)); } } if (!art) return JSON.stringify({ err: 'export failed: ' + lastErr });
  const buf = new Uint8Array(await art.blob.arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  window.__b64 = btoa(bin); out.file = art.fileName; out.w = art.width; out.h = art.height; out.size = art.blob.size; out.b64 = window.__b64.length; return JSON.stringify(out); })()
EOF
)
echo "$RES"
LEN=$(echo "$RES" | sed -n 's/.*\\"b64\\":\([0-9]*\).*/\1/p'); [ -z "$LEN" ] && LEN=$(echo "$RES" | sed -n 's/.*"b64":\([0-9]*\).*/\1/p')
[ -z "$LEN" ] && { echo "no b64 length parsed"; exit 1; }
TMP="$OUT.b64"; : > "$TMP"; OFF=0; STEP=1500000
while [ "$OFF" -lt "$LEN" ]; do agent-browser eval "window.__b64.slice($OFF, $OFF+$STEP)" 2>&1 | tail -1 | sed 's/^"//; s/"$//' | tr -d '\n' >> "$TMP"; OFF=$((OFF+STEP)); done
python3 - "$TMP" "$OUT" <<'PY'
import base64, re, sys
s = open(sys.argv[1]).read(); clean = re.sub(r'[^A-Za-z0-9+/=]', '', s)
data = base64.b64decode(clean + '=' * (-len(clean) % 4)); open(sys.argv[2], 'wb').write(data); print('wrote', sys.argv[2], len(data), 'bytes')
PY
rm -f "$TMP"; sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null | tail -2 | tr '\n' ' '; echo
