/** A looping, muted clip; the posts embed their interaction recordings with it. */
export default function Video({ src }: { src: string }) {
  return <video className='blog-video' src={src} loop muted controls autoPlay playsInline />;
}
