/* Coordinates as the press prints them: degrees, minutes and seconds with
   the seconds to four places, then the hemisphere letter, as in
   45° 55' 25.3092'' N 6° 52' 9.9588'' E. */

export type LatLon = { lat: number; lon: number };

/** One axis: 37.7749 on 'lat' prints 37° 46' 29.6400'' N. */
export function dms(value: number, axis: 'lat' | 'lon', places = 4): string {
  const abs = Math.abs(value);
  let degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  let minutes = Math.floor(minutesFloat);
  let seconds = ((minutesFloat - minutes) * 60).toFixed(places);
  if (Number(seconds) >= 60) {
    seconds = (0).toFixed(places);
    minutes += 1;
  }
  if (minutes >= 60) {
    minutes = 0;
    degrees += 1;
  }
  const negative = value < 0 && abs > 0;
  const letter = axis === 'lat' ? (negative ? 'S' : 'N') : negative ? 'W' : 'E';
  return `${degrees}° ${minutes}' ${seconds}'' ${letter}`;
}

/** Both axes on one line, latitude first. */
export function dmsPair(point: LatLon, places = 4): string {
  return `${dms(point.lat, 'lat', places)} ${dms(point.lon, 'lon', places)}`;
}

/** San Francisco, where General Translation works from. */
export const HOME: LatLon = { lat: 37.7749, lon: -122.4194 };
