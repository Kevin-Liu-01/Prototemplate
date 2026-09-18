#!/bin/zsh
export AGENT_BROWSER_SESSION=glyph
agent-browser open "https://glyphfield.com/studio" 2>&1 | tail -1; agent-browser set viewport 1600 1000 1 >/dev/null 2>&1; agent-browser wait --load networkidle >/dev/null 2>&1; agent-browser wait 3000 >/dev/null
agent-browser find role button click --name "Design Lab" 2>&1 | tail -1; agent-browser wait 2500 >/dev/null
agent-browser eval --stdin < "$(dirname "$0")/load.js" 2>&1 | tail -1
cat <<'EOF' | agent-browser eval --stdin 2>&1 | tail -1
(async () => { const studio = window.glyphfield.studio; const out = {};
  try { window.__proj.metadata.designLab.exportSettings.width = 640; await studio.applySource(window.__proj); out.apply = 'ok'; } catch (e) { out.apply = 'ERR ' + e.message; }
  await new Promise(r => setTimeout(r, 3000)); await studio.invoke('design.workspace.activate', { target: 'artboard-4d2e3a5a-c20e-4889-9e73-83af21ba7f06' }); await new Promise(r => setTimeout(r, 1200));
  let src = null; for (let i = 0; i < 12; i++) { try { src = JSON.parse(studio.readSource()); break; } catch (e) { await new Promise(r => setTimeout(r, 800)); } }
  out.layers = Object.values(src.elements).map(e => e.kind); return JSON.stringify(out); })()
EOF
