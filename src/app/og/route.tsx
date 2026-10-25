import { readFile } from 'node:fs/promises';

import { ImageResponse } from 'next/og';

import { CARD_FONTS, Card } from '@/lib/seo/card';
import { OG_HEIGHT, OG_WIDTH, parseCard } from '@/lib/seo/card-url';

/**
 * GET /og?v=&t=&s=&d=&k=&p=: the social card every head names, drawn by
 * next/og at 1200 by 630 from the query (src/lib/seo/card-url.ts builds
 * and parses it; src/lib/seo/card.tsx is the layout). The card is a pure
 * function of the query, and v changes with the design, so the answer is
 * cached for a year.
 *
 * The two faces are static instances of the self-hosted InterVariable,
 * cut by pnpm build:inter (scripts/build/subset-inter.py): the renderer
 * reads TTF and applies no variable axes or font features. They sit beside
 * this file so Next's file trace carries them into the function.
 *
 * A direction card draws the direction's 1440 dark capture, fetched from
 * the deployment by URL, since public/ is not in the function's trace.
 */

const fonts = Promise.all([
  readFile(new URL('./Inter-Display-500.ttf', import.meta.url)),
  readFile(new URL('./Inter-Text-400.ttf', import.meta.url)),
]);

const DIRECTION_PATH = /^\/(?:directions|d)\/([a-z0-9-]+)(?:\/|$)/;

async function captureFor(path: string, origin: string): Promise<string | undefined> {
  const slug = DIRECTION_PATH.exec(path)?.[1];
  if (!slug || slug === 'production') return undefined;
  try {
    /* a capture that has not arrived in 3 s leaves the card without it */
    const response = await fetch(`${origin}/shots/dark/${slug}.jpg`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:image/jpeg;base64,${bytes.toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const card = parseCard(url.searchParams);
  const [[display, text], capture] = await Promise.all([
    fonts,
    card.kind === 'direction' ? captureFor(card.path, url.origin) : Promise.resolve(undefined),
  ]);

  return new ImageResponse(<Card {...card} capture={capture} />, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: CARD_FONTS.display, data: display, weight: 500, style: 'normal' },
      { name: CARD_FONTS.text, data: text, weight: 400, style: 'normal' },
    ],
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
