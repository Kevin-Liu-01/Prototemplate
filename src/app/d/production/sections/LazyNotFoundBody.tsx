'use client';

import dynamic from 'next/dynamic';

/**
 * The 404 body as its own chunk. Next lists the not-found entry's chunks on
 * every page under /d/production, so a static import would load the nav,
 * the footer and the corner on every page a second time.
 */
const LazyNotFoundBody = dynamic(() => import('./NotFoundBody'));

export default LazyNotFoundBody;
