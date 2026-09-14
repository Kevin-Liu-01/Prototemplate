/**
 * brick-lattice · a code face.
 *
 * Home: the kiln's Libraries panel. The shipped sample printed line by
 * line with numbers, tokenised only as far as the product needs: quoted
 * strings take the one syntax hue, because strings are what GT translates;
 * everything else sits in two steps of the panel's ink. No invented
 * highlighting, no invented code.
 */
export type CodeFaceProps = { code: string };

const SPLIT = /("[^"]*"|'[^']*')/;
const IS_STRING = /^("[^"]*"|'[^']*')$/;

function tokens(line: string, key: number) {
  const parts = line.split(SPLIT);
  return parts.map((part, i) =>
    IS_STRING.test(part) ? (
      <span className='bl-str' key={`${key}-${i}`}>
        {part}
      </span>
    ) : (
      <span key={`${key}-${i}`}>{part}</span>
    )
  );
}

export default function CodeFace({ code }: CodeFaceProps) {
  const lines = code.split('\n');
  return (
    <pre className='bl-code'>
      <code>
        {lines.map((line, i) => (
          <span className='bl-code-line' key={i}>
            <span className='bl-code-n' aria-hidden='true'>
              {String(i + 1).padStart(2, ' ')}
            </span>
            <span className='bl-code-src'>{line.length ? tokens(line, i) : ' '}</span>
          </span>
        ))}
      </code>
    </pre>
  );
}
