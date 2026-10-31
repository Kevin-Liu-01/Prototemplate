import { seoRoute } from '@/lib/seo/route';

import './error.css';

const route = seoRoute({
  path: '/not-found',
  title: 'Page not found',
  kind: 'error',
  notFound: true,
  description: 'No page on Prototemplate has this address. The gallery links to the docs, the brand book and every other page.',
});

export const metadata = route.metadata;

/**
 * Every 404 outside /d/production, which has its own: an address no route
 * answers and every notFound() a route throws. It replaces Next's built-in
 * page, which writes a second <title> in its body, and its head names no
 * robots, since Next writes the one noindex (seoRoute's notFound).
 */
export default function NotFound() {
  return (
    <main className='pt-error'>
      <h1>This page does not exist</h1>
      <div className='pt-error-acts'>
        <a className='pt-ib' href='/'>
          Back to the gallery
        </a>
      </div>
    </main>
  );
}
