import { project } from '../geo/sheet';
import type { MapSheet as Sheet } from '../stories';

/* The map sheet printed inside a story's magazine, which the rack's lifted
   corner shows: the story's place drawn as a survey sheet is, in one
   drawing the page's size. A double neat line, the graticule every five
   degrees (ten on a wide sheet) labelled in its border, land as a dot to
   each degree (or half degree, on a close sheet) on a pale sea, the story's
   places and the road between them, and a title block at the top left. The
   legend sits in the map's bottom right corner, where the corner lifts, its
   rows set from the right so the fold shows their symbols first, over a
   true scale bar; the sheet's number and who compiled it run in the border
   under it. The map prints in its magazine's own colours: the cover's
   stock for the sea and its ink for the land (rack.css, --map-sea and
   --map-ink). Places are drawn at equal scale about the sheet's centre
   latitude (geo/sheet.ts). */

/** The page in the drawing's own units, the magazine's proportions. */
const W = 300;
const H = 395;
/** The neat lines: the outer one, and the inner one round the map, with the border band between them for the labels. */
const OUT = 6;
const IN = 18;
/** How near the map's edge a graticule line may run before it and its label are left out. */
const EDGE_CLEAR = 8;
/** The longest line of a title in the title block, in characters, before it takes a second. */
const TITLE_LINE = 20;

const label = (deg: number, pos: string, neg: string) => `${Math.round(Math.abs(deg))}°${deg >= 0 ? pos : neg}`;

