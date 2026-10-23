import { getStory, storySlugs } from '../../_atlas/content';
import { articleOf } from '../../_atlas/riffle/article';

type Params = { params: Promise<{ slug: string }> };

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return storySlugs().map((slug) => ({ slug }));
}

/* A story as its magazine prints it (riffle/article.ts), served as JSON and
   built with the site, so the magazine view fetches it only when a magazine
   opens. */
export async function GET(_request: Request, { params }: Params) {
  const story = getStory((await params).slug);
  if (!story) return new Response('Not found', { status: 404 });
  return Response.json(articleOf(story));
}
