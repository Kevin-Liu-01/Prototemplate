'use client';

import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import { useRef, useState } from 'react';

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
  boxMask,
  CATALOG,
  catalogMark,
  dynamicFamily,
  familyLead,
  GLOBE_CONCEPTS,
  HEMISPHERE_FAMILIES,
  HEMISPHERE_MARKS,
  HEMISPHERE_POSTER,
  hemispherePoster,
  MARK_FACES,
  MARK_RULES,
  MARK_SIZES,
  MARKS,
  markFamily,
  pageFamilies,
  PRODUCTION_MARKS,
  shortlist,
} from '@/lib/marks';
import type { CatalogMark, HemisphereFamily, HemisphereMark, Mark, MarkFamilyRow, ProductionMark } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import './marks.css';

const MARKS_TITLE = PAGE_NAMES.marks.name;
const MARKS_MODES: readonly ShellMode[] = ['book', 'grid'];

/* the sections the page draws in a way of their own; every other family is drawn from its dynamic marks */
const SHORTLIST_ID = 'shortlist';
const PRODUCTION_ID = 'production';
const HEMISPHERES_ID = 'hemispheres';
const BAR_ID = 'bar-collection';
const EXPLORATIONS_ID = 'other-explorations';

/* the blocks inside the sections that the list and the read line name */
const REGISTER_ID = 'register';
const PRESENTATION_ID = 'presentation';
const CONCEPTS_ID = 'concepts';

const SHORTLIST = shortlist();
const SHORTLISTED = new Set(SHORTLIST.map((mark) => mark.id));
const FAMILY_ORDER = pageFamilies();
const SPEED_MARKS = MARKS.filter((mark) => mark.family === 'speed');
const PICTURE_MARKS = MARKS.filter((mark) => mark.family === 'picture');
/** The speed mark with a film: the sting plays under the speed cards. */
const FILM_MARK = SPEED_MARKS.find((mark) => mark.film);
const TOTAL = CATALOG.length;

const familyCount = (family: MarkFamilyRow) => CATALOG.filter((mark) => mark.family === family.id).length;
const hemiId = (family: HemisphereFamily) => `hemi-${family.id}`;
const hemiMarks = (family: HemisphereFamily) => HEMISPHERE_MARKS.filter((mark) => mark.family === family.id);
/** A hemispheres mark the family shows open: its lead, and every mark drawn beside its construction. */
const hemiShown = (mark: HemisphereMark) => Boolean(mark.lead || mark.constructionFile);

const BOOK_LEAD =
  'General Translation ships the two marks below. The shortlist holds the strongest explorations, and each family after it collects the marks that draw one idea.';

const BOOK_NOTE =
  'Only the doubled-line GT monogram and the Locadex mark are in production. Every mark is one color and takes the ink of whatever it sits on.';

const SHORTLIST_LEAD = 'The strongest marks, best first, each drawn in one color on a 256 unit square.';

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

/** The height every speed mark is shown at on the presentation field, and every shortlisted mark on the shortlist's field. */
const FIELD_PX = 64;
const SHORT_FIELD_PX = 48;

/** A card's mark: large on its plate, then the run of heights under it. */
const CARD_HERO_PX = 112;
const CARD_SIZES: readonly number[] = [48, 32, 16];

/** A production card's mark, on each of its two plates. */
const FEATURE_HERO_PX = 160;

/** A mark beside its construction: the clean mark in the card's left column (marks.css: .mk-card-drawn). */
const DRAWN_HERO_PX = 160;

/**
 * A dynamic mark is sized by its drawn box: on a plain card it fits a box
 * 168 wide (a card at the 1440 view) and 128 tall, on its family's lead
 * card 360 by 168, on a shortlist tile 200 by 168. Its run of sizes fits
 * the drawing into squares of 64 and 32, the boxes an app icon and a
 * favicon give it; the 16px drawing, where one is drawn, has its own row.
 */
const DYN_CARD: readonly [number, number] = [168, 128];
const DYN_FEATURE: readonly [number, number] = [360, 168];
const DYN_TILE: readonly [number, number] = [200, 168];
const DYN_SIZES: readonly number[] = [64, 32];
const DYN_FEATURE_SIZES: readonly number[] = [128, 64, 32];

