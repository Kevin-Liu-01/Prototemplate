import ReviewWorkspace from './ReviewWorkspace';

/**
 * Act IV — source beside translation, revision state carried by type alone.
 * The workspace is fork-local now (sections/ReviewWorkspace.tsx, toolchain's
 * typing editor rescoped): four real rows, one writing itself at a time.
 * The section keeps its #review anchor — ReviewWorkspace carries the id.
 */
export default function Review() {
  return <ReviewWorkspace />;
}
