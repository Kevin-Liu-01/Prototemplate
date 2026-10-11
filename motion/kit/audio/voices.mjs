// GT motion kit: the ElevenLabs ids of the voices tracked files name.
//
// A voice id that is not public never enters a tracked file. Tracked code and
// voice files name the voice ("Yun", "Clara"), and its id lives only in
// voices.local.json beside this file, which git ignores; voices.example.json
// lists the names to fill in. Frederick Surrey's id is public (the
// slash-announcement credits on the site print it) and stays in voice.json.
//
//   import { voiceId, voiceNames } from '<kit>/audio/voices.mjs';
//   voiceId('Yun')   // the id; throws, naming the file and the voice, when it is missing
//   voiceNames()     // { <id>: <name> } for every voice the local file fills
//
// kit/audio/el.mjs carries its own copy of the lookup, because it also runs
// through symlinks with --preserve-symlinks, where this module's relative path
// would not resolve.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LOCAL = join(dirname(realpathSync(fileURLToPath(import.meta.url))), 'voices.local.json');

function table() {
  if (!existsSync(LOCAL)) {
    throw new Error(`${LOCAL} is missing: copy voices.example.json beside it to voices.local.json and fill in each voice's ElevenLabs id (the ids are never tracked)`);
  }
  return JSON.parse(readFileSync(LOCAL, 'utf8')).voices || {};
}

export function voiceId(name) {
  const id = table()[name];
  if (!id) throw new Error(`${LOCAL} has no id for the voice "${name}": add it (voices.example.json lists the names)`);
  return id;
}

export function voiceNames() {
  if (!existsSync(LOCAL)) return {};
  return Object.fromEntries(Object.entries(table()).filter(([, id]) => id).map(([name, id]) => [id, name]));
}
