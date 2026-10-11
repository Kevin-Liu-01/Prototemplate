"""GT motion kit: the ElevenLabs ids of the voices tracked files name (the Python side of voices.mjs).

A voice id that is not public never enters a tracked file. Tracked code names
the voice, and its id lives only in voices.local.json beside this file, which
git ignores; voices.example.json lists the names to fill in.

    sys.path.insert(0, '<film>/kit/audio'); from voices import voice_id, voice_names
    voice_id('Yun')   # the id; stops with a message naming the file and the voice when it is missing
    voice_names()     # {<id>: <name>} for every voice the local file fills
"""
import json
import os

LOCAL = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'voices.local.json')


def _table():
    if not os.path.exists(LOCAL):
        raise SystemExit('%s is missing: copy voices.example.json beside it to voices.local.json and fill in each '
                         "voice's ElevenLabs id (the ids are never tracked)" % LOCAL)
    return json.load(open(LOCAL, encoding='utf-8')).get('voices', {})


def voice_id(name):
    vid = _table().get(name)
    if not vid:
        raise SystemExit('%s has no id for the voice "%s": add it (voices.example.json lists the names)' % (LOCAL, name))
    return vid


def voice_names():
    if not os.path.exists(LOCAL):
        return {}
    return {vid: name for name, vid in _table().items() if vid}
