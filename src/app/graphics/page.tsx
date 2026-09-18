import type { Metadata } from 'next';
import Link from 'next/link';

import { getPost, postFigures } from '@/lib/blog';
import { backgroundLabel, clipSrc, getAreas, visualSrc } from '@/lib/graphics';

import './graphics.css';

export const metadata: Metadata = {
  title: 'Graphics',
  description:
    'Every illustration of the docs-redesign series: the thirty-six visuals of Designing docs for humans by area, with what each shows and the glyphfield export it sits on, and the figures of the two posts before it.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** The two earlier posts whose figures the page lists, with the section that introduces them. */
const EARLIER = [
  { slug: 'rewriting-our-docs', lead: 'Part one of the series: the content rewrite, illustrated with captures of the shipped docs.' },
  { slug: 'fuma-nama', lead: 'The interview with the creator of Fumadocs: the landing page, the slider, and the architecture diagram drawn in the post.' },
] as const;

/**
 * /graphics: the authoritative set. Reads graphics/build/manifest.json,
 * which the generator writes, and shows each visual's export with its
 * name, what it shows and its background, grouped by the area of the post
 * it illustrates; then the figures of the two earlier posts.
 */
export default function GraphicsPage() {
  const areas = getAreas();
  const total = areas.reduce((n, area) => n + area.visuals.length, 0);
  return (
    <main className='gfx-root'>
      <header className='gfx-head'>
        <p className='gfx-eyebrow'>Graphics</p>
        <h1>The illustrations, all of them</h1>
        <p className='gfx-lead'>
          The {total} visuals made for <Link href='/blog/designing-docs-for-humans'>Designing docs for humans</Link>, by the
          area of the post they illustrate, each on its own glyphfield export. The post uses most of them in carousels; the
          rest are kept here. The procedure and the toolchain are in <Link href='/docs/graphics'>the graphics pipeline</Link>.
        </p>
      </header>

      {areas.map((area) => (
        <section key={area.id} className='gfx-area' id={`area-${area.id.toLowerCase()}`}>
          <header className='gfx-area-head'>
            <p className='gfx-eyebrow'>
              {area.id === 'H' ? 'Covers' : `Area ${area.id}`} · {area.visuals.length}
            </p>
            <h2>{area.name}</h2>
            <p>{area.slot}</p>
          </header>
          <ol className='gfx-grid'>
            {area.visuals.map((visual, i) => {
              const clip = visual.animated ? clipSrc(visual.id) : undefined;
              return (
                <li key={visual.id} className='gfx-card' id={visual.id}>
                  <a className='gfx-shot' href={clip ?? visualSrc(visual.id)} rel='noreferrer' target='_blank'>
                    <img
                      src={clip ?? visualSrc(visual.id)}
                      alt={visual.name}
                      width={visual.w}
                      height={visual.h}
                      loading='lazy'
                      decoding='async'
                    />
                  </a>
                  <div className='gfx-copy'>
                    <p className='gfx-index'>
                      {String(i + 1).padStart(2, '0')} <span className='gfx-id'>{visual.id}</span>
                    </p>
                    <h3>{visual.name}</h3>
                    <p>{visual.why}</p>
                    <p className='gfx-meta'>
                      {backgroundLabel(visual.bg)} · {visual.w}×{visual.h}
                      {visual.animated ? ' · GIF clip' : ''}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {EARLIER.map(({ slug, lead }) => {
        const post = getPost(slug);
        if (!post) return null;
        const figures = [
          ...(post.image ? [{ alt: 'The header cover, dark theme', src: post.image }] : []),
          ...(post.imageLight ? [{ alt: 'The header cover, light theme', src: post.imageLight }] : []),
          ...postFigures(post.body),
        ];
        return (
          <section key={slug} className='gfx-area' id={slug}>
            <header className='gfx-area-head'>
              <p className='gfx-eyebrow'>Earlier in the series · {figures.length}</p>
              <h2>
                <Link href={`/blog/${slug}`}>{post.title}</Link>
              </h2>
              <p>{lead}</p>
            </header>
            <ol className='gfx-grid'>
              {figures.map((figure, i) => (
                <li key={figure.src} className='gfx-card'>
                  <a className='gfx-shot' href={figure.src} rel='noreferrer' target='_blank'>
                    <img src={figure.src} alt={figure.alt} loading='lazy' decoding='async' />
                  </a>
                  <div className='gfx-copy'>
                    <p className='gfx-index'>{String(i + 1).padStart(2, '0')}</p>
                    <p>{figure.alt}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
