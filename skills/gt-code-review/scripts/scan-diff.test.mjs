// Tests for scan-diff.mjs: node --test skills/gt-code-review/scripts/scan-diff.test.mjs
// Every case is generated: a table gives each rule's path, the added lines it
// must flag and the added lines it must pass, and diff() builds a unified diff
// from them, so each rule is held by its own test.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BOOLEAN_FIELDS_MIN, COMMENT_BLOCK_MAX, RULES, commentOf, scan } from './scan-diff.mjs';

/** A unified diff that adds `lines` to `path`, starting at line 10. */
function diff(path, lines) {
  return [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    `@@ -9,1 +9,${lines.length + 1} @@`,
    ' context line',
    ...lines.map((text) => `+${text}`),
  ].join('\n');
}

const CASES = {
  M1: {
    path: 'src/agent/imageTools.ts',
    hit: [
      'const folder = task.match(/image folder: (\\S+)/)?.[1];',
      'if (message.includes(IMAGE_GO_ON)) count += 1;',
      'const isName = line.note.startsWith(NAME_KEEPS);',
    ],
    miss: ['const folder = input.imageFolder;', 'if (event.kind === "go_on") count += 1;'],
  },
  M1py: {
    rule: 'M1',
    path: 'tcimg/unread.py',
    hit: ['reason = note.split("; ")[-1]', 'if "Translate every visible line of the picture" in prompt:', 'm = re.search(r"kept as (\\w+)", line_note)'],
    miss: ['reason = line["kept_as"]', 'parts = path.split("/")'],
  },
  M1test: {
    rule: 'M1',
    path: 'tcimg/__tests__/test_status_roles.py',
    hit: [],
    miss: ['    assert "Role in the image: message (notification)." in text', '    assert prompt.startswith("You read")'],
  },
  M2: {
    path: 'tcimg/read.py',
    hit: ['PARA_PITCH = 0.6  # was 0.9 for boxes set tight', 'STROKE_WIDE = 0.1  # retuned on the chat screenshot'],
    miss: [
      'PARA_PITCH = 0.6  # a paragraph line sits within 0.6 of a line height',
      'pitch = 0.6  # was 0.9',
      "VIDEO_CRF = 12  # H.264's constant rate factor for the video path",
    ],
  },
  M3: {
    path: 'tcimg/text.py',
    hit: ["KANA = ('\\u3040', '\\u30ff')", 'MONTHS = ["January", "February", "March", "April", "May"]', 'def message_pieces_parse(message: str) -> list:'],
    miss: ['import budoux', 'from icu import BreakIterator'],
  },
  M5: {
    path: 'src/agent/critic.ts',
    hit: ['  } catch {}', 'const due = await readDue().catch(() => undefined);'],
    miss: ['  } catch (error) { if (!isAbort(error)) throw error; }'],
  },
  M5py: {
    rule: 'M5',
    path: 'tcimg/image.py',
    hit: ['    except Exception: pass', '    except KeyError: return None'],
    miss: ['    except KeyError as error: raise ImageRefused(str(error)) from error'],
  },
  Q2: {
    path: 'src/agent/route.ts',
    hit: ["const label = isImage ? (isAnimated ? 'video' : 'image') : 'file';", "const k = a ? b : c ? d : e;"],
    miss: ["const label = isImage ? 'image' : 'file';", 'const name = user?.name ?? fallback;', 'function f(a?: string, b?: number) { return a ? b : 0; }', "const s = 'a ? b : c ? d : e';"],
  },
  Q2py: {
    rule: 'Q2',
    path: 'tcimg/route.py',
    hit: ['    kind = "video" if animated else "image" if raster else "svg"'],
    miss: ['    kind = "video" if animated else "image"', '    if a if b else c: pass'],
  },
  M11: {
    path: 'apps/worker/src/voice.ts',
    hit: [
      "const FILLER_WORDS = new Set(['um', 'uh', 'like']);",
      'export const NEGATIONS: readonly string[] = ["not", "never", "personne"];',
      "const base = locale.split('-')[0];",
      'const ended = /[.!?]\\s*$/.test(text);',
      'if (/^[A-Z]/.test(word) && index > 0) names.add(word);',
      "const words = line.text.split(' ');",
      'const CONTINUATION = /^(?:The|A|An|And|Or|But)\\b/;',
      "const UNSPACED = new Set(['ja', 'zh', 'th', 'lo']);",
      "const NEXT_SENTENCE = /^[\\p{Lu}\\p{N}¿¡]/u;",
    ],
    miss: [
      'const DRAFT_MIN_WORDS = 3;',
      'const MASK_WORDS = 4; // the last words a draft hides',
      "const KIND = /^(image|video|audio|font|file)$/;",
      "const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });",
      'const base = getBaseLanguage(locale);',
      "const [scheme, token] = header.split(' ');",
      'const value = user?.name ?? fallback;',
      "const ENV_KEYS = ['GT_API_URL'];",
    ],
  },
  M11py: {
    rule: 'M11',
    path: 'tcimg/read.py',
    hit: ['STOP_WORDS = {"the", "a", "an"}', '    words = sentence.split()'],
    miss: ['    parts = path.split("/")', '    lang = Locale.parse(tag).language'],
  },
  M11test: {
    rule: 'M11',
    path: 'apps/worker/__tests__/voice.test.ts',
    hit: [],
    miss: ["const FILLER_WORDS = ['um'];"],
  },
  M12: {
    path: 'apps/worker/src/suggest.ts',
    hit: [
      "const json = reply.slice(reply.indexOf('{'), reply.lastIndexOf('}') + 1);",
      'const match = reply.match(/\\{[\\s\\S]*\\}/);',
    ],
    miss: ['const terms = termsSchema.parse(response.output);', "const dot = name.lastIndexOf('.');"],
  },
  M12py: {
    rule: 'M12',
    path: 'tcimg/judge.py',
    hit: ['    start = reply.find("{")'],
    miss: ['    verdict = Verdict.model_validate_json(reply)'],
  },
  Q15: {
    path: 'apps/worker/src/credentials.ts',
    hit: [
      "const pairs = cookieHeader.split(';').map((p) => p.trim());",
      "for (const part of (request.headers.get('cookie') ?? '').split(';')) {",
      "const claims = JSON.parse(atob(token.split('.')[1]));",
      'if (!window.confirm("Delete this key?")) return;',
      'if (error instanceof RoomClosedError) return c.json({ error: error.message }, 410);',
    ],
    miss: [
      "const session = getCookie(c, 'session');",
      'const claims = decodeJwt(token);',
      'throw new HTTPException(410, { message: "room ended" });',
      'const ok = await confirmDialog.open();',
    ],
  },
  Q3: {
    path: 'tcimg/flow.py',
    hit: ['    # TODO fix this later', '    x = 1  # FIXME'],
    miss: ['    # TODO: https://github.com/org/repo/issues/12 - break Thai lines', '    # TODO(GT-123): break Thai lines', '    # TODO: <issue link> - break Thai lines'],
  },
  Q14: {
    path: 'src/upload.ts',
    hit: ['type Upload = { isUploading: boolean; isDone: boolean; hasError: boolean };'],
    miss: ["type Upload = { state: 'idle' } | { state: 'done'; url: string };", 'type A = { ok: boolean; done: boolean };'],
  },
  C1: {
    path: 'src/agent/run.ts',
    hit: ['export const run = useNew ? runWorker : runImageLegacy;', 'def _old_cut(rows):'],
    miss: ['export const run = runWorker;', 'const compatible: string[] = [];', 'HAN_NAMES = ("CJK COMPATIBILITY IDEOGRAPH",)'],
  },
  C2: {
    path: 'tcimg/fast.py',
    hit: ['if os.environ.get("TC_FREE_AGENT_ENABLED") == "1":', 'if (await isFeatureEnabled(org, "video-free-agent")) {'],
    miss: ['folder = Path(args.folder)', 'os.environ["USE_TORCH"] = "1"'],
  },
  T2: {
    path: 'tcimg/__tests__/test_r4_fixes.py',
    hit: ['def test_r4_case_3():'],
    miss: ['def test_a_paragraph_takes_no_part_of_a_headline():'],
    fileHit: true,
  },
  T3: {
    path: 'tests/test_endpoint.py',
    hit: ['    assert time.monotonic() - t0 < 2.0', '    time.sleep(2)'],
    miss: ['    assert clock.waited == 0'],
  },
  T3ts: {
    rule: 'T3',
    path: 'src/agent/__tests__/relay.test.ts',
    hit: ['expect(Date.now() - start).toBeLessThan(2000);'],
    miss: ['expect(clock.now()).toBe(0);', 'vi.setSystemTime(Date.now() + ms);'],
  },
  TS1: {
    path: 'src/agent/image/imageCommands.ts',
    hit: ['return JSON.parse(last) as Record<string, unknown>;', 'const user = (await res.json()) as User;', 'function handle(body: any) {'],
    miss: ['return answerSchema.parse(JSON.parse(last));', 'const ROLES = ["a", "b"] as const;'],
  },
  TS2: {
    path: 'src/agent/image/imageTools.ts',
    hit: ['const ops = operations as unknown as Operations;', 'const el = document.getElementById("a")!.value;', 'const first = rows[0]!.text;'],
    miss: ['if (a !== b) return;', 'const message = "Done!";'],
  },
  TS2test: {
    rule: 'TS2',
    path: 'src/agent/__tests__/imageTools.test.ts',
    hit: ['const ops = operations as unknown as Operations;'],
    miss: ['expect(commands[0]!.command).toContain("prepare");'],
  },
  TS4: {
    path: 'src/formats.ts',
    hit: ['export enum Format { Png = "PNG" }'],
    miss: ['export const FORMATS = ["PNG", "WEBP"] as const;'],
  },
  P5: {
    path: 'tcimg/fast.py',
    hit: ['x = f(y)  # type: ignore', 'import os  # noqa'],
    miss: ['x = f(y)  # type: ignore[arg-type]', 'import os  # noqa: F401'],
  },
  S1: {
    path: 'src/agent/eraseTool.ts',
    hit: [
      'console.log("token", proxyTokenSecret);',
      'const url = `${base}/erase?api_key=${key}`;',
      'await fetch(`${server}/api/rooms/${id}/terms?hostToken=${hostToken}`);',
      "url.searchParams.set('token', hostToken);",
      "if (!(await sameToken(url.searchParams.get('token') ?? '', record.hostToken))) {",
    ],
    miss: ['logger.info("calling the media GPU server", { operation });', 'await fetch(url, { headers: { authorization: `Bearer ${hostToken}` } });'],
  },
  S3: {
    path: 'scripts/upload.ts',
    hit: ['execSync(`aws s3 cp ${archive} s3://fonts/`);'],
    miss: ['execFileSync("aws", ["s3", "cp", archive, "s3://fonts/"]);'],
  },
  S3py: {
    rule: 'S3',
    path: 'tcimg/fonts.py',
    hit: ['subprocess.run(cmd, shell=True)'],
    miss: ['subprocess.run(["aws", "s3", "cp", archive, dest], check=True)'],
  },
  N3: {
    path: 'tcimg/flow.py',
    hit: ['    keep = 1  # round 2 once drew the last word alone', '    # synced from 3f2a91c4e of the other repository'],
    miss: ['    keep = 1  # every later line keeps at least one break'],
  },
};

