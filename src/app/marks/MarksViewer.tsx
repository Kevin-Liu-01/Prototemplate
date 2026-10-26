'use client';

import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';
import { BookHead } from '@/components/viewer/BookView';
import { gtText } from '@/components/viewer/GtWord';
import { Icon } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import {
  GLOBE_CONCEPTS,
  HEMISPHERE_FAMILIES,
  HEMISPHERE_MARKS,
  HEMISPHERE_POSTER,
  hemispherePoster,
  MARK_FACES,
  MARK_FAMILIES,
  MARK_RULES,
  MARK_SIZES,
  MARKS,
  markFamily,
  PRODUCTION_MARKS,
  WORDMARK_SIZES,
} from '@/lib/marks';
import type { HemisphereFamily, HemisphereMark, Mark, MarkArt, ProductionMark } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import './marks.css';

const MARKS_TITLE = PAGE_NAMES.marks.name;
const MARKS_MODES: readonly ShellMode[] = ['book', 'grid'];

/* the four groups of the page, top to bottom; each is one part of the book */
const PRODUCTION_ID = 'production';
const HEMISPHERES_ID = 'hemispheres';
const BAR_ID = 'bar-collection';
const EXPLORATIONS_ID = 'other-explorations';

/* the blocks inside the groups that the list and the read line name */
const REGISTER_ID = 'register';
const PRESENTATION_ID = 'presentation';
const CONCEPTS_ID = 'concepts';

const SPEED_MARKS = MARKS.filter((mark) => mark.family === 'speed');
const PICTURE_MARKS = MARKS.filter((mark) => mark.family === 'picture');
const EXPLORATION_COUNT = PICTURE_MARKS.length + GLOBE_CONCEPTS.length;
const TOTAL = PRODUCTION_MARKS.length + HEMISPHERE_MARKS.length + MARKS.length + GLOBE_CONCEPTS.length;

const familyId = (family: HemisphereFamily) => `hemi-${family.id}`;
const familyMarks = (family: HemisphereFamily) => HEMISPHERE_MARKS.filter((mark) => mark.family === family.id);

const BOOK_LEAD = `The two marks General Translation ships today come first, then the ${HEMISPHERE_MARKS.length} hemispheres marks, the bar monogram collection and every other exploration.`;

const BOOK_NOTE =
  'Only the doubled-line GT monogram and the Locadex mark are in production. Every mark is one color and takes the ink of whatever it sits on.';

const PRODUCTION_LEAD =
  'These two marks are live on generaltranslation.com and in the dashboard. Every other mark on this page is an exploration and ships nowhere.';

const HEMISPHERES_LEAD = `The newest round. A disc is split in two: the west half draws the G and the east half draws the T. Every cut through the ring continues a stroke edge of the mark. The ${HEMISPHERE_MARKS.length} marks fall into ${HEMISPHERE_FAMILIES.length} families by what the east half does.`;

const BAR_LEAD = `The speed set: ${SPEED_MARKS.length} marks in one register, taken from a race-type reference, with the rules they follow and the bar monogram sting.`;

const EXPLORATIONS_LEAD = `Two-way and Globe G from the round before the speed set, and ${GLOBE_CONCEPTS.length} globe concepts from 2026-10. None was chosen.`;

const REGISTER_LEAD =
  'The speed set follows one register, taken from a race-type reference. The rules below name it, and a mark that keeps them belongs to the set.';

const PRESENTATION_TITLE = 'The speed set together';
const PRESENTATION_LEAD = `The ${SPEED_MARKS.length} speed marks at one height, positive and reversed, so the set reads as a set.`;

const CONCEPTS_TITLE = 'Globe concepts that didn’t make it';
const CONCEPTS_LEAD = `${GLOBE_CONCEPTS.length} globe concepts from 2026-10, in which the letters G and T form a globe. None was chosen.`;

/** A family's name in its marks' sheet heads. */
const FAMILY_NAME: Readonly<Record<string, string>> = { speed: 'Speed set', picture: 'Earlier round' };

