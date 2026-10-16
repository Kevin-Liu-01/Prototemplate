/**
 * The docs site's content collection (fumadocs-mdx): the MDX pages under
 * content/docs and their sidebar order in content/docs/meta.json. The
 * generated .source/ folder (git-ignored) is what src/lib/source.ts loads.
 *
 * - includeProcessedMarkdown keeps each page's processed Markdown, which
 *   page.data.getText('processed') returns to the .md twins
 *   (src/app/md/[...path]/route.ts) and /llms-full.txt.
 * - tokenizeTimeLimit: 0 lets Shiki tokenize a long code block whole; with
 *   the default limit a block that runs past it renders unhighlighted
 *   (gt-cloud #5269).
 *
 * The same file runs in gt-cloud's apps/landing; /docs/template says what
 * to keep when it is copied into another project.
 */
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: { includeProcessedMarkdown: true },
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      tokenizeTimeLimit: 0,
    },
  },
});
