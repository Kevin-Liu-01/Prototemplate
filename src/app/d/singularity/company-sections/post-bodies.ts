/**
 * Post BODIES, vendored the way posts.ts vendors frontmatter.
 *
 * Prototemplate carries no MDX pipeline and no content submodule, so the
 * real article text is transcribed here as a typed block list — the same
 * shape the article renderer walks. Every paragraph, heading, list item and
 * code sample below is the post's own text, trimmed: sections are dropped
 * whole rather than rewritten, and nothing is invented.
 *
 * Not a byte-for-byte copy, though: a few code samples are shortened inside a
 * block, and a handful of sentences carry small mechanical edits (a contraction
 * expanded, a sentence recapitalised where a dropped clause left it mid-line).
 * Treat this as the source text trimmed for a study, not as a mirror of it.
 *
 * Sources (gt-cloud, apps/landing/content):
 *   blog/en-US/branch_vs_ternary.mdx        (at generaltranslation/content@fe45be5^)
 *   devlog/en-US/gt-next_v6_12_0.mdx
 *   devlog/en-US/generaltranslation_v8_1_0.mdx
 *   devlog/en-US/gt-next_v6_8_0.mdx
 *   devlog/en-US/local-edits.mdx
 *
 * Two mechanical conversions: MDX links are flattened to their label text
 * (the /docs targets don't exist in this study), and a fenced block's
 * language tag becomes the code panel's file label, since the source fences
 * carry no filename.
 *
 * Slugs without an entry here still render the article shell from their
 * frontmatter, with the summary standing in as the lede.
 */

/** Inline markup the renderer understands: `code` and **strong**. */
export type BodyBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: readonly string[] }
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'rule' };

export type PostBody = {
  /** Devlog frontmatter's `headline`, which the article title appends. */
  headline?: string;
  blocks: readonly BodyBlock[];
};

/* ---- content/blog/en-US/branch_vs_ternary.mdx ---- */

const BRANCH_VS_TERNARY: PostBody = {
  blocks: [
    { kind: 'h2', text: 'Introduction' },
    {
      kind: 'p',
      text: 'One of the most common mistakes I see in internationalization is the tendency to split simple ternary statements into multiple translation calls. It will often look something like this:',
    },
    {
      kind: 'code',
      lang: 'jsx',
      code: `const gt = useGT()

return (
  <>
    <span>
      <T> Dark Mode: </T>
    </span>
    <Button>{enabled ? gt('On') : gt('Off')}</Button>
  </>
)`,
    },
    {
      kind: 'p',
      text: "For the most part, this works as intended. Prior to implementing i18n, the code probably looked something like `{ enabled ? 'On' : 'Off' }`. Adding the `gt()` function for i18n was probably just a natural extension of the existing code structure.",
    },
    {
      kind: 'p',
      text: 'Every time I see this, I physically cringe a little. This is not at all how the library was designed to be used. There are two arguments for why this is a mistake, especially in the context of using machine translation: (1) Context and (2) Flexibility.',
    },

    { kind: 'h3', text: 'Context' },
    {
      kind: 'p',
      text: 'Meaning is not only embedded in the words but also in how words are presented. The word "back", if located on a back arrow, probably means something very different than the word "back" on a chiropractor\'s resume. Additionally, without a larger context, translators (even human ones) might have difficulty translating the word correctly. There\'s a famous story of WhatsApp\'s i18n department translating the word "crop" on an image editor tool to "crop" as in farming in German.',
    },
    {
      kind: 'p',
      text: 'To get around this context issue, we can pass information about the presentation of content with the `<T>` and `<Branch>` components. In our example, this would give our "translator" a larger picture of what "on" and "off" means.',
    },
    {
      kind: 'code',
      lang: 'jsx',
      code: `<T>
  <span>Dark Mode:</span>
  <Button>
    <Branch branch={enabled.toString()} true="On" false="Off" />
  </Button>
</T>`,
    },

    { kind: 'h3', text: 'Flexibility' },
    {
      kind: 'p',
      text: "Beyond context, another cool way we can leverage LLM translation is through its understanding of code. Let's look at an example where the order of components might change depending on the language:",
    },
    {
      kind: 'code',
      lang: 'jsx',
      code: `<T>
  I eat lunch at <Branch branch={atHome.toString()} true="home" false="work" />.
</T>`,
    },
    { kind: 'p', text: 'So we have two possible sentences:' },
    {
      kind: 'list',
      items: ['"I eat lunch **at home**"', '"I eat lunch **at work**"'],
    },
    { kind: 'p', text: 'In Mandarin we would have:' },
    { kind: 'list', items: ['"我**在家**吃午餐"', '"我**在公司**吃午餐"'] },
    {
      kind: 'p',
      text: 'The `<T>` component recognizes that the sentence order must change here, and it rearranges its children accordingly—something that is not easily possible while using ternary operators with string translation.',
    },
    {
      kind: 'code',
      lang: 'jsx',
      code: `<T>
  我在
  <Branch branch={atHome.toString()} true="家" false="公司" />
  吃午餐。
</T>`,
    },

    { kind: 'h3', text: 'Conclusion' },
    {
      kind: 'p',
      text: 'If you take anything away from this article, you should always be looking for ways to leverage context and flexibility in your code. Using the `<Branch />` component is probably one of the easiest ways to do this.',
    },
  ],
};

