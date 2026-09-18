#!/bin/zsh
# Stop-motion capture of the React reference sidebar, following Kevin's reference recording:
# hover down (pill follows), click Var, DateTime, Branch, RegionSelector, expand Hooks,
# hover back up, click Configuration, hover down, click <T>. Frames -> rec/stopmo2/, list -> frames.txt
export AGENT_BROWSER_SESSION=capture
SP="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$SP/rec/stopmo2"; rm -rf "$OUT"; mkdir -p "$OUT"; LOG="$OUT/_log.txt"; LIST="$OUT/frames.txt"; : > "$LIST"
DOCS="${DOCS_URL:-http://localhost:3001}"  # a local landing dev server; the live site works too
BASE="/en-US/docs/react/reference"
n=0
shoot() { local f; f="$OUT/f$(printf %04d $n).png"; agent-browser screenshot "$f" >/dev/null 2>&1; printf "file '%s'\nduration %s\n" "$f" "$1" >> "$LIST"; n=$((n+1)); }
row() { case "$1" in config) echo "#nd-sidebar a[href=\"$BASE/config\"]";; hooks) echo "HOOKS";; *) echo "#nd-sidebar a[href=\"$BASE/components/$1\"]";; esac; }
pauseall='document.getAnimations().forEach(a => { if (a.playState === "running") { a.pause(); window.__anims.push(a); } });'
step() { agent-browser eval "(() => { window.__anims = window.__anims || []; $pauseall window.__anims.forEach(a => { try { a.currentTime = $1; } catch (e) {} }); return 1; })()" >/dev/null 2>&1; }
finish() { agent-browser eval "(window.__anims || []).forEach(a => { try { a.finish(); } catch (e) {} }); document.getAnimations().forEach(a => { try { a.play(); } catch (e) {} }); window.__anims = []; 'ok'" >/dev/null 2>&1; }
sel_js() { if [ "$1" = "HOOKS" ]; then echo "[...document.querySelectorAll('#nd-sidebar [data-radix-scroll-area-viewport] button')].find(b => b.textContent.trim() === 'Hooks')"; else echo "document.querySelector('$1')"; fi; }
hover() { local s; s=$(sel_js "$(row $1)"); echo "hover $1: $(agent-browser eval "(() => { const el = $s; if (!el) return 'missing'; el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })); const th = document.querySelector('#nd-sidebar .docs-sb-thumb-hover'); void getComputedStyle(th).top; const anims = document.getAnimations().filter(a => a.playState !== 'finished'); anims.forEach(a => a.pause()); window.__anims = anims; return anims.length + ' anims'; })()" 2>&1 | tail -1)" >> "$LOG"
  for t in 0 20 40 60 80 100 120 140 160; do step $t; shoot 0.025; done; finish; sed -i '' '$ s/duration 0.025/duration 0.36/' "$LIST"; }
click() { local s; s=$(sel_js "$(row $1)"); echo "click $1: $(agent-browser eval "(() => { const el = $s; if (!el) return 'missing'; el.click(); const th = document.querySelector('#nd-sidebar .docs-sb-thumb'); void getComputedStyle(th).top; const anims = document.getAnimations().filter(a => a.playState !== 'finished'); anims.forEach(a => a.pause()); window.__anims = anims; return anims.length + ' anims'; })()" 2>&1 | tail -1)" >> "$LOG"
  for t in 0 25 50 75 100 125 150 175 200 225 250 275 300; do step $t; shoot 0.028; done; finish; sed -i '' '$ s/duration 0.028/duration 0.7/' "$LIST"; sleep 0.7; }
# --- setup: page at DPR 4, Components expanded, Reference at the top, pointer away
agent-browser set viewport 1440 900 4 >/dev/null 2>&1; agent-browser open "$DOCS$BASE/config" >/dev/null 2>&1; agent-browser wait --load networkidle >/dev/null 2>&1; sleep 1.5
agent-browser find role button click --name "Components" >/dev/null 2>&1; sleep 0.9
agent-browser eval '(() => { const vp = document.querySelector("#nd-sidebar [data-radix-scroll-area-viewport]"); const ref = [...vp.querySelectorAll("p")].find(p => p.textContent.trim() === "Reference"); vp.scrollTop += ref.getBoundingClientRect().top - vp.getBoundingClientRect().top - 10; [...document.querySelectorAll("nextjs-portal")].forEach(p => p.style.display = "none"); const a = vp.querySelector("a[data-active=true]"); return a.textContent.trim() + " y=" + Math.round(a.getBoundingClientRect().top) + " scroll=" + vp.scrollTop; })()' >> "$LOG" 2>&1
agent-browser mouse move 900 820 >/dev/null 2>&1; sleep 0.5
# screenshots re-fire real pointer events on the last clicked row; only the scripted (synthetic) hovers may drive the pills
agent-browser eval '(() => { const vp = document.querySelector("#nd-sidebar [data-radix-scroll-area-viewport]"); ["pointerover","pointerenter","pointerleave","pointerout","pointermove","mouseover","mouseenter","mouseleave","mouseout","mousemove"].forEach(t => vp.addEventListener(t, e => { if (e.isTrusted) e.stopImmediatePropagation(); }, true)); return "blocked"; })()' >> "$LOG" 2>&1; sleep 0.7
agent-browser screenshot "$SP/shots/hi/react-ref.png" >/dev/null 2>&1; cp "$SP/shots/hi/react-ref.png" "$OUT/f0000.png"; printf "file '%s'\nduration 0.9\n" "$OUT/f0000.png" >> "$LIST"; n=1
# --- the sequence
hover gt-provider; hover t; hover var; click var
hover num; hover currency; hover datetime; click datetime
hover relative-time; hover plural; hover branch; click branch
hover derive; hover locale-selector; hover region-selector; click region-selector
hover hooks; click hooks
hover derive; hover currency; hover t; hover config; click config
hover gt-provider; hover t; click t
# pointer leaves: hover pill fades
agent-browser eval 'document.querySelector("#nd-sidebar [data-radix-scroll-area-viewport]").dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" })); "left"' >/dev/null 2>&1; sleep 0.4; shoot 1.6
LAST="$OUT/f$(printf %04d $((n-1))).png"; printf "file '%s'\n" "$LAST" >> "$LIST"
echo "frames: $n" >> "$LOG"; echo "final active: $(agent-browser eval 'document.querySelector("#nd-sidebar a[data-active=true]").textContent.trim()' 2>&1 | tail -1)" >> "$LOG"; cat "$LOG"
