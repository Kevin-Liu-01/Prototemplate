import { MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/notebook/page';

/**
 * The page's actions, the pair GT's docs carry: Copy page copies the page's
 * Markdown twin, and the menu beside it opens the twin, the source file on
 * GitHub, or a prompt that hands the page to an assistant. The twin is the
 * page's address plus .md (next.config.ts rewrites it to
 * src/app/md/[...path]/route.ts), and the prompts name the canonical URL.
 */
export default function DocsPageActions({
  markdownUrl,
  githubUrl,
  pageUrl,
}: {
  markdownUrl: string;
  githubUrl: string;
  pageUrl: string;
}) {
  return (
    <div className='flex flex-row items-center gap-2' data-docs-actions=''>
      <MarkdownCopyButton markdownUrl={markdownUrl} />
      <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} pageUrl={pageUrl} />
    </div>
  );
}
