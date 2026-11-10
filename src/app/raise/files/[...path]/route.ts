import { blobArea } from '@/lib/blob-area';

/** /raise/files/<path>: the raise pages' media, open to anyone with the link, from the area's media folders only (src/lib/blob-area.ts). */
export const dynamic = 'force-dynamic';

export const GET = blobArea('raise', ['rounds', 'posters', 'inspiration']);
