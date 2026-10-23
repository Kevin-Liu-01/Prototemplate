/* Where the reader is, as the host's edge reads it from their address
   (Vercel's x-vercel-ip-city, -latitude and -longitude), for the front
   page's dateline: a city and its coordinates, or null where the edge does
   not say, and the page keeps San Francisco. Never cached, as it is the
   reader's own, and never stored. */

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const city = request.headers.get('x-vercel-ip-city');
  const lat = Number(request.headers.get('x-vercel-ip-latitude'));
  const lon = Number(request.headers.get('x-vercel-ip-longitude'));
  const here = city && Number.isFinite(lat) && Number.isFinite(lon) ? { city: decodeURIComponent(city), lat, lon } : null;
  return Response.json(here, { headers: { 'Cache-Control': 'private, no-store' } });
}