/** The name shown beside the favicon in the tab mock; the product name, not a claim. */
const TAB_TITLE = 'General Translation';

/** The share of the app icon tile the mark fills; 0.64 leaves the platform's own safe area clear. */
const APP_ICON_SHARE = 0.64;
const APP_ICON_PX = 128;
const APP_MARK_PX = Math.round(APP_ICON_PX * APP_ICON_SHARE);

/**
 * The flow sheet's reading column at the 1440 viewport with the sidebar
 * open, the view the captures show: 1440 less the 208px sidebar
 * (tokens.css), the sheet's 28px pads, the mat's 1px borders and the
 * sheet's 56px side padding (Sheet.css). On a wider stage the column grows
 * and the plates gain room; marks.css clamps every instance on a narrower one.
 */
const COLUMN_W = 1440 - 208 - 2 * 28 - 2 - 2 * 56;

/** A plate's border and side padding (marks.css: .mk-plate, .mk-strip, .mk-field). */
const PLATE_SIDE = 1 + 32;

/** The inner width of a full-width plate, and of one plate of a side-by-side pair (a 16px gap between them). */
const PLATE_INNER = COLUMN_W - 2 * PLATE_SIDE;
const HALF_INNER = (COLUMN_W - 16) / 2 - 2 * PLATE_SIDE;

/** The height a speed or picture mark is shown at on its plates; a mark too wide for it takes the plate's full width instead. */
const HERO_PX = 224;

/** The height every speed mark is shown at on the presentation field. */
const FIELD_PX = 64;

/** A mark whose viewBox is wider than this is laid out full width: its plates stack instead of pairing. */
const WIDE = 1.5;

/** The heights a wordmark can be shown at, smallest first; a wordmark takes the largest three that fit its plate. */
const LADDER: readonly number[] = [16, 24, 32, ...WORDMARK_SIZES];

/** A card's mark: large on its plate, then the run of heights under it. */
const CARD_HERO_PX = 112;
const CARD_SIZES: readonly number[] = [48, 32, 16];

/** A production card's mark, on each of its two plates. */
const FEATURE_HERO_PX = 160;

/** The 16px cut, drawn at 1x and enlarged so its pixels read. */
const CUT_PX = 16;
const CUT_ZOOM = 3;

/** The list: the four groups as the run under Knowledge > Marks. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: PRODUCTION_ID,
    label: 'In production',
    under: 'marks',
    items: [
      {
        id: PRODUCTION_ID,
        n: '',
        title: 'In production',
        desc: 'The doubled-line GT monogram and the Locadex mark, the two marks generaltranslation.com ships.',
      },
    ],
  },
  {
    id: HEMISPHERES_ID,
    label: 'Hemispheres',
    under: 'marks',
    items: [
      { id: HEMISPHERES_ID, n: '', title: 'The round', desc: HEMISPHERES_LEAD },
      ...HEMISPHERE_FAMILIES.map((family, i) => ({
        id: familyId(family),
        n: pad2(i + 1),
        title: family.name,
        desc: `${familyMarks(family).length} marks. ${family.text}`,
      })),
    ],
  },
  {
    id: BAR_ID,
    label: 'Bar monogram',
    under: 'marks',
    items: [
      { id: REGISTER_ID, n: '', title: 'The register', desc: 'The rules the speed set follows.' },
      ...SPEED_MARKS.map((mark, i) => ({
        id: mark.id,
        n: pad2(i + 1),
        title: mark.name,
        desc: `${markFamily(mark).label}. ${mark.thesis}`,
      })),
      { id: PRESENTATION_ID, n: '', title: PRESENTATION_TITLE, desc: PRESENTATION_LEAD },
    ],
  },
  {
    id: EXPLORATIONS_ID,
    label: 'Other explorations',
    under: 'marks',
    items: [
      ...PICTURE_MARKS.map((mark, i) => ({
        id: mark.id,
        n: pad2(i + 1),
        title: mark.name,
        desc: `${markFamily(mark).label}. ${mark.thesis}`,
      })),
      { id: CONCEPTS_ID, n: '', title: CONCEPTS_TITLE, desc: CONCEPTS_LEAD },
    ],
  },
];

/** How a mark sits on a plate: at a height in CSS pixels, or across the plate's full width with the height following. */
type PlateFit = number | 'full';

