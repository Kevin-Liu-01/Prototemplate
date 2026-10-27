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
} from '@/lib/marks';
import type { HemisphereFamily, HemisphereMark, Mark, ProductionMark } from '@/lib/marks';
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
/** The speed mark with a film: the sting plays under the speed cards. */
const FILM_MARK = SPEED_MARKS.find((mark) => mark.film);
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

/** A family's name on its marks' cards. */
const FAMILY_NAME: Readonly<Record<string, string>> = { speed: 'Speed set', picture: 'Earlier round' };

/**
 * The flow sheet's reading column at the 1440 viewport with the sidebar
 * open, the view the captures show: 1440 less the 208px sidebar
 * (tokens.css), the sheet's 28px pads, the mat's 1px borders and the
 * sheet's 56px side padding (Sheet.css). On a wider stage the column grows
 * and the plates gain room; marks.css clamps every instance on a narrower one.
 */
const COLUMN_W = 1440 - 208 - 2 * 28 - 2 - 2 * 56;

/** A card plate's side padding and border (marks.css: .mk-card-plate, .mk-card). */
const CARD_SIDE = 16 + 1;

/** The gap between two cards of a row (marks.css: .mk-cards). */
const CARD_GAP = 12;

/** The inner width of a card in the two-column run of the speed and picture marks. */
const HALF_CARD_INNER = (COLUMN_W - CARD_GAP) / 2 - 2 * CARD_SIDE;

/** The inner width of the presentation field (marks.css: .mk-field pads 32px inside a 1px border). */
const FIELD_INNER = COLUMN_W - 2 * (32 + 1);

/** The height every speed mark is shown at on the presentation field. */
const FIELD_PX = 64;

/** A card's mark: large on its plate, then the run of heights under it. */
const CARD_HERO_PX = 112;
const CARD_SIZES: readonly number[] = [48, 32, 16];

/** A production card's mark, on each of its two plates. */
const FEATURE_HERO_PX = 160;

/** A mark beside its construction: the clean mark in the card's left column (marks.css: .mk-card-drawn). */
const DRAWN_HERO_PX = 160;

/** A production mark in the head's strip: the GT monogram at 64px, and every live mark at the same area, so the square Locadex mark reads as large as the wide GT. */
const LIVE_PX = 64;
const LIVE_AREA = LIVE_PX * LIVE_PX * (PRODUCTION_MARKS[0]?.aspect ?? 1);
const liveHeight = (aspect: number) => Math.round(Math.sqrt(LIVE_AREA / aspect));

/** The 16px cut, drawn at 1x and enlarged so its pixels read. */
const CUT_PX = 16;
const CUT_ZOOM = 3;

/** The list: the four groups as the run under Knowledge > Marks; each group's first row is the group itself, so a jump to it lands. */
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
      { id: BAR_ID, n: '', title: 'The collection', desc: BAR_LEAD },
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
      { id: EXPLORATIONS_ID, n: '', title: 'The explorations', desc: EXPLORATIONS_LEAD },
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

/** The run of heights a speed or picture mark's card shows: the card run, less any height too wide for the card. */
function sizesFor(aspect: number, inner: number): readonly number[] {
  return CARD_SIZES.filter((height) => height * aspect <= inner);
}

/** The width style of an instance: its height times the file's aspect, or the plate's full width. */
function sizeStyle(height: PlateFit, aspect: number): CSSProperties {
  return {
    '--mk-w': height === 'full' ? '100%' : `${Math.round(height * aspect)}px`,
    '--mk-aspect': String(aspect),
  };
}

/**
 * One mark drawn by mask: the plate's color masked by the public file,
 * contained. Every mark on the page is drawn this way, so a file loads
 * once however many times it is shown, nothing is inlined into the page,
 * and the mark takes the plate's ink as an inlined one would.
 */
function MaskArt({ file, height, aspect }: { file: string; height: PlateFit; aspect: number }) {
  const style: CSSProperties = { ...sizeStyle(height, aspect), '--mk-mask': `url('${file}')` };
  return <span className='mk-svg mk-mask' style={style} aria-hidden='true' />;
}

const GROUNDS = ['paper', 'ink'] as const;
type Ground = (typeof GROUNDS)[number];

const groundClass = (ground: Ground) => (ground === 'paper' ? 'is-paper' : 'is-ink');
const groundName = (ground: Ground) => (ground === 'paper' ? 'Positive' : 'Reversed');

/** One plate of a card without a drawing: the file it draws on a ground, with a caption when the card has two plates. */
type CardPlate = { file: string; ground: Ground; caption?: string };

/** A construction drawing's viewBox width and height, read by the server page from its file. */
export type DrawingSize = readonly [number, number];

