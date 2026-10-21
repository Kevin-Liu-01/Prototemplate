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
 * - remarkHandbook (src/lib/remark-handbook.ts) runs after fumadocs-mdx's
 *   include step on the handbook pages (content/docs/handbook), which show
 *   the repository's Markdown files through `<include cwd>`: it drops each
 *   included h1, resolves relative links to their site addresses and
 *   prints raw HTML as text.
 *
 * The same file runs in gt-cloud's apps/landing; /docs/template says what
 * to keep when it is copied into another project.
 */
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

import { remarkHandbook } from './src/lib/remark-handbook';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: { includeProcessedMarkdown: true },
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkHandbook],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      tokenizeTimeLimit: 0,
    },
  },
});
