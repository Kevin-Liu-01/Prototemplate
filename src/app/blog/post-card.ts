import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { imageSize } from 'image-size';

import type { SeoImage } from '@/lib/seo/route';

/** The card formats GT ships, by the type image-size reports. */
const MIME: Readonly<Record<string, string>> = { png: 'image/png', jpg: 'image/jpeg' };

/**
 * A post's own social card (the first of its frontmatter ogImages, the
 * card GT made for the post), with the pixel size read from the file in
 * public/ so og:image:width and og:image:height state the file's real size
 * (lint:seo L2 compares them). The cards GT ships are PNGs and JPEGs; any
 * other format fails the build here rather than declaring a wrong type.
 */
export function postCard(url: string, alt: string): SeoImage {
  const file = join(process.cwd(), 'public', url.replace(/[?#].*$/, ''));
  const { width, height, type } = imageSize(readFileSync(file));
  const mime = type ? MIME[type] : undefined;
  if (!mime) throw new Error(`postCard: ${url} is ${type ?? 'an unknown format'}; a card is a PNG or a JPEG`);
  return { url, width, height, type: mime, alt };
}