/** A construction drawing on its card: the file, its aspect, and its height before the plate clamps its width. */
type CardDrawing = { file: string; aspect: number; height: number };

/**
 * A construction drawing at its size on the card. The drawing shares the
 * units of the mark's 256 unit square and is drawn at one CSS pixel per
 * unit, so its 9 unit labels read at 9px, and the plate clamps it to its
 * width. A mark without a drawing, or whose file the server did not read,
 * gets none.
 */
function drawingFor(file: string | undefined, size: DrawingSize | undefined): CardDrawing | undefined {
  if (!file || !size) return undefined;
  const [width, height] = size;
  return { file, aspect: width / height, height };
}

/** A file link: the file's name as the label unless one is given, and a download. */
type CardFile = { href: string; label?: string };

/** A ruled note in a card's body: Construction, In use. */
type CardNote = { key: string; value: ReactNode };

const fileName = (href: string) => href.slice(href.lastIndexOf('/') + 1);

type MarkCardProps = {
  name: string;
  /** the file the card draws */
  file: string;
  aspect: number;
  /** the heading level: h3 on a production card, h4 inside a group's run */
  level: 'h3' | 'h4';
  /** the mark's height on its plate; by default the card's hero height, or the drawn hero beside a drawing */
  hero?: PlateFit;
  /** the run of heights; by default 48, 32 and 16, or the full run on a production card */
  sizes?: readonly number[];
  /** the mark's construction drawing, when it has one: drawn beside the clean mark, with its file in the links */
  drawing?: CardDrawing;
  /** short tags after the name: Pick, Lead, In production, the family */
  tags?: readonly ReactNode[];
  /** the 16px cut, when the mark has one */
  file16?: string;
  /** one or two sentences under the name */
  note?: ReactNode;
  /** ruled notes under the note, folded under one summary line */
  notes?: readonly CardNote[];
  files: readonly CardFile[];
  /** a production card: both grounds, larger, and the full run of heights */
  feature?: boolean;
  /** one of Kevin's picks: the card takes the ink frame */
  pick?: boolean;
  /** the card is a block the list names: its id, and whether it is the active one */
  block?: { id: string; active: boolean };
};

/**
 * The one card every mark on the page takes: the mark large on its plate,
 * the run of heights in the same ink, the 16px cut when the mark has one,
 * then the name, the tags, the note, the ruled notes and the files. A
 * production card shows both grounds. A mark with a construction drawing
 * is drawn beside it: the clean mark, its heights and its cut in a column
 * at the left and the drawing at the right, or the drawing under the clean
 * mark on a narrow card. Every other mark is drawn alone on paper.
 */
