import ReviewWorkspace from './ReviewWorkspace';

/**
 * Act IV — source beside translation, revision state carried by type alone.
 * The workspace itself is fork-local now (sections/ReviewWorkspace.tsx,
 * toolchain current): four real rows, one writing itself at a time.
 */
export default function Review() {
  return <ReviewWorkspace />;
}