/** A production mark in the head's strip: the GT monogram at 64px, and every live mark at the same area, so the square Locadex mark reads as large as the wide GT. */
const LIVE_PX = 64;
const LIVE_AREA = LIVE_PX * LIVE_PX * (PRODUCTION_MARKS[0]?.aspect ?? 1);
const liveHeight = (aspect: number) => Math.round(Math.sqrt(LIVE_AREA / aspect));

/** The 16px cut, drawn at 1x and enlarged so its pixels read. */
const CUT_PX = 16;
const CUT_ZOOM = 3;

/** The mark in production that leads the shortlist's field, at the same height as the shortlist. */
const GT_PRODUCTION = PRODUCTION_MARKS[0];

/** The section row of a family drawn from its dynamic marks. */
function familySection(family: MarkFamilyRow): ShellSection {
  return {
    id: family.anchor,
    label: family.name,
    under: 'marks',
    items: [{ id: family.anchor, n: '', title: family.name, desc: `${familyCount(family)} marks. ${family.lead}` }],
  };
}

/**
 * The list under Knowledge > Marks, in page order: the shortlist with one
 * row per mark, then one section per family. A family that has blocks of
 * its own (the hemispheres families, the speed set's register and marks,
 * the earlier rounds) lists them under its first row, so a jump to any of
 * them lands.
 */
const SECTIONS: readonly ShellSection[] = [
  {
    id: SHORTLIST_ID,
    label: 'Shortlist',
    under: 'marks',
    items: [
      { id: SHORTLIST_ID, n: '', title: 'The shortlist', desc: SHORTLIST_LEAD },
      ...SHORTLIST.map((mark, i) => ({ id: mark.id, n: pad2(i + 1), title: mark.name, desc: `${familyName(mark)}.${mark.note ? ` ${mark.note}` : ''}` })),
    ],
  },
  ...FAMILY_ORDER.map((family): ShellSection => {
    if (family.id === 'hemispheres') {
      return {
        id: HEMISPHERES_ID,
        label: family.name,
        under: 'marks',
        items: [
          { id: HEMISPHERES_ID, n: '', title: 'The round', desc: family.lead },
          ...HEMISPHERE_FAMILIES.map((hemi, i) => ({ id: hemiId(hemi), n: pad2(i + 1), title: hemi.name, desc: `${hemiMarks(hemi).length} marks. ${hemi.text}` })),
        ],
      };
    }
    if (family.id === 'speed') {
      return {
        id: BAR_ID,
        label: family.name,
        under: 'marks',
        items: [
          { id: BAR_ID, n: '', title: 'The speed marks', desc: family.lead },
          { id: REGISTER_ID, n: '', title: 'The register', desc: 'The rules the speed set follows.' },
          ...SPEED_MARKS.map((mark, i) => ({ id: mark.id, n: pad2(i + 1), title: mark.name, desc: `${markFamily(mark).label}. ${mark.thesis}` })),
          { id: PRESENTATION_ID, n: '', title: PRESENTATION_TITLE, desc: PRESENTATION_LEAD },
        ],
      };
    }
    if (family.id === 'earlier') {
      return {
        id: EXPLORATIONS_ID,
        label: family.name,
        under: 'marks',
        items: [
          { id: EXPLORATIONS_ID, n: '', title: 'The earlier rounds', desc: family.lead },
          ...PICTURE_MARKS.map((mark, i) => ({ id: mark.id, n: pad2(i + 1), title: mark.name, desc: `${markFamily(mark).label}. ${mark.thesis}` })),
          { id: CONCEPTS_ID, n: '', title: CONCEPTS_TITLE, desc: CONCEPTS_LEAD },
        ],
      };
    }
    if (family.id === 'production') {
      return {
        id: PRODUCTION_ID,
        label: family.name,
        under: 'marks',
        items: [{ id: PRODUCTION_ID, n: '', title: 'In production', desc: 'The doubled-line GT monogram and the Locadex mark, the two marks generaltranslation.com ships.' }],
      };
    }
    return familySection(family);
  }),
];

