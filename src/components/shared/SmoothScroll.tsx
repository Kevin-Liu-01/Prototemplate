'use client';

/**
 * Native scroll, on purpose. This used to mount Lenis, but the post-wheel
 * glide kept coasting after the hand stopped and fought real mice — so the
 * wrapper is now a pass-through. It stays in the tree so every page shell
 * keeps its structure, and so a future scroll engine has one mount point.
 * Consumers that held `window.lenis` (via getLenis()) all carry native
 * fallbacks.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