/** At `max` height when that width fits the plate's inner width, else across the plate's full width. */
function fitPlate(aspect: number, inner: number, max: number): PlateFit {
  return max * aspect <= inner ? max : 'full';
}

/** The caption's size for a fit: the height, or the full width. */
function fitLabel(fit: PlateFit): string {
  return fit === 'full' ? 'full width' : `${fit}px`;
}

/**
 * The run of heights a speed or picture mark is shown at: a monogram takes
 * the 16 to 128px row; a wordmark takes the largest three of the ladder
 * whose width fits its plate.
 */
function sizesFor(mark: Mark, aspect: number, inner: number): readonly number[] {
  if (mark.kind === 'monogram') return MARK_SIZES;
  return LADDER.filter((height) => height * aspect <= inner).slice(-WORDMARK_SIZES.length);
}

/** The width style of an instance: its height times the file's aspect, or the plate's full width. */
function sizeStyle(height: PlateFit, aspect: number): CSSProperties {
  return {
    '--mk-w': height === 'full' ? '100%' : `${Math.round(height * aspect)}px`,
    '--mk-aspect': String(aspect),
  };
}

type ArtProps = {
  /** the SVG file's markup, read on the server */
  svg: string;
  height: PlateFit;
  /** the file's viewBox aspect, width over height */
  aspect: number;
  className?: string;
};

/**
 * One inlined SVG, for the speed and picture marks: the root keeps its own
 * attributes (the construction overlays set their stroke on it), and the
 * plate's color reaches it as currentColor.
 */