describe('scan-diff', () => {
  it('has a generated case for every rule', () => {
    const covered = new Set(Object.entries(CASES).map(([key, c]) => c.rule ?? key));
    assert.deepEqual([...covered].sort(), RULES.map((r) => r.id).sort());
  });

  // N6 reads runs of lines, so its cases are generated by length: a block of
  // COMMENT_BLOCK_MAX lines passes and one of COMMENT_BLOCK_MAX + 1 is flagged,
  // in each comment form.
  const FORMS = {
    'tcimg/flow.py': (n) => Array.from({ length: n }, (_, i) => `# line ${i} of the comment`),
    'tcimg/fast.py': (n) => ['def f():', '    """', ...Array.from({ length: n - 2 }, (_, i) => `    line ${i}`), '    """', '    return 1'],
    'src/agent/run.ts': (n) => ['/**', ...Array.from({ length: n - 2 }, (_, i) => ` * line ${i}`), ' */'],
    'src/agent/tool.ts': (n) => Array.from({ length: n }, (_, i) => `// line ${i}`),
  };
  for (const [path, form] of Object.entries(FORMS)) {
    it(`N6: ${path} flags ${COMMENT_BLOCK_MAX + 1} comment lines and passes ${COMMENT_BLOCK_MAX}`, () => {
      const n6 = (n) => scan(diff(path, form(n))).filter((f) => f.rule === 'N6');
      assert.equal(n6(COMMENT_BLOCK_MAX).length, 0);
      const flagged = n6(COMMENT_BLOCK_MAX + 1);
      assert.equal(flagged.length, 1);
      assert.equal(flagged[0].text, `a comment block of ${COMMENT_BLOCK_MAX + 1} lines`);
    });
  }

  // Q14 also reads a block of field lines, so its cases are generated by count
  // in each declaration form.
  const DECLARATIONS = {
    'src/upload.ts': (n) => ['interface Upload {', ...Array.from({ length: n }, (_, i) => `  flag${i}: boolean;`), '  url?: string;', '}'],
    'tcimg/state.py': (n) => ['@dataclass', 'class Upload:', ...Array.from({ length: n }, (_, i) => `    flag${i}: bool = False`), '    url: str = ""'],
  };
  for (const [path, form] of Object.entries(DECLARATIONS)) {
    it(`Q14: ${path} flags ${BOOLEAN_FIELDS_MIN} boolean fields and passes ${BOOLEAN_FIELDS_MIN - 1}`, () => {
      const q14 = (n) => scan(diff(path, form(n))).filter((f) => f.rule === 'Q14');
      assert.equal(q14(BOOLEAN_FIELDS_MIN - 1).length, 0);
      assert.deepEqual(q14(BOOLEAN_FIELDS_MIN).map((f) => f.text), [`a type with ${BOOLEAN_FIELDS_MIN} boolean fields`]);
    });
  }

  it('Q14: a method or statement ends a field block', () => {
    const lines = ['class Job:', '    a: bool', '    b: bool', '    def run(self): pass', '    c: bool'];
    assert.equal(scan(diff('tcimg/job.py', lines)).filter((f) => f.rule === 'Q14').length, 0);
  });

  it('N6: a code line splits a block, and context lines alone are not flagged', () => {
    const half = Array.from({ length: COMMENT_BLOCK_MAX }, (_, i) => `# ${i}`);
    assert.equal(scan(diff('a.py', [...half, 'x = 1', ...half])).filter((f) => f.rule === 'N6').length, 0);
    const context = ['--- a/a.py', '+++ b/a.py', '@@ -1,8 +1,8 @@', ...Array.from({ length: 8 }, (_, i) => ` # ${i}`)].join('\n');
    assert.deepEqual(scan(context), []);
  });

  for (const [key, c] of Object.entries(CASES)) {
    const rule = c.rule ?? key;
    it(`${key}: flags each bad line and passes each good one`, () => {
      for (const text of c.hit) {
        const found = scan(diff(c.path, [text])).filter((f) => f.rule === rule && f.line === 10);
        assert.equal(found.length, 1, `${rule} should flag: ${text}`);
      }
      for (const text of c.miss) {
        const found = scan(diff(c.path, [text])).filter((f) => f.rule === rule && f.line > 0);
        assert.equal(found.length, 0, `${rule} should pass: ${text}`);
      }
    });
    if (c.fileHit) {
      it(`${key}: flags the file name`, () => {
        assert.ok(scan(diff(c.path, ['x = 1'])).some((f) => f.rule === rule && f.line === 0));
      });
    }
  }

  it('counts new line numbers across context and removed lines', () => {
    const text = ['--- a/a.py', '+++ b/a.py', '@@ -1,3 +1,3 @@', ' one', '-two', '+x = f(y)  # type: ignore', ' three'].join('\n');
    assert.deepEqual(scan(text).map((f) => [f.line, f.rule]), [[2, 'P5']]);
  });

  it('reads no rule in a deleted file', () => {
    const text = ['--- a/a.ts', '+++ /dev/null', '@@ -1,1 +0,0 @@', '-export enum A { B }'].join('\n');
    assert.deepEqual(scan(text), []);
  });

  it('takes the comment of each language', () => {
    assert.equal(commentOf('x = 1  # a note', 'a.py'), 'a note');
    assert.equal(commentOf('const x = 1; // a note', 'a.ts'), 'a note');
    assert.equal(commentOf('const url = "http://x";', 'a.ts'), '');
  });
});
