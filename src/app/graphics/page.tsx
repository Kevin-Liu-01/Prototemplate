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

/** What ships beside the post: the social card in both themes, and the contact sheets the set was reviewed on. */
const CARDS = [
  { src: '/static/blogs/designing-docs-og.png', alt: 'The social card (Open Graph and Twitter), dark theme, 2400×1260', w: 2400, h: 1260 },
  { src: '/static/blogs/designing-docs-og-light.png', alt: 'The social card, light theme, 2400×1260', w: 2400, h: 1260 },
  { src: '/graphics/sheets/designing-docs-sheet0.png', alt: 'Contact sheet 1 of 3: areas A to D at thumbnail size', w: 2560, h: 1536 },
  { src: '/graphics/sheets/designing-docs-sheet1.png', alt: 'Contact sheet 2 of 3: areas D to F', w: 2560, h: 1536 },
  { src: '/graphics/sheets/designing-docs-sheet2.png', alt: 'Contact sheet 3 of 3: the covers', w: 2560, h: 768 },
] as const;

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

      <section className='gfx-area' id='cards-and-sheets'>
        <header className='gfx-area-head'>
          <p className='gfx-eyebrow'>Cards and sheets · {CARDS.length}</p>
          <h2>What ships beside the post</h2>
          <p>
            The social card the post's Open Graph and Twitter tags point at, in both themes, and the contact sheets the
            finished set was reviewed on at the size a reader meets it.
          </p>
        </header>
        <ol className='gfx-grid'>
          {CARDS.map((card, i) => (
            <li key={card.src} className='gfx-card'>
              <a className='gfx-shot' href={card.src} rel='noreferrer' target='_blank'>
                <img src={card.src} alt={card.alt} width={card.w} height={card.h} loading='lazy' decoding='async' />
              </a>
              <div className='gfx-copy'>
                <p className='gfx-index'>{String(i + 1).padStart(2, '0')}</p>
                <p>{card.alt}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {EARLIER.map(({ slug, lead }) => {
        const post = getPost(slug);
        if (!post) return null;
        const figures = [
          ...(post.image ? [{ alt: 'The header cover, dark theme', src: post.image }] : []),
          ...(post.imageLight ? [{ alt: 'The header cover, light theme', src: post.imageLight }] : []),
          ...(post.ogImage ? [{ alt: 'The social card (Open Graph and Twitter)', src: post.ogImage }] : []),
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
