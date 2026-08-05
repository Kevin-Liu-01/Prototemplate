/**
 * The house code block: mono, quiet, hairline-boxed. No syntax rainbow —
 * the ink hierarchy (label in ink-3, body in ink-2) is the whole palette,
 * and the box draws its one border plus one internal seam under the label.
 */
export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <figure className='ptc-code'>
      {label ? <figcaption>{label}</figcaption> : null}
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