function MarkCard({
  name,
  file,
  aspect,
  level,
  hero,
  sizes,
  drawing,
  tags,
  file16,
  note,
  notes,
  files,
  feature,
  pick,
  block,
}: MarkCardProps) {
  const Heading = level;
  const headingId = block ? `mk-${block.id}` : undefined;
  const run = sizes ?? (feature ? [...MARK_SIZES].reverse() : CARD_SIZES);
  const height = hero ?? (feature ? FEATURE_HERO_PX : drawing ? DRAWN_HERO_PX : CARD_HERO_PX);
  const links: readonly CardFile[] = drawing ? [...files, { href: drawing.file, label: 'Construction SVG' }] : files;
  const sizeRow = (
    <div className='mk-card-sizes is-paper'>
      {run.map((size) => (
        <span key={size} className='mk-size'>
          <MaskArt file={file} height={size} aspect={aspect} />
          <small>{size}</small>
        </span>
      ))}
    </div>
  );
  const cutRow = file16 && (
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
  );
  const plates: readonly CardPlate[] = feature
    ? GROUNDS.map((ground) => ({ file, ground, caption: groundName(ground) }))
    : [{ file, ground: 'paper' }];
  return (
    <article
      className={cn(
        'mk-card',
        feature && 'is-feature',
        drawing && 'is-drawn',
        pick && 'is-pick',
        block && 'mk-sec',
        block?.active && 'is-active'
      )}
      data-id={block?.id}
      aria-labelledby={headingId}
    >
      {drawing ? (
        <div className='mk-card-drawn'>
          <figure className='mk-card-plate mk-card-clean is-paper'>
            <MaskArt file={file} height={height} aspect={aspect} />
            <figcaption>Clean</figcaption>
          </figure>
          <figure className='mk-card-plate mk-card-drawing is-paper'>
            <MaskArt file={drawing.file} height={drawing.height} aspect={drawing.aspect} />
            <figcaption>Construction</figcaption>
          </figure>
          {sizeRow}
          {cutRow}
        </div>
      ) : (
        <>
          <div className={cn('mk-card-plates', plates.length > 1 && 'is-two')}>
            {plates.map((plate) => (
              <figure key={plate.ground} className={cn('mk-card-plate', groundClass(plate.ground))}>
                <MaskArt file={plate.file} height={height} aspect={aspect} />
                {plate.caption && <figcaption>{plate.caption}</figcaption>}
              </figure>
            ))}
          </div>
          {sizeRow}
          {cutRow}
        </>
      )}
      <div className='mk-card-body'>
        <div className='mk-card-name'>
          <Heading id={headingId}>{name}</Heading>
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
        {notes && notes.length > 0 && (
          <details className='mk-card-more'>
            <summary>{notes.map((n) => n.key).join(' and ')}</summary>
            <dl className='mk-card-notes'>
              {notes.map((n) => (
                <div key={n.key}>
                  <dt>{n.key}</dt>
                  <dd>{n.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
        <p className='mk-card-files'>
          {links.map((f) => (
            <a key={f.href} href={f.href} download aria-label={`Download ${fileName(f.href)}`}>
              {f.label ?? fileName(f.href)}
            </a>
          ))}
        </p>
      </div>
    </article>
  );
}

const IN_PRODUCTION = (
  <>
    <Icon name='check-badge' size={14} />
    In production
  </>
);

/** A production mark's card: both grounds, the full run of heights, where it ships and every file the sites serve. */
function ProductionCard({ mark }: { mark: ProductionMark }) {
  return (
    <MarkCard
      name={mark.name}
      file={mark.file}
      aspect={mark.aspect}
      level='h3'
      feature
      tags={[IN_PRODUCTION]}
      note={gtText(mark.text)}
      files={mark.files.map((href) => ({ href }))}
    />
  );
}

/** The tags of a hemispheres mark: Pick for Kevin's picks, Lead for the mark its family's poster leads with. */
function hemisphereTags(mark: HemisphereMark): readonly string[] {
  const tags: string[] = [];
  if (mark.pick) tags.push('Pick');
  if (mark.lead) tags.push('Lead');
  return tags;
}

/** A hemispheres mark's card: the mark, beside its construction when it has one, the run of heights, the 16px cut and the files. */
function HemisphereCard({ mark, drawing }: { mark: HemisphereMark; drawing?: CardDrawing }) {
  return (
    <MarkCard
      name={mark.id}
      file={mark.file}
      aspect={1}
      level='h4'
      drawing={drawing}
      tags={hemisphereTags(mark)}
      file16={mark.file16}
      note={mark.note}
      pick={mark.pick}
      files={[
        { href: mark.file, label: 'SVG' },
        { href: mark.file16, label: '16px SVG' },
      ]}
    />
  );
}

type FamilyBlockProps = {
  family: HemisphereFamily;
  active: boolean;
  /** a mark's construction drawing at its size on the card, by its public path; none for a mark without one */
  drawingOf: (file: string | undefined) => CardDrawing | undefined;
};

/**
 * One family of the hemispheres round: its poster and its words at the
 * head, then its cards in the manifest's order. The marks drawn beside
 * their construction lead their families and run two to a row; the rest
 * follow in the grid of plain cards.
 */
function FamilyBlock({ family, active, drawingOf }: FamilyBlockProps) {
  const marks = familyMarks(family);
  const drawn = marks.filter((mark) => mark.constructionFile);
  const plain = marks.filter((mark) => !mark.constructionFile);
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
      {drawn.length > 0 && (
        <div className='mk-cards is-drawn'>
          {drawn.map((mark) => (
            <HemisphereCard key={mark.id} mark={mark} drawing={drawingOf(mark.constructionFile)} />
          ))}
        </div>
      )}
      {plain.length > 0 && (
        <div className='mk-cards'>
          {plain.map((mark) => (
            <HemisphereCard key={mark.id} mark={mark} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A speed or picture mark's card, in the two-column run of its group: the
 * mark on paper, the run of heights its width allows, the thesis, the
 * construction and the use folded under one line, and every file. A mark
 * too wide for its plate's hero height takes the plate's full width.
 */
function SheetCard({ mark, aspect, drawing, active }: { mark: Mark; aspect: number; drawing?: CardDrawing; active: boolean }) {
  const files: CardFile[] = [{ href: mark.file, label: 'SVG' }];
  if (mark.textFile) files.push({ href: mark.textFile, label: 'Plain text' });
  return (
    <MarkCard
      name={mark.name}
      file={mark.file}
      aspect={aspect}
      level='h4'
      hero={drawing ? undefined : fitPlate(aspect, HALF_CARD_INNER, CARD_HERO_PX)}
      sizes={sizesFor(aspect, HALF_CARD_INNER)}
      drawing={drawing}
      tags={[FAMILY_NAME[mark.family] ?? markFamily(mark).label, mark.kind === 'monogram' ? 'Monogram' : 'Wordmark']}
      note={gtText(mark.thesis)}
      notes={[
        { key: 'Construction', value: gtText(mark.construction) },
        { key: 'In use', value: gtText(mark.use) },
      ]}
      files={files}
      block={{ id: mark.id, active }}
    />
  );
}

/**
 * The marks in production at the very top of the page, inside the head:
 * each mark on its plate with its name and the In production badge. A
 * tile jumps to the group, where each mark has its card.
 */
function LiveStrip({ onJump }: { onJump: (e: MouseEvent<HTMLAnchorElement>, id: string) => void }) {
  return (
    <div className='mk-live'>
      <p>{BOOK_NOTE}</p>
      <div className='mk-live-row'>
        {PRODUCTION_MARKS.map((mark) => (
          <a key={mark.id} className='mk-live-mark' href={`#${PRODUCTION_ID}`} onClick={(e) => onJump(e, PRODUCTION_ID)}>
            <span className='mk-live-plate is-paper'>
              <MaskArt file={mark.file} height={liveHeight(mark.aspect)} aspect={mark.aspect} />
            </span>
            <span className='mk-live-name'>
              <b>{mark.name}</b>
              <small>{IN_PRODUCTION}</small>
            </span>
          </a>
        ))}
      </div>
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
  /** every speed and picture mark's viewBox aspect, by id */
  aspects: Readonly<Record<string, number>>;
  /** the viewBox size of every mark's construction drawing that exists, by its public path */
  drawings: Readonly<Record<string, DrawingSize>>;
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
 * The book: the head, whose note shows the two marks in production so
 * they are on the first screen, and its contents, then the four groups in
 * order: the marks in production, the hemispheres round by family, the
 * bar monogram collection with its register, and the other explorations.
 * The reading state is the shared read line: the innermost block under
 * the line (a family, a mark's card, else its group) is selected through
 * the shell, and a selection from anywhere else scrolls the sheet to it.
 */
function MarksBook({ aspects, drawings, sheetRef, jumpRef, activeOut, updated }: MarksBookProps) {
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

  const drawingOf = (file: string | undefined) => drawingFor(file, file ? drawings[file] : undefined);

  const card = (mark: Mark) => {
    const aspect = aspects[mark.id];
    if (!aspect) return null;
    return (
      <SheetCard key={mark.id} mark={mark} aspect={aspect} drawing={drawingOf(mark.constructionFile)} active={active === mark.id} />
    );
  };

  return (
    <div className='mk-book pt-book-col'>
      <BookHead
        title={PAGE_NAMES.marks.name}
        lead={BOOK_LEAD}
        note={<LiveStrip onJump={onContents} />}
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
          <FamilyBlock key={family.id} family={family} active={active === familyId(family)} drawingOf={drawingOf} />
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

        <div className='mk-cards is-sheets'>{SPEED_MARKS.map(card)}</div>

        {FILM_MARK?.film && (
          <figure className='mk-film'>
            <BrandFilm src={FILM_MARK.film.src} poster={FILM_MARK.film.poster} name={FILM_MARK.film.name} />
            <figcaption>
              {FILM_MARK.name}, motion, {FILM_MARK.film.length}. {gtText(FILM_MARK.film.summary)}
            </figcaption>
          </figure>
        )}

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
                  const aspect = aspects[mark.id];
                  if (!aspect) return null;
                  const fit = fitPlate(aspect, FIELD_INNER, FIELD_PX);
                  return (
                    <a
                      key={mark.id}
                      className={cn('mk-field-item', fit === 'full' && 'is-full')}
                      href={`#${mark.id}`}
                      onClick={(e) => onContents(e, mark.id)}
                    >
                      <MaskArt file={mark.file} height={fit} aspect={aspect} />
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
        <div className='mk-cards is-sheets'>{PICTURE_MARKS.map(card)}</div>

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
                drawing={drawingOf(concept.constructionFile)}
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
  /** every speed and picture mark's viewBox aspect, by id, read on the server */
  aspects: Readonly<Record<string, number>>;
  /** the viewBox size of every mark's construction drawing that exists, by its public path, read on the server */
  drawings: Readonly<Record<string, DrawingSize>>;
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
export default function MarksViewer({ aspects, drawings, updated }: MarksViewerProps) {
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
        <MarksBook
          aspects={aspects}
          drawings={drawings}
          sheetRef={sheetRef}
          jumpRef={jumpRef}
          activeOut={activeOut}
          updated={updated}
        />
      </Sheet>
    </ViewerShell>
  );
}