/** The longest round distance whose bar fits `room` units at `km` kilometres a unit. */
function scaleOf(room: number, km: number): number {
  const steps = [25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
  return steps.filter((d) => d / km <= room).at(-1) ?? steps[0]!;
}

/** A title in one line, or two broken at the space nearest its middle. */
function titleLines(title: string): string[] {
  if (title.length <= TITLE_LINE) return [title];
  const mid = title.length / 2;
  const spaces = [...title.matchAll(/ /g)].map((m) => m.index ?? 0);
  const at = spaces.reduce((best, i) => (Math.abs(i - mid) < Math.abs(best - mid) ? i : best), spaces[0] ?? title.length);
  return [title.slice(0, at), title.slice(at + 1)];
}

export default function MapSheet({ sheet, n, title, month }: { sheet: Sheet; n: string; title: string; month: string }) {
  const [x0, y0, x1, y1] = [IN, IN, W - IN, H - IN];
  const { at, land, step, km, latMin, latMax, lonMin } = project(sheet, x0, y0, x1, y1);

  const every = sheet.span > 40 ? 10 : sheet.span > 16 ? 5 : 2;
  const lons: number[] = [];
  for (let lon = Math.ceil(lonMin / every) * every; lon < lonMin + sheet.span; lon += every) {
    const x = at(0, lon)[0];
    if (x - x0 > EDGE_CLEAR && x1 - x > EDGE_CLEAR) lons.push(lon);
  }
  const lats: number[] = [];
  for (let lat = Math.ceil(latMin / every) * every; lat < latMax; lat += every) {
    const y = at(lat, 0)[1];
    if (y - y0 > EDGE_CLEAR && y1 - y > EDGE_CLEAR) lats.push(lat);
  }

  const spots = sheet.places.map((place) => ({ place, xy: at(place.lat, place.lon) }));
  const distance = scaleOf(48, km);
  // rounded, so the server's and the browser's number formatting agree (Safari prints one digit fewer)
  const bar = Math.round((distance / km) * 100) / 100;
  const lines = titleLines(title);
  // the legend's box in the map's bottom right corner, its right and bottom sides on the frame's: those sides, then its size
  const [bx, by, bw, bh] = [x1, y1, 104, 68];

  return (
    <svg className='gtp-map' viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='xMidYMid slice' aria-hidden='true'>
      <defs>
        <clipPath id={`map-${n}`}>
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
        </clipPath>
      </defs>
      <rect className='gtp-map-sea' x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
      <g clipPath={`url(#map-${n})`}>
        <path className='gtp-map-land' d={land} />
        {lons.map((lon) => (
          <line key={`o${lon}`} className='gtp-map-grat' x1={at(0, lon)[0]} x2={at(0, lon)[0]} y1={y0} y2={y1} />
        ))}
        {lats.map((lat) => (
          <line key={`a${lat}`} className='gtp-map-grat' x1={x0} x2={x1} y1={at(lat, 0)[1]} y2={at(lat, 0)[1]} />
        ))}
        {sheet.route ? <polyline className='gtp-map-route' points={spots.map((s) => s.xy.map((v) => v.toFixed(1)).join(',')).join(' ')} /> : null}
        {spots.map(({ place, xy: [x, y] }) => {
          const left = x > x1 - 70;
          return (
            <g key={place.name}>
              <circle className={place.home ? 'gtp-map-home' : 'gtp-map-city'} cx={x} cy={y} r={place.home ? 3.2 : 2.2} />
              <text className='gtp-map-place' x={left ? x - 5 : x + 5} y={y + 2.2} textAnchor={left ? 'end' : 'start'}>
                {place.name}
              </text>
            </g>
          );
        })}
      </g>

      {/* the neat lines, and the graticule's degrees in the border between them */}
      <rect className='gtp-map-neat' x={OUT} y={OUT} width={W - 2 * OUT} height={H - 2 * OUT} />
      {lons.map((lon) => (
        <text key={`ol${lon}`} className='gtp-map-deg' x={at(0, lon)[0]} y={OUT + 8.2} textAnchor='middle'>
          {label(lon, 'E', 'W')}
        </text>
      ))}
      {lats.map((lat) => (
        <g key={`al${lat}`}>
          <text className='gtp-map-deg' transform={`translate(${OUT + 8.2} ${at(lat, 0)[1]}) rotate(-90)`} textAnchor='middle'>
            {label(lat, 'N', 'S')}
          </text>
          <text className='gtp-map-deg' transform={`translate(${W - OUT - 3.8} ${at(lat, 0)[1]}) rotate(-90)`} textAnchor='middle'>
            {label(lat, 'N', 'S')}
          </text>
        </g>
      ))}

      {/* the title block, its title on one line or two */}
      <rect className='gtp-map-box' x={x0 + 6} y={y0 + 6} width={150} height={36 + 11 * lines.length} />
      <text className='gtp-map-cap' x={x0 + 13} y={y0 + 17}>
        Atlas No. {n}
      </text>
      {lines.map((line, i) => (
        <text key={i} className='gtp-map-title' x={x0 + 13} y={y0 + 30 + 11 * i}>
          {line}
        </text>
      ))}
      <text className='gtp-map-cap' x={x0 + 13} y={y0 + 33 + 11 * lines.length}>
        {sheet.note}
      </text>

      {/* the legend in the corner that lifts, each row's symbol at its right with its words before it, over the scale */}
      <rect className='gtp-map-box' x={bx - bw} y={by - bh} width={bw} height={bh} />
      <text className='gtp-map-cap gtp-map-strong' x={bx - 7} y={by - 55} textAnchor='end'>
        Legend
      </text>
      <path
        className='gtp-map-land'
        d={`M${bx - 15} ${by - 49.4}h2.6v2.6h-2.6zM${bx - 11} ${by - 49.4}h2.6v2.6h-2.6zM${bx - 15} ${by - 45.4}h2.6v2.6h-2.6zM${bx - 11} ${by - 45.4}h2.6v2.6h-2.6z`}
      />
      <text className='gtp-map-key' x={bx - 19} y={by - 43.6} textAnchor='end'>
        {step === 1 ? 'Land, a dot a degree' : 'Land, a dot a half degree'}
      </text>
      <circle className='gtp-map-city' cx={bx - 11.7} cy={by - 34.6} r={2.2} />
      <text className='gtp-map-key' x={bx - 19} y={by - 32.4} textAnchor='end'>
        City
      </text>
      {sheet.route ? (
        <line className='gtp-map-route' x1={bx - 17} x2={bx - 7} y1={by - 23.4} y2={by - 23.4} />
      ) : (
        <circle className='gtp-map-home' cx={bx - 11.7} cy={by - 23.4} r={3.2} />
      )}
      <text className='gtp-map-key' x={bx - 19} y={by - 21.2} textAnchor='end'>
        {sheet.route ?? sheet.note}
      </text>
      {/* the scale bar in four parts, black and white in turn, ending at the legend's right */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className={i % 2 ? 'gtp-map-bar-w' : 'gtp-map-bar'} x={bx - 7 - bar + (i * bar) / 4} y={by - 14} width={bar / 4} height={2.4} />
      ))}
      {bar >= 34 ? (
        <text className='gtp-map-num' x={bx - 7 - bar} y={by - 5} textAnchor='middle'>
          0
        </text>
      ) : null}
      <text className='gtp-map-num' x={bx - 7} y={by - 5} textAnchor='end'>
        {`${distance.toLocaleString('en-US')} km`}
      </text>

      {/* the foot: who compiled the sheet, and its number */}
      <text className='gtp-map-cap gtp-map-foot' x={x0} y={H - OUT - 3.6}>
        Compiled by General Translation, {month}
      </text>
      <text className='gtp-map-cap gtp-map-foot gtp-map-strong' x={x1} y={H - OUT - 3.6} textAnchor='end'>
        Sheet {n}
      </text>
      {/* the map's frame last, so the boxes on its edges never paint over it */}
      <rect className='gtp-map-frame' x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
    </svg>
  );
}
