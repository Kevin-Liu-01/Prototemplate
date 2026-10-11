#!/bin/zsh
# One reader take on eleven_v3 through the kit's own el.mjs (symlinked here, so it
# reads this folder's voice.json), then `el.mjs hear` on it.
#   sound/tools/v3/line.sh r02d "孫。"
# eleven_v3 refuses previous_text and next_text (ElevenLabs 400 unsupported_model),
# so v3 takes are generated without --prev and --next.
cd "${0:A:h}/../.."
node --preserve-symlinks --preserve-symlinks-main tools/v3/el.mjs line takes/$1.mp3 "$2" || exit 1
node ../kit/audio/el.mjs hear takes/$1.mp3