function familyName(mark: CatalogMark): string {
  return FAMILY_ORDER.find((family) => family.id === mark.family)?.name ?? '';
}

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

/** The height that fits a drawing of this aspect inside a box `w` wide and `h` tall. */
function fitBox(aspect: number, [w, h]: readonly [number, number]): number {
  return Math.round(Math.min(h, w / aspect));
}

/** A drawn box's aspect, width over height. */
const boxAspect = (box: readonly [number, number, number, number]) => box[2] / box[3];

/** The width style of an instance: its height times the file's aspect, or the plate's full width. */
function sizeStyle(height: PlateFit, aspect: number): CSSProperties {
  return {
    '--mk-w': height === 'full' ? '100%' : `${Math.round(height * aspect)}px`,
    '--mk-aspect': String(aspect),
  };
}

/**
 * One mark drawn by mask: the plate's color masked by the public file,
 * contained, or cropped to the mark's drawn box when it has one. Every
 * mark on the page is drawn this way, so a file loads once however many
 * times it is shown, nothing is inlined into the page, and the mark takes
 * the plate's ink as an inlined one would.
 */
function MaskArt({ file, height, aspect, box }: { file: string; height: PlateFit; aspect: number; box?: readonly [number, number, number, number] }) {
  const crop = box ? boxMask(box) : undefined;
  const style: CSSProperties = {
    ...sizeStyle(height, aspect),
    '--mk-mask': `url('${file}')`,
    ...(crop ? { '--mk-mask-size': crop.size, '--mk-mask-pos': crop.position } : {}),
  };
  return <span className='mk-svg mk-mask' style={style} aria-hidden='true' />;
}

/** A catalog mark drawn by its drawn box, fit inside a box `fit` wide and tall. */
function BoxArt({ mark, fit }: { mark: CatalogMark; fit: readonly [number, number] }) {
  const aspect = mark.box ? boxAspect(mark.box) : 1;
  return <MaskArt file={mark.file} height={fitBox(aspect, fit)} aspect={aspect} box={mark.box} />;
}

const GROUNDS = ['paper', 'ink'] as const;
type Ground = (typeof GROUNDS)[number];

const groundClass = (ground: Ground) => (ground === 'paper' ? 'is-paper' : 'is-ink');
const groundName = (ground: Ground) => (ground === 'paper' ? 'Positive' : 'Reversed');

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

/** How a card draws its mark at one size: a mask of the file at a height, or the dynamic mark's drawn box fit into a square. */
type Draw = (size: number) => ReactNode;

type MarkCardProps = {
  name: string;
  /** draws the card's mark at a size; the plates, the run and the cut all call it */
  draw: Draw;
  /** the heading level: h3 on a lead card, h4 inside a run */
  level: 'h3' | 'h4';
  /** the mark on its plate, drawn by the card's caller; by default `draw` at the card's hero height */
  hero?: ReactNode;
  /** the run of sizes; by default 48, 32 and 16, or the full run on a lead card */
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
  /** a lead card: both grounds, larger, and the full run of sizes */
  feature?: boolean;
  /** one of Kevin's picks: the card takes the ink frame */
  pick?: boolean;
  /** the card is a block the list names: its id, and whether it is the active one */
  block?: { id: string; active: boolean };
};

/**
 * The one card every mark on the page takes: the mark large on its plate,
 * the run of sizes in the same ink, the 16px cut when the mark has one,
 * then the name, the tags, the note, the ruled notes and the files. A
 * lead card shows both grounds. A mark with a construction drawing is
 * drawn beside it: the clean mark, its sizes and its cut in a column at
 * the left and the drawing at the right, or the drawing under the clean
 * mark on a narrow card. Every other mark is drawn alone on paper.
 */
