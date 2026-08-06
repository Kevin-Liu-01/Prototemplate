import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The locale-pill demo plate — the real component in the dark-surface pill
 * idiom: flag first, code in the surface's mono, the host supplying the box.
 * The set exercises the mapping's edges: explicit region subtags flying
 * their own flag (en-GB, ar-EG), bases resolving through the language map,
 * and zh-Hant resolving through zh.
 */
const LOCS = ['en-GB', 'es', 'ja', 'ar-EG', 'ko', 'zh-Hant', 'hi', 'pt'] as const;

export default function PillsDemo() {
  return (
    <div className='ptc-pills'>
      {LOCS.map((loc) => (
        <span className='ptc-pill' key={loc}>
          <LocaleTag code={loc} />
        </span>
      ))}
    </div>
  );
}
