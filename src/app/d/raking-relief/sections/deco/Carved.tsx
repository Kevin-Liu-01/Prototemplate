/**
 * The two ways text is cut on this wall. Carved text stands proud of the
 * ground: the letters cast a Bayer-tier shadow to the right and down, printed
 * by the element's own ::before from data-text, so there is exactly one text
 * node and one lang/dir pair. Incised text is cut into the ground: the
 * letters are the shadowed floor of the groove and the lip of the cut that
 * faces the light prints once, one pixel down and right, from the same
 * attribute. Both are server components; the relief is CSS.
 * Home: every heading (carved) and every sunk register's strings (incised).
 */

type CutProps = {
  text: string;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  className?: string;
};

export function Carved({ text, lang, dir, className }: CutProps) {
  return (
    <span className={className ? `rr-carved ${className}` : 'rr-carved'} data-text={text} lang={lang} dir={dir}>
      {text}
    </span>
  );
}

export function Incised({ text, lang, dir, className }: CutProps) {
  return (
    <span className={className ? `rr-cut ${className}` : 'rr-cut'} data-text={text} lang={lang} dir={dir}>
      {text}
    </span>
  );
}
