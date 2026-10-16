import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { SeoImage } from '@/lib/seo/route';

const PNG_SIGNATURE = '89504e470d0a1a0a';

/**
 * A post's own social card (the first of its frontmatter ogImages, the
 * card GT made for the post), with the pixel size read from the PNG
 * header in public/ so og:image:width and og:image:height state the file's
 * real size (lint:seo L2 compares them). The cards GT ships are PNGs; any
 * other file fails the build here rather than declaring a wrong size.
 */
export function postCard(url: string, alt: string): SeoImage {
  const file = join(process.cwd(), 'public', url.replace(/[?#].*$/, ''));
  const head = readFileSync(file).subarray(0, 24);
  if (head.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) {
    throw new Error(`postCard: ${url} is not a PNG; read its size another way before declaring it`);
  }
  return { url, width: head.readUInt32BE(16), height: head.readUInt32BE(20), type: 'image/png', alt };
}