/* ---- content/devlog/en-US/gt-next_v6_12_0.mdx ---- */

const GT_NEXT_6_12_0: PostBody = {
  headline: 'Static derivation for string functions',
  blocks: [
    { kind: 'h2', text: 'Overview' },
    {
      kind: 'p',
      text: 'In gt-next@6.8.0, we introduced the `<Static>` component to address sentence fragmentation and code reuse in JSX content. The component allows static function calls directly inside translations while preserving word agreement, conjugation, and word order changes across languages. However, this left a gap for string-based translations using `gt()` and `msg()`.',
    },
    {
      kind: 'p',
      text: 'Like with JSX, many applications rely heavily on string construction through utility functions, especially in mature codebases where translatable content is scattered across services, utilities, and business logic.',
    },
    {
      kind: 'p',
      text: '**gt-next 6.12.0** bridges this gap by introducing `declareStatic()` — the string equivalent of the `<Static>` component — along with supporting functions `declareVar()` and `decodeVars()`.',
    },

    { kind: 'h2', text: 'Core Functionality' },
    { kind: 'h3', text: 'declareStatic()' },
    {
      kind: 'p',
      text: 'Works similarly to `<Static>` but for string functions. The CLI analyzes all possible return paths and creates separate translation entries for each outcome.',
    },
    {
      kind: 'code',
      lang: 'tsx',
      code: `const getDisplayName = (name) => {
  return name ? declareVar(name) : 'Someone';
};

gt(\`\${declareStatic(getDisplayName(name))} says hello.\`);`,
    },

    { kind: 'h3', text: 'declareVar()' },
    {
      kind: 'p',
      text: 'The string equivalent of `<Var>` — marks dynamic content within `declareStatic()` functions that should be excluded from hash calculations and handled as variables at runtime. It does this by wrapping dynamic content in an ICU-compatible select statement that resolves to the original dynamic content during interpolation.',
    },
    {
      kind: 'code',
      lang: 'tsx',
      code: `const greeting = "Hello, " + declareVar(name);
// "Hello, {_gt_, select, other {name}}"`,
    },

    { kind: 'h3', text: 'decodeVars()' },
    {
      kind: 'p',
      text: 'Because `declareVar()` adds ICU-compatible markers in source text, adding `declareVar()` on its own can create issues for existing string-processing logic. To extract the original value, you just need to wrap the source string in `decodeVars()`.',
    },
    {
      kind: 'code',
      lang: 'tsx',
      code: `const greeting = "Hello, " + declareVar("Brian");
// "Hello, {_gt_, select, other {Brian}}"
const decodedGreeting = decodeVars(greeting);
// "Hello, Brian"`,
    },

    { kind: 'h2', text: 'Performance Considerations' },
    {
      kind: 'p',
      text: 'Like `<Static>`, `declareStatic()` multiplies translation entries. Each function call with multiple outcomes creates separate translations, and multiple `declareStatic()` calls in the same string multiply the total entries exponentially. Use this feature judiciously and prefer ICU select statements when the multiplication factor becomes excessive.',
    },
  ],
};

/* ---- content/devlog/en-US/generaltranslation_v8_1_0.mdx ---- */

