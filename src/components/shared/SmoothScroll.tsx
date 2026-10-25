'use client';

/**
 * Native scroll, on purpose: a smoothing engine's post-wheel glide keeps
 * coasting after the hand stops and fights real mice. The wrapper returns
 * its children, so every page shell keeps its structure and a scroll
 * engine would have one mount point.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