function Art({ svg, height, aspect, className }: ArtProps) {
  return (
    <span
      className={cn('mk-svg', className)}
      style={sizeStyle(height, aspect)}
      aria-hidden='true'
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * One mark drawn by mask: the plate's color masked by the public file,
 * contained. The cards draw every mark this way, so a file loads once
 * however many times it is shown, and the mark takes the plate's ink as an
 * inlined one would.
 */
function MaskArt({ file, height, aspect }: { file: string; height: number; aspect: number }) {
  const style: CSSProperties = { ...sizeStyle(height, aspect), '--mk-mask': `url('${file}')` };
  return <span className='mk-svg mk-mask' style={style} aria-hidden='true' />;
}

const GROUNDS = ['paper', 'ink'] as const;
type Ground = (typeof GROUNDS)[number];

const groundClass = (ground: Ground) => (ground === 'paper' ? 'is-paper' : 'is-ink');
const groundName = (ground: Ground) => (ground === 'paper' ? 'Positive' : 'Reversed');

/** A file link: the file's name as the label unless one is given, and a download. */
type CardFile = { href: string; label?: string };

const fileName = (href: string) => href.slice(href.lastIndexOf('/') + 1);

type MarkCardProps = {
  name: string;
  /** the file the card draws */
  file: string;
  aspect: number;
  /** the heading level: h3 on a production card, h4 inside a family or the concepts */
  level: 'h3' | 'h4';
  /** short tags after the name: the round, Pick, In production */
  tags?: readonly ReactNode[];
  /** the 16px cut, when the mark has one */
  file16?: string;
  /** one or two sentences under the name */
  note?: ReactNode;
  files: readonly CardFile[];
  /** a production card: both grounds, larger, and the full run of heights */
  feature?: boolean;
  /** one of Kevin's picks: the card takes the ink frame */
  pick?: boolean;
};

/**
 * The one card every mark without a sheet of notes takes: the mark large on
 * its plate (both grounds on a production card), the run of heights in the
 * same ink, the 16px cut when the mark has one, then the name, the tags,
 * the note and the files.
 */
function MarkCard({ name, file, aspect, level, tags, file16, note, files, feature, pick }: MarkCardProps) {
  const Heading = level;
  const grounds: readonly Ground[] = feature ? GROUNDS : ['paper'];
  const sizes = feature ? [...MARK_SIZES].reverse() : CARD_SIZES;
  return (
    <article className={cn('mk-card', feature && 'is-feature', pick && 'is-pick')}>
      <div className='mk-card-plates'>
        {grounds.map((ground) => (
          <figure key={ground} className={cn('mk-card-plate', groundClass(ground))}>
            <MaskArt file={file} height={feature ? FEATURE_HERO_PX : CARD_HERO_PX} aspect={aspect} />
            {feature && <figcaption>{groundName(ground)}</figcaption>}
          </figure>
        ))}
      </div>
      <div className='mk-card-sizes is-paper'>
        {sizes.map((size) => (
          <span key={size} className='mk-size'>
            <MaskArt file={file} height={size} aspect={aspect} />
            <small>{size}</small>
          </span>
        ))}
      </div>
      {file16 && (
        <div className='mk-card-cut is-paper'>
          <span className='mk-size'>
            <MaskArt file={file16} height={CUT_PX} aspect={1} />
            <small>16 cut</small>
          </span>
          <span className='mk-size'>
            <MaskArt file={file16} height={CUT_PX * CUT_ZOOM} aspect={1} />
            <small>{CUT_ZOOM}x</small>
          </span>
        </div>
      )}
      <div className='mk-card-body'>
        <div className='mk-card-name'>
          <Heading>{name}</Heading>
          {tags && tags.length > 0 && (
            <span className='mk-tags'>
              {tags.map((tag, i) => (
                <span key={i} className='mk-tag'>
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>
        {note && <p className='mk-card-note'>{note}</p>}
        <p className='mk-card-files'>
          {files.map((f) => (
            <a key={f.href} href={f.href} download aria-label={`Download ${fileName(f.href)}`}>
              {f.label ?? fileName(f.href)}
            </a>
          ))}
        </p>
      </div>
    </article>
  );
}

/** A production mark's card: both grounds, the full run of heights, where it ships and every file the sites serve. */
function ProductionCard({ mark }: { mark: ProductionMark }) {
  return (
    <MarkCard
      name={mark.name}
      file={mark.file}
      aspect={mark.aspect}
      level='h3'
      feature
      tags={[
        <>
          <Icon name='check-badge' size={14} />
          In production
        </>,
      ]}
      note={gtText(mark.text)}
      files={mark.files.map((href) => ({ href }))}
    />
  );
}

/** The tags of a hemispheres mark: Pick for Kevin's three, Lead for the mark its family's poster leads with. */
function hemisphereTags(mark: HemisphereMark): readonly string[] {
  const tags: string[] = [];
  if (mark.pick) tags.push('Pick');
  if (mark.lead) tags.push('Lead');
  return tags;
}

function HemisphereCard({ mark }: { mark: HemisphereMark }) {
  return (
    <MarkCard
      name={mark.id}
      file={mark.file}
      aspect={1}
      level='h4'
      tags={hemisphereTags(mark)}
      file16={mark.file16}
      pick={mark.pick}
      files={[
        { href: mark.file, label: 'SVG' },
        { href: mark.file16, label: '16px SVG' },
      ]}
    />
  );
}

/**
 * One family of the hemispheres round: its poster and its words at the
 * head, then its cards in the manifest's order, the variants of one mark
 * side by side.
 */
function FamilyBlock({ family, active }: { family: HemisphereFamily; active: boolean }) {
  const marks = familyMarks(family);
  const id = familyId(family);
  const poster = hemispherePoster(family.id);
  return (
    <div className={cn('mk-sec mk-block', active && 'is-active')} data-id={id} aria-labelledby={`mk-${id}`}>
      <header className='mk-fam-head'>
        <a className='mk-poster' href={poster} aria-label={`${family.name} poster, PNG`}>
          <img src={poster} alt='' width={1100} height={1600} loading='lazy' decoding='async' />
        </a>
        <div className='mk-fam-text'>
          <h3 id={`mk-${id}`}>{family.name}</h3>
          <p className='mk-count'>
            {marks.length} marks in {family.groups.length} groups
          </p>
          <p>{family.text}</p>
          <dl className='mk-groups'>
            {family.groups.map((group) => (
              <div key={group}>
                <dt>{group}</dt>
                <dd>{marks.filter((mark) => mark.group === group).length}</dd>
              </div>
            ))}
          </dl>
          <p className='mk-card-files'>
            <a href={poster} download>
              Poster PNG
            </a>
          </p>
        </div>
      </header>
      <div className='mk-cards'>
        {marks.map((mark) => (
          <HemisphereCard key={mark.id} mark={mark} />
        ))}
      </div>
    </div>
  );
}

type MarkSheetProps = {
  mark: Mark;
  art: MarkArt;
  active: boolean;
};

/**
 * One speed or picture mark with its notes: the mark large, positive and
 * reversed; a run of heights on both grounds; for a monogram the app icon
 * and the favicon in a tab, and for the two picture marks the clean mark
 * beside its construction; a mark's film when it has one; then the thesis,
 * the construction, the use note and the files as ruled rows. Every
 * instance is sized by height and the file's own aspect, so a wide mark
 * lays its plates out full width.
 */
function MarkSheet({ mark, art, active }: MarkSheetProps) {
  const family = markFamily(mark);
  const headingId = `mk-${mark.id}`;
  const wide = art.aspect > WIDE;
  const inner = wide ? PLATE_INNER : HALF_INNER;
  const hero = fitPlate(art.aspect, inner, HERO_PX);
  const sizes = sizesFor(mark, art.aspect, inner);
  const sizeRange = `${sizes[0]} to ${sizes[sizes.length - 1]}px`;
  const monogram = mark.kind === 'monogram';
  /* the app icon: the mark fitted to the tile's safe area, so a wide monogram is set by width */
  const appHeight = art.aspect >= 1 ? APP_MARK_PX / art.aspect : APP_MARK_PX;
  const files = [mark.file, mark.constructionFile, mark.textFile].filter((file): file is string => Boolean(file));
  return (
    <div className={cn('mk-sec mk-block', active && 'is-active')} data-id={mark.id} aria-labelledby={headingId}>
      <header className='mk-block-head'>
        <div className='mk-card-name'>
          <h3 id={headingId}>{mark.name}</h3>
          <span className='mk-tags'>
            <span className='mk-tag'>{FAMILY_NAME[family.id] ?? family.label}</span>
          </span>
        </div>
        <p>{gtText(family.principle)}</p>
      </header>

      <div className={cn('mk-pair', wide && 'is-stack')}>
        {GROUNDS.map((ground) => (
          <figure key={ground} className={cn('mk-plate', groundClass(ground))}>
            <Art svg={art.clean} height={hero} aspect={art.aspect} />
            <figcaption>
              {groundName(ground)}, {fitLabel(hero)}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className={cn('mk-pair', wide && 'is-stack')}>
        {GROUNDS.map((ground) => (
          <figure key={ground} className={cn('mk-strip', groundClass(ground))}>
            <div className='mk-strip-row'>
              {sizes.map((size) => (
                <span key={size} className='mk-size'>
                  <Art svg={art.clean} height={size} aspect={art.aspect} />
                  <small>{size}</small>
                </span>
              ))}
            </div>
            <figcaption>
              {groundName(ground)}, {sizeRange}
            </figcaption>
          </figure>
        ))}
      </div>

      {(monogram || art.construction) && (
        <div className={cn('mk-apps', art.construction && 'has-build')}>
          {monogram && (
            <>
              <figure className='mk-app'>
                <span className='mk-app-tile'>
                  <Art svg={art.clean} height={appHeight} aspect={art.aspect} />
                </span>
                <figcaption>App icon, {APP_ICON_PX}px</figcaption>
              </figure>
              <figure className='mk-fav'>
                <span className='mk-tab'>
                  <Art svg={art.clean} height={16} aspect={art.aspect} />
                  <span className='mk-tab-title'>{TAB_TITLE}</span>
                </span>
                <figcaption>Favicon, 16px</figcaption>
              </figure>
            </>
          )}
          {art.construction && (
            <>
              <figure className='mk-plate is-paper is-build'>
                <Art svg={art.clean} height={192} aspect={art.aspect} />
                <figcaption>Clean</figcaption>
              </figure>
              <figure className='mk-plate is-paper is-build'>
                <Art svg={art.construction} height={192} aspect={art.aspect} />
                <figcaption>Construction</figcaption>
              </figure>
            </>
          )}
        </div>
      )}

      {mark.film && (
        <figure className='mk-film'>
          <BrandFilm src={mark.film.src} poster={mark.film.poster} name={mark.film.name} />
          <figcaption>
            Motion, {mark.film.length}. {gtText(mark.film.summary)}
          </figcaption>
        </figure>
      )}

      <dl className='mk-notes'>
        <div className='mk-note'>
          <dt>Thesis</dt>
          <dd>{gtText(mark.thesis)}</dd>
        </div>
        <div className='mk-note'>
          <dt>Construction</dt>
          <dd>{gtText(mark.construction)}</dd>
        </div>
        <div className='mk-note'>
          <dt>In use</dt>
          <dd>{gtText(mark.use)}</dd>
        </div>
        <div className='mk-note'>
          <dt>Files</dt>
          <dd>
            {files.map((file, i) => (
              <span key={file}>
                {i > 0 && <span className='mk-sep'>and</span>}
                <a href={file}>{file}</a>
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}

type GroupProps = {
  id: string;
  /** the part's number in the book */
  section: number;
  /** the gutter note's second line: the group's count */
  count: string;
  title: string;
  lead: string;
  active: boolean;
  children: ReactNode;
};

/** One group of the page: a book part that opens with the shared divider, its count in the gutter note. */
function Group({ id, section, count, title, lead, active, children }: GroupProps) {
  return (
    <section
      className={cn('pt-book-part mk-sec mk-group', active && 'is-active')}
      data-id={id}
      aria-labelledby={`mk-${id}`}
      aria-current={active ? 'true' : undefined}
    >
      <div className='mk-div pt-book-sec'>
        <small>
          <span>Section {section}</span>
          <span>{count}</span>
        </small>
        <div>
          <h2 id={`mk-${id}`}>{title}</h2>
          <p>{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

type MarksBookProps = {
  art: Readonly<Record<string, MarkArt>>;
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the section jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active id, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  /** the head's Updated row: the /marks entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The book: the head and its contents, then the four groups in order: the
 * marks in production, the hemispheres round by family, the bar monogram
 * collection with its register, and the other explorations. The reading
 * state is the shared read line: the innermost block under the line (a
 * family, a sheet, else its group) is selected through the shell, and a
 * selection from anywhere else scrolls the sheet to it.
 */
function MarksBook({ art, sheetRef, jumpRef, activeOut, updated }: MarksBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.mk-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const link = (id: string, label: string, count: ReactNode) => (
    <a key={id} href={`#${id}`} onClick={(e: MouseEvent<HTMLAnchorElement>) => onContents(e, id)}>
      <span>{label}</span>
      <small>{count}</small>
    </a>
  );

  const sheet = (mark: Mark) => {
    const files = art[mark.id];
    if (!files) return null;
    return <MarkSheet key={mark.id} mark={mark} art={files} active={active === mark.id} />;
  };

  return (
    <div className='mk-book pt-book-col'>
      <BookHead
        title={PAGE_NAMES.marks.name}
        lead={BOOK_LEAD}
        note={BOOK_NOTE}
        updated={updated}
        facts={[
          { icon: 'swatch', key: 'Marks', value: TOTAL },
          { icon: 'check-badge', key: 'In production', value: PRODUCTION_MARKS.length },
          { icon: 'globe', key: 'Hemispheres', value: HEMISPHERE_MARKS.length },
        ]}
        contents={
          <nav className='mk-toc pt-book-toc' aria-label='Contents'>
            {link(PRODUCTION_ID, 'In production', PRODUCTION_MARKS.length)}
            {link(HEMISPHERES_ID, 'Hemispheres', HEMISPHERE_MARKS.length)}
            {HEMISPHERE_FAMILIES.map((family) => link(familyId(family), family.name, familyMarks(family).length))}
            {link(BAR_ID, 'Bar monogram collection', SPEED_MARKS.length)}
            {link(EXPLORATIONS_ID, 'Other explorations', EXPLORATION_COUNT)}
          </nav>
        }
      />

      <Group
        id={PRODUCTION_ID}
        section={1}
        count={`${PRODUCTION_MARKS.length} marks`}
        title='In production'
        lead={PRODUCTION_LEAD}
        active={active === PRODUCTION_ID}
      >
        <div className='mk-feature'>
          {PRODUCTION_MARKS.map((mark) => (
            <ProductionCard key={mark.id} mark={mark} />
          ))}
        </div>
      </Group>

      <Group
        id={HEMISPHERES_ID}
        section={2}
        count={`${HEMISPHERE_MARKS.length} marks`}
        title='Hemispheres'
        lead={HEMISPHERES_LEAD}
        active={active === HEMISPHERES_ID}
      >
        <div className='mk-round'>
          <a className='mk-poster' href={HEMISPHERE_POSTER} aria-label='Hemispheres poster, PNG'>
            <img src={HEMISPHERE_POSTER} alt='' width={1100} height={1600} loading='lazy' decoding='async' />
          </a>
          <div className='mk-round-text'>
            <nav className='mk-round-list' aria-label='Hemispheres families'>
              {HEMISPHERE_FAMILIES.map((family, i) => (
                <a key={family.id} href={`#${familyId(family)}`} onClick={(e) => onContents(e, familyId(family))}>
                  <span className='mk-round-n'>{pad2(i + 1)}</span>
                  <span className='mk-round-name'>{family.name}</span>
                  <small>{familyMarks(family).length}</small>
                </a>
              ))}
            </nav>
            <p className='mk-card-files'>
              <a href={HEMISPHERE_POSTER} download>
                Poster PNG
              </a>
            </p>
          </div>
        </div>
        {HEMISPHERE_FAMILIES.map((family) => (
          <FamilyBlock key={family.id} family={family} active={active === familyId(family)} />
        ))}
      </Group>

      <Group
        id={BAR_ID}
        section={3}
        count={`${SPEED_MARKS.length} marks`}
        title='Bar monogram collection'
        lead={BAR_LEAD}
        active={active === BAR_ID}
      >
        <div className={cn('mk-sec mk-block', active === REGISTER_ID && 'is-active')} data-id={REGISTER_ID} aria-labelledby='mk-register'>
          <header className='mk-block-head'>
            <div className='mk-card-name'>
              <h3 id='mk-register'>The register</h3>
              <span className='mk-tags'>
                <span className='mk-tag'>{MARK_RULES.length} rules</span>
              </span>
            </div>
            <p>{REGISTER_LEAD}</p>
          </header>
          <div className='mk-rows'>
            {MARK_RULES.map((rule, i) => (
              <article key={rule.id} className='mk-row'>
                <div className='mk-n'>
                  <b>{pad2(i + 1)}</b>
                </div>
                <div className='mk-body'>
                  <h4>{rule.name}</h4>
                  <p>{gtText(rule.text)}</p>
                </div>
              </article>
            ))}
          </div>
          <div className='mk-families'>
            {MARK_FAMILIES.map((family) => (
              <div key={family.id} className='mk-family'>
                <b>
                  {family.label} {MARKS.filter((mark) => mark.family === family.id).length}
                </b>
                <p>{gtText(family.principle)}</p>
              </div>
            ))}
          </div>
          <p className='mk-faces'>{MARK_FACES}</p>
        </div>

        {SPEED_MARKS.map(sheet)}

        <div
          className={cn('mk-sec mk-block', active === PRESENTATION_ID && 'is-active')}
          data-id={PRESENTATION_ID}
          aria-labelledby='mk-presentation'
        >
          <header className='mk-block-head'>
            <h3 id='mk-presentation'>{PRESENTATION_TITLE}</h3>
            <p>{PRESENTATION_LEAD}</p>
          </header>
          {GROUNDS.map((ground) => (
            <figure key={ground} className={cn('mk-field', groundClass(ground))}>
              <div className='mk-field-row'>
                {SPEED_MARKS.map((mark, i) => {
                  const files = art[mark.id];
                  if (!files) return null;
                  const fit = fitPlate(files.aspect, PLATE_INNER, FIELD_PX);
                  return (
                    <a
                      key={mark.id}
                      className={cn('mk-field-item', fit === 'full' && 'is-full')}
                      href={`#${mark.id}`}
                      onClick={(e) => onContents(e, mark.id)}
                    >
                      <Art svg={files.clean} height={fit} aspect={files.aspect} />
                      <small>
                        {pad2(i + 1)} {mark.name}
                      </small>
                    </a>
                  );
                })}
              </div>
              <figcaption>
                {groundName(ground)}, the {SPEED_MARKS.length} at {FIELD_PX}px, the widest across the field
              </figcaption>
            </figure>
          ))}
        </div>
      </Group>

      <Group
        id={EXPLORATIONS_ID}
        section={4}
        count={`${EXPLORATION_COUNT} marks`}
        title='Other explorations'
        lead={EXPLORATIONS_LEAD}
        active={active === EXPLORATIONS_ID}
      >
        {PICTURE_MARKS.map(sheet)}

        <div className={cn('mk-sec mk-block', active === CONCEPTS_ID && 'is-active')} data-id={CONCEPTS_ID} aria-labelledby='mk-concepts'>
          <header className='mk-block-head'>
            <div className='mk-card-name'>
              <h3 id='mk-concepts'>{CONCEPTS_TITLE}</h3>
              <span className='mk-tags'>
                <span className='mk-tag'>{GLOBE_CONCEPTS.length} globes</span>
              </span>
            </div>
            <p>{CONCEPTS_LEAD}</p>
          </header>
          <div className='mk-cards'>
            {GLOBE_CONCEPTS.map((concept) => (
              <MarkCard
                key={concept.id}
                name={concept.name}
                file={concept.file}
                aspect={1}
                level='h4'
                files={[{ href: concept.file, label: 'SVG' }]}
              />
            ))}
          </div>
        </div>
      </Group>
    </div>
  );
}

export type MarksViewerProps = {
  /** every speed and picture mark's files and viewBox aspect, by id, read on the server */
  art: Readonly<Record<string, MarkArt>>;
  /** the /marks entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The marks on the viewer shell: the list holds the four groups and the
 * blocks inside them; the book presents them inside the flow sheet; the
 * grid shows every block as a tile drawn from a mark's own file (marks.css
 * masks the shell's rows with the SVGs). Flow keys, so Space and the arrows
 * scroll. The hash names the active block.
 */
export default function MarksViewer({ art, updated }: MarksViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(PRODUCTION_ID);

  return (
    <ViewerShell
      id='marks'
      title={MARKS_TITLE}
      mark='pt'
      count={`${TOTAL} marks`}
      sections={SECTIONS}
      modes={MARKS_MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='mark'
      onSelect={(id) => {
        /* re-clicking the active row brings its block back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <MarksBook art={art} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