const GENERALTRANSLATION_8_1_0: PostBody = {
  headline: 'Locale-aware text truncation',
  blocks: [
    { kind: 'h2', text: 'Overview' },
    {
      kind: 'p',
      text: '**generaltranslation@8.1.0** introduces `formatCutoff()`, a locale-aware text truncation function that handles character limits with appropriate terminators for different languages.',
    },
    { kind: 'rule' },

    { kind: 'h2', text: 'Motivation' },
    {
      kind: 'p',
      text: "UI text truncation typically relies on CSS `text-overflow: ellipsis` or simple string slicing, but these approaches don't account for locale-specific conventions. Different languages use different ellipsis characters, spacing, and punctuation rules when text is cut off.",
    },
    {
      kind: 'p',
      text: "Additionally, when AI translations are constrained to character limits, there's often a need to strictly enforce those limits on the client side as a fallback.",
    },
    { kind: 'rule' },

    { kind: 'h2', text: 'Usage' },
    {
      kind: 'p',
      text: '`formatCutoff()` is available both as a GT instance method and standalone function:',
    },
    {
      kind: 'code',
      lang: 'javascript',
      code: `import { GT, formatCutoff } from 'generaltranslation'

const gt = new GT({ targetLocale: 'en-US' })

// Basic truncation
gt.formatCutoff('Hello, world!', { maxChars: 9 })
// Returns: 'Hello, w…'

// Standalone function
formatCutoff('Hello, world!', {
  locales: 'fr-FR',
  maxChars: 9
})
// Returns: 'Hello, w\\u202F…'  // Note the narrow space before ellipsis`,
    },

    { kind: 'h3', text: 'Locale-specific terminators' },
    { kind: 'p', text: 'Different locales use different ellipsis styles:' },
    {
      kind: 'code',
      lang: 'javascript',
      code: `// Chinese and Japanese use double ellipsis
formatCutoff('你好世界', { locales: 'zh-CN', maxChars: 4 })
// Returns: '你好……'

// French uses narrow non-breaking space before ellipsis
formatCutoff('Bonjour', { locales: 'fr-FR', maxChars: 6 })
// Returns: 'Bonj\\u202F…'`,
    },

    { kind: 'h3', text: 'Custom terminators' },
    {
      kind: 'p',
      text: 'Override default behavior with custom terminators and separators:',
    },
    {
      kind: 'code',
      lang: 'javascript',
      code: `gt.formatCutoff('Long text here', {
  maxChars: 13,
  terminator: '...',
  separator: ' '
})
// Returns: 'Long text ...'`,
    },
    { kind: 'rule' },

    { kind: 'h2', text: 'Foundation for UI libraries' },
    {
      kind: 'p',
      text: 'This functionality serves as the base layer for UI-specific implementations in `gt-react` and `gt-next`, which will expose subsets of this functionality appropriate for their frameworks.',
    },
  ],
};

/* ---- content/devlog/en-US/gt-next_v6_8_0.mdx ---- */

const GT_NEXT_6_8_0: PostBody = {
  headline: 'Static function calls inside translations',
  blocks: [
    { kind: 'h2', text: 'Overview' },
    {
      kind: 'p',
      text: 'We often find that the more mature a codebase is, the more content is fragmented. Sentences become scattered between functions, utilities, logic, and services.',
    },
    {
      kind: 'code',
      lang: 'tsx',
      code: `function getSubject(gender) {
  return gender === "male" ? "boy" : "girl"
}
function getObject(toy, gender) {
  return toy === "ball" ? "ball" : getSubject(gender)
}

function Component({ gender, toy }) {
  return (
    <>
      <p>
        The beautiful {getSubject(gender)} plays with the {getObject(toy, gender)}.
      </p>
    </>
  )
}`,
    },
    {
      kind: 'p',
      text: 'When it inevitably comes time to internationalize, developers find that they have painted themselves into a corner. Enforcing things like agreement, conjugation, and changes to word order across multiple files is not manageable without a major refactor. Traditionally, this meant manually extracting every possible permutation of each sentence and adding them to a translation dictionary.',
    },
    {
      kind: 'p',
      text: 'In **gt-next 6.8.0**, we are doubling down on the belief that a strong i18n library adapts to a codebase, rather than the other way around. We are introducing the `<Static>` component to allow static function calls directly inside translations.',
    },
    {
      kind: 'code',
      lang: 'tsx',
      code: `function Component({ gender, toy }) {
  return (
    <T>
      <p>
        The beautiful <Static>{getSubject(gender)}</Static> plays with the <Static>{getObject(toy, gender)}</Static>.
      </p>
    </T>
  )
}`,
    },

    { kind: 'h2', text: 'Important Considerations' },
    {
      kind: 'p',
      text: 'That being said, we strongly emphasize using the `<Static>` component carefully and judiciously. The `<Static>` component, while powerful, can also lead to major increases in the number of translation entries. If used incorrectly, this could have negative effects on load times for an application.',
    },

    { kind: 'h2', text: 'How to use <Static>' },
    {
      kind: 'p',
      text: 'Just like the `<T>` and `<Var>` components, the `<Static>` component is a flag that tells the CLI tool where to and where not to look for translatable content. It tells the CLI tool to dereference a function call inside the `<Static>` tags and catalog all possible content being returned by that function. Treat every return statement as if it had a `<T>` component wrapping it.',
    },
    {
      kind: 'p',
      text: 'Once the CLI tool has found all possible outputs from a function call, it creates a separate translation entry for each possible output. Because a different translation entry exists for each possible output, we can support agreement, conjugation, and word order in a fragmented sentence: "*El* niño es *hermoso*" and "*La* niña es *hermosa*".',
    },
  ],
};