function MarkCard({ name, draw, level, hero, sizes, drawing, tags, file16, note, notes, files, feature, pick, block }: MarkCardProps) {
  const Heading = level;
  const headingId = block ? `mk-${block.id}` : undefined;
  const run = sizes ?? (feature ? [...MARK_SIZES].reverse() : CARD_SIZES);
  const art = hero ?? draw(feature ? FEATURE_HERO_PX : drawing ? DRAWN_HERO_PX : CARD_HERO_PX);
  const links: readonly CardFile[] = drawing ? [...files, { href: drawing.file, label: 'Construction SVG' }] : files;
  const sizeRow = (
    <div className='mk-card-sizes is-paper'>
      {run.map((size) => (
        <span key={size} className='mk-size'>
          {draw(size)}
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
  const grounds: readonly Ground[] = feature ? GROUNDS : ['paper'];
  return (
    <article
      className={cn('mk-card', feature && 'is-feature', drawing && 'is-drawn', pick && 'is-pick', block && 'mk-sec', block?.active && 'is-active')}
      data-id={block?.id}
      aria-labelledby={headingId}
    >
      {drawing ? (
        <div className='mk-card-drawn'>
          <figure className='mk-card-plate mk-card-clean is-paper'>
            {art}
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
          <div className={cn('mk-card-plates', grounds.length > 1 && 'is-two')}>
            {grounds.map((ground) => (
              <figure key={ground} className={cn('mk-card-plate', groundClass(ground))}>
                {art}
                {grounds.length > 1 && <figcaption>{groundName(ground)}</figcaption>}
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

/** Draws a whole file by mask at a height and the file's aspect. */
const fileDraw =
  (file: string, aspect: number): Draw =>
  (size) => <MaskArt file={file} height={size} aspect={aspect} />;

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
      draw={fileDraw(mark.file, mark.aspect)}
      level='h3'
      feature
      tags={[IN_PRODUCTION]}
      note={gtText(mark.text)}
      files={mark.files.map((href) => ({ href }))}
    />
  );
}

/**
 * A dynamic mark's card: the mark by its drawn box on paper, the run that
 * fits it into squares of 64 and 32, its 16px drawing where one is drawn,
 * the name, the note and the files. Its family's lead takes the lead card:
 * both grounds, larger, and the run from 128. A shortlisted mark's card is
 * a block the list names, so the shortlist's tiles jump to it and the read
 * line marks its row.
 */
function DynamicCard({ mark, feature, active }: { mark: CatalogMark; feature?: boolean; active: boolean }) {
  const draw: Draw = (size) => <BoxArt mark={mark} fit={[size, size]} />;
  const files: CardFile[] = [{ href: mark.file, label: 'SVG' }];
  if (mark.file16) files.push({ href: mark.file16, label: '16px SVG' });
  return (
    <MarkCard
      name={mark.name}
      draw={draw}
      level={feature ? 'h3' : 'h4'}
      hero={<BoxArt mark={mark} fit={feature ? DYN_FEATURE : DYN_CARD} />}
      sizes={feature ? DYN_FEATURE_SIZES : DYN_SIZES}
      tags={mark.pick ? ['Pick'] : undefined}
      file16={mark.file16}
      note={mark.note}
      files={files}
      feature={feature}
      pick={mark.pick}
      block={SHORTLISTED.has(mark.id) ? { id: mark.id, active } : undefined}
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
      draw={fileDraw(mark.file, 1)}
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

/**
 * The marks a family holds closed: one summary line, and the cards only
 * once a reader opens it, so their files are not fetched before then.
 */
function Folded({ marks }: { marks: readonly HemisphereMark[] }) {
  const [open, setOpen] = useState(false);
  if (marks.length === 0) return null;
  return (
    <details className='mk-fold' onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{marks.length} more marks</summary>
      {open && (
        <div className='mk-cards'>
          {marks.map((mark) => (
            <HemisphereCard key={mark.id} mark={mark} />
          ))}
        </div>
      )}
    </details>
  );
}

type FamilyBlockProps = {
  family: HemisphereFamily;
  active: boolean;
  /** a mark's construction drawing at its size on the card, by its public path; none for a mark without one */
  drawingOf: (file: string | undefined) => CardDrawing | undefined;
};

/**
 * One family of the hemispheres round: its name, its words and its poster
 * as a download, then its lead and the marks drawn beside their
 * construction, two to a row, and the rest folded under one line.
 */
function FamilyBlock({ family, active, drawingOf }: FamilyBlockProps) {
  const marks = hemiMarks(family);
  const shown = marks.filter(hemiShown);
  const id = hemiId(family);
  return (
    <div className={cn('mk-sec mk-block', active && 'is-active')} data-id={id} aria-labelledby={`mk-${id}`}>
      <header className='mk-block-head'>
        <div className='mk-card-name'>
          <h3 id={`mk-${id}`}>{family.name}</h3>
          <span className='mk-tags'>
            <span className='mk-tag'>{marks.length} marks</span>
          </span>
        </div>
        <p>{family.text}</p>
        <p className='mk-card-files'>
          <a href={hemispherePoster(family.id)} download>
            Poster PNG
          </a>
        </p>
      </header>
      <div className='mk-cards is-drawn'>
        {shown.map((mark) => (
          <HemisphereCard key={mark.id} mark={mark} drawing={drawingOf(mark.constructionFile)} />
        ))}
      </div>
      <Folded marks={marks.filter((mark) => !hemiShown(mark))} />
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
  const fit = drawing ? DRAWN_HERO_PX : fitPlate(aspect, HALF_CARD_INNER, CARD_HERO_PX);
  return (
    <MarkCard
      name={mark.name}
      draw={fileDraw(mark.file, aspect)}
      level='h4'
      hero={<MaskArt file={mark.file} height={fit} aspect={aspect} />}
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
 * tile jumps to the section, where each mark has its card.
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

/** One section of the page: a book part that opens with the shared divider, its count in the gutter note. */
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

/**
 * The shortlist: one square tile per mark, its drawing large on paper with
 * its name under it, and its family where the name does not already say
 * it, each a jump to the mark's card in its family; then the shortlist at one height on both grounds, after the GT
 * mark in production, so each reads beside the mark that ships.
 */
function ShortlistBody({ onJump }: { onJump: (e: MouseEvent<HTMLAnchorElement>, id: string) => void }) {
  return (
    <>
      <div className='mk-short'>
        {SHORTLIST.map((mark) => (
          <a key={mark.id} className='mk-short-tile' href={`#${mark.id}`} onClick={(e) => onJump(e, mark.id)}>
            <span className='mk-short-plate is-paper'>
              <BoxArt mark={mark} fit={DYN_TILE} />
            </span>
            <span className='mk-short-name'>
              <b>{mark.name}</b>
              {!mark.name.startsWith(familyName(mark)) && <small>{familyName(mark)}</small>}
            </span>
          </a>
        ))}
      </div>
      {GROUNDS.map((ground) => (
        <figure key={ground} className={cn('mk-field is-short', groundClass(ground))} aria-label={`The shortlist ${groundName(ground).toLowerCase()}, after the GT mark in production`}>
          <div className='mk-field-row'>
            {GT_PRODUCTION && (
              <span className='mk-field-item'>
                <MaskArt file={GT_PRODUCTION.file} height={SHORT_FIELD_PX} aspect={GT_PRODUCTION.aspect} />
              </span>
            )}
            {SHORTLIST.map((mark) => {
              const aspect = mark.box ? boxAspect(mark.box) : 1;
              return (
                <span key={mark.id} className='mk-field-item'>
                  <MaskArt file={mark.file} height={SHORT_FIELD_PX} aspect={aspect} box={mark.box} />
                </span>
              );
            })}
          </div>
        </figure>
      ))}
    </>
  );
}

/**
 * A family drawn from its dynamic marks: the drawings it grew from, then
 * its lead (familyLead) on both grounds, then the rest. The speed family
 * shows its dynamic marks in one run before the speed set.
 */
function DynamicFamily({ family, active }: { family: MarkFamilyRow; active: string }) {
  const marks = dynamicFamily(family.id);
  const lead = familyLead(family.id);
  const opens = marks.filter((mark) => mark.opens && mark !== lead);
  const others = marks.filter((mark) => !mark.opens && mark !== lead);
  return (
    <>
      {opens.length > 0 && (
        <div className='mk-cards'>
          {opens.map((mark) => (
            <DynamicCard key={mark.id} mark={mark} active={active === mark.id} />
          ))}
        </div>
      )}
      {lead && <DynamicCard mark={lead} feature active={active === lead.id} />}
      {others.length > 0 && (
        <div className='mk-cards'>
          {others.map((mark) => (
            <DynamicCard key={mark.id} mark={mark} active={active === mark.id} />
          ))}
        </div>
      )}
    </>
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
 * they are on the first screen, and its contents; then the shortlist, and
 * every family in page order (pageFamilies), In production last. The
 * reading state is the shared read line: the innermost block under the
 * line (a shortlisted mark's card, a hemispheres family, a speed card,
 * else its section) is selected through the shell, and a selection from
 * anywhere else scrolls the sheet to it.
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
    return <SheetCard key={mark.id} mark={mark} aspect={aspect} drawing={drawingOf(mark.constructionFile)} active={active === mark.id} />;
  };

  /* what each family's section holds after its divider */
  const body = (family: MarkFamilyRow): ReactNode => {
    switch (family.id) {
      case 'production':
        return (
          <div className='mk-feature'>
            {PRODUCTION_MARKS.map((mark) => (
              <ProductionCard key={mark.id} mark={mark} />
            ))}
          </div>
        );
      case 'hemispheres':
        return (
          <>
            <div className='mk-round'>
              <a className='mk-poster' href={HEMISPHERE_POSTER} aria-label='Hemispheres poster, PNG'>
                <img src={HEMISPHERE_POSTER} alt='' width={1100} height={1600} loading='lazy' decoding='async' />
              </a>
              <div className='mk-round-text'>
                <nav className='mk-round-list' aria-label='Hemispheres families'>
                  {HEMISPHERE_FAMILIES.map((hemi, i) => (
                    <a key={hemi.id} href={`#${hemiId(hemi)}`} onClick={(e) => onContents(e, hemiId(hemi))}>
                      <span className='mk-round-n'>{pad2(i + 1)}</span>
                      <span className='mk-round-name'>{hemi.name}</span>
                      <small>{hemiMarks(hemi).length}</small>
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
            {HEMISPHERE_FAMILIES.map((hemi) => (
              <FamilyBlock key={hemi.id} family={hemi} active={active === hemiId(hemi)} drawingOf={drawingOf} />
            ))}
          </>
        );
      case 'speed':
        return (
          <>
            <div className='mk-cards'>
              {dynamicFamily('speed').map((mark) => (
                <DynamicCard key={mark.id} mark={mark} active={active === mark.id} />
              ))}
            </div>
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

            <div className={cn('mk-sec mk-block', active === PRESENTATION_ID && 'is-active')} data-id={PRESENTATION_ID} aria-labelledby='mk-presentation'>
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
                        <a key={mark.id} className={cn('mk-field-item', fit === 'full' && 'is-full')} href={`#${mark.id}`} onClick={(e) => onContents(e, mark.id)}>
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
          </>
        );
      case 'earlier':
        return (
          <>
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
                    draw={fileDraw(concept.file, 1)}
                    level='h4'
                    drawing={drawingOf(concept.constructionFile)}
                    files={[{ href: concept.file, label: 'SVG' }]}
                  />
                ))}
              </div>
            </div>
          </>
        );
      default:
        return <DynamicFamily family={family} active={active} />;
    }
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
          { icon: 'sparkles', key: 'Shortlist', value: SHORTLIST.length },
          { icon: 'check-badge', key: 'In production', value: PRODUCTION_MARKS.length },
        ]}
        contents={
          <nav className='mk-toc pt-book-toc' aria-label='Contents'>
            {link(SHORTLIST_ID, 'Shortlist', SHORTLIST.length)}
            {FAMILY_ORDER.map((family) => link(family.anchor, family.name, familyCount(family)))}
          </nav>
        }
      />

      <Group id={SHORTLIST_ID} section={1} count={`${SHORTLIST.length} marks`} title='Shortlist' lead={SHORTLIST_LEAD} active={active === SHORTLIST_ID}>
        <ShortlistBody onJump={onContents} />
      </Group>

      {FAMILY_ORDER.map((family, i) => (
        <Group
          key={family.id}
          id={family.anchor}
          section={i + 2}
          count={`${familyCount(family)} marks`}
          title={family.name}
          lead={family.lead}
          active={active === family.anchor}
        >
          {body(family)}
        </Group>
      ))}
    </div>
  );
}

/** The grid tile's mark, as one rule per list row: the file the tile draws, cropped to its drawn box when it has one. */
type GridMask = { id: string; files: readonly string[]; box?: readonly [number, number, number, number] };

/** The mark each list row's grid tile draws: a mark its own file, a section its lead mark. */
function gridMasks(): readonly GridMask[] {
  const of = (id: string, markId: string): GridMask | null => {
    const mark = catalogMark(markId);
    return mark ? { id, files: [mark.file], box: mark.box } : null;
  };
  const rows: (GridMask | null)[] = [
    of(SHORTLIST_ID, SHORTLIST[0]?.id ?? ''),
    ...SHORTLIST.map((mark) => of(mark.id, mark.id)),
    ...FAMILY_ORDER.flatMap((family) => {
      const lead = familyLead(family.id);
      return lead && family.id !== 'speed' ? [of(family.anchor, lead.id)] : [];
    }),
    { id: PRODUCTION_ID, files: PRODUCTION_MARKS.map((mark) => mark.file) },
    of(HEMISPHERES_ID, 't-west-limb'),
    ...HEMISPHERE_FAMILIES.map((hemi) => of(hemiId(hemi), hemi.lead)),
    of(BAR_ID, 'bar-monogram'),
    of(REGISTER_ID, 'bar-monogram'),
    ...SPEED_MARKS.map((mark) => of(mark.id, mark.id)),
    of(PRESENTATION_ID, 'double-cut'),
    of(EXPLORATIONS_ID, 'two-way'),
    ...PICTURE_MARKS.map((mark) => of(mark.id, mark.id)),
    of(CONCEPTS_ID, GLOBE_CONCEPTS[0]?.id ?? ''),
  ];
  return rows.filter((row): row is GridMask => row !== null);
}

/**
 * The grid's masks, written once from the catalog: each list row's tile
 * draws its mark through --mk-mask, so marks.css holds one rule for every
 * tile and no path. A dynamic mark is cropped to its drawn box; In
 * production draws both live marks side by side.
 */
const GRID_CSS = gridMasks()
  .map(({ id, files, box }) => {
    const row = `.pt-viewer[data-shell='marks'] .pt-grid .pt-row[data-id='${id}']`;
    if (files.length > 1) {
      const masks = files.map((file, i) => `url('${file}') ${i === 0 ? 'left' : 'right'} center / ${i === 0 ? '50% 80%' : '40% 100%'} no-repeat`).join(', ');
      return `${row}::after{-webkit-mask:${masks};mask:${masks}}`;
    }
    const crop = box ? boxMask(box) : undefined;
    const vars = [`--mk-mask:url('${files[0]}')`];
    if (crop && box) {
      const aspect = Math.round(boxAspect(box) * 1000) / 1000;
      vars.push(`--mk-mask-size:${crop.size}`, `--mk-mask-pos:${crop.position}`, `--mk-tile-w:min(100%, calc(96px * ${aspect}))`, '--mk-tile-h:auto', `--mk-tile-ar:${aspect}`);
    }
    return `${row}{${vars.join(';')}}`;
  })
  .join('\n');

export type MarksViewerProps = {
  /** every speed and picture mark's viewBox aspect, by id, read on the server */
  aspects: Readonly<Record<string, number>>;
  /** the viewBox size of every mark's construction drawing that exists, by its public path, read on the server */
  drawings: Readonly<Record<string, DrawingSize>>;
  /** the /marks entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The marks on the viewer shell: the list holds the shortlist and the
 * families with the blocks inside them; the book presents them inside the
 * flow sheet; the grid shows every row as a tile drawn from a mark's own
 * file (GRID_CSS). Flow keys, so Space and the arrows scroll. The hash
 * names the active block.
 */
export default function MarksViewer({ aspects, drawings, updated }: MarksViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(SHORTLIST_ID);

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
      <style>{GRID_CSS}</style>
      <Sheet variant='flow' scrollRef={sheetRef}>
        <MarksBook aspects={aspects} drawings={drawings} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
