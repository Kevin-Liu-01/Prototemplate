type LogoItem = {
  name: string;
  url: string;
  lightSrc: string;
  darkSrc: string;
  className?: string;
  scale?: number;
};

const customers: LogoItem[] = [
  {
    name: 'Cursor',
    url: 'https://www.cursor.com',
    lightSrc: '/logos/cursor.light.svg',
    darkSrc: '/logos/cursor.dark.svg',
    scale: 1.12,
  },
  {
    name: 'Ramp',
    url: 'https://ramp.com',
    lightSrc: '/logos/ramp.light.svg',
    darkSrc: '/logos/ramp.dark.svg',
    scale: 1.08,
  },
  {
    name: 'Profound',
    url: 'https://www.tryprofound.com',
    lightSrc: '/logos/profound.light.svg',
    darkSrc: '/logos/profound.dark.svg',
    scale: 0.8,
  },
  {
    name: 'Partiful',
    url: 'https://www.partiful.com',
    lightSrc: '/logos/partiful.light.svg',
    darkSrc: '/logos/partiful.dark.svg',
  },
  {
    name: 'Clickhouse',
    url: 'https://www.clickhouse.com',
    lightSrc: '/logos/clickhouse.light.svg',
    darkSrc: '/logos/clickhouse.dark.svg',
    /* the SVG bakes in tall vertical padding — scale up for optical
       parity with the other marks */
    scale: 1.2,
  },
  {
    name: 'Sierra',
    url: 'https://sierra.ai',
    lightSrc: '/logos/sierra.light.svg',
    darkSrc: '/logos/sierra.dark.svg',
  },
];

/**
 * The live page's proof wall, its light/dark mark swap re-keyed to this
 * site's data-theme attribute (the source's Tailwind dark: variant keys
 * to prefers-color-scheme here, which the toggle would ignore).
 */
export default function LogosGrid() {
  function scaleStyle(item: LogoItem): React.CSSProperties | undefined {
    if (!item.scale || item.scale === 1) return undefined;
    return { transform: `scale(${item.scale})` };
  }

  return (
    <div className='mx-auto flex flex-wrap items-center justify-center gap-y-6 py-4 sm:gap-x-6'>
      {customers.map((c) => (
        <a
          key={c.name}
          href={c.url}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={`${c.name} website`}
          className='careers-logo opacity-80 grayscale hover:opacity-100 hover:grayscale-0 transition group relative box-border flex h-12 min-w-[160px] shrink-0 basis-1/2 transform-gpu items-center justify-center px-0.5 py-2 transition-transform duration-300 ease-out hover:scale-[1.05] sm:h-14 sm:min-w-[200px] sm:basis-[24%]'
        >
          <img
            src={c.lightSrc}
            alt={c.name}
            height={40}
            width={140}
            loading='eager'
            className={`careers-logo-light h-7 w-auto shrink-0 transition-opacity duration-300 sm:h-8 ${c.className ?? ''}`}
            style={scaleStyle(c)}
          />
          <img
            src={c.darkSrc}
            alt={c.name}
            height={40}
            width={140}
            loading='eager'
            className={`careers-logo-dark h-7 w-auto shrink-0 transition-opacity duration-300 sm:h-8 ${c.className ?? ''}`}
            style={scaleStyle(c)}
          />
        </a>
      ))}
    </div>
  );
}