/* ---- content/devlog/en-US/local-edits.mdx ---- */

const LOCAL_EDITS: PostBody = {
  headline: 'Save translation edits from the CLI',
  blocks: [
    { kind: 'h2', text: 'Overview' },
    {
      kind: 'p',
      text: "In **gtx-cli 2.4.0**, we've added a new way to save your local translation edits directly from the CLI. This means you can now make translation changes locally, persist them, and keep everything in sync with your project without touching the dashboard.",
    },
    { kind: 'rule' },

    { kind: 'h2', text: 'The save-local Command' },
    {
      kind: 'p',
      text: 'Historically, the only way to make translation edits was through the dashboard editor. That worked, but it often broke flow, especially if you were mid-development and just wanted to tweak a translation inline.',
    },
    {
      kind: 'p',
      text: 'The new `save-local` command lets you commit local translation edits back to your General Translation project. You stay in your workspace, and your changes stay in sync.',
    },
    { kind: 'code', lang: 'bash', code: 'npx gtx-cli save-local' },
    {
      kind: 'p',
      text: 'Running this command uploads any modified translation files, merges your local changes into the project, and ensures that the next `translate` run reflects your edits.',
    },
    { kind: 'rule' },

    { kind: 'h2', text: 'Translate (Now With Local Awareness)' },
    {
      kind: 'p',
      text: 'Until now, `translate` would always assume the remote version of a translation was the source of truth. If you made local changes and ran `translate` again, those edits would be overwritten. That\'s no longer the case.',
    },
    { kind: 'code', lang: 'bash', code: 'npx gtx-cli translate' },
    {
      kind: 'p',
      text: 'The CLI automatically checks for local edits and saves them in the background — the same way `save-local` does — before re-downloading translations. This guarantees that your local versions are preserved and that re-translations always persist your edits.',
    },
    { kind: 'rule' },

    { kind: 'h2', text: 'What Happens When Sources Change' },
    {
      kind: 'p',
      text: 'You might wonder: what if I edit the source file after making local translation edits? In earlier versions, that would have triggered a full retranslation that wiped your custom changes.',
    },
    {
      kind: 'p',
      text: 'In 2.4.0, the CLI is smarter. Even when a source update causes a retranslation, your previous local edits persist. They are incorporated into the new translation automatically.',
    },
  ],
};

/* Keyed by the frontmatter slug exactly — several of those slugs are not
   valid identifiers, hence the quoted keys. */
const BODY_BY_SLUG: Readonly<Record<string, PostBody>> = {
  branch_vs_ternary: BRANCH_VS_TERNARY,
  'gt-next_v6_12_0': GT_NEXT_6_12_0,
  generaltranslation_v8_1_0: GENERALTRANSLATION_8_1_0,
  'gt-next_v6_8_0': GT_NEXT_6_8_0,
  'local-edits': LOCAL_EDITS,
};

/** The vendored body for a slug, or undefined — the shell renders either way. */
export function bodyFor(slug: string): PostBody | undefined {
  return BODY_BY_SLUG[slug];
}

/** Slugs whose article carries a real body, for the index to mark. */
export const SLUGS_WITH_BODIES: readonly string[] = Object.keys(BODY_BY_SLUG);

export type ArticleHeading = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[<>`*]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/**
 * The contents list, derived from the body the way rehype-slug derives it
 * from MDX: h2 and h3 only, ids slugified from the heading text, and a
 * numeric suffix on any collision.
 */
export function headingsOf(body: PostBody | undefined): ArticleHeading[] {
  if (!body) return [];
  const seen = new Map<string, number>();
  const headings: ArticleHeading[] = [];
  for (const block of body.blocks) {
    if (block.kind !== 'h2' && block.kind !== 'h3') continue;
    const base = slugifyHeading(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      id: count === 0 ? base : `${base}-${count}`,
      text: block.text,
      level: block.kind === 'h2' ? 2 : 3,
    });
  }
  return headings;
}
