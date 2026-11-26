/**
 * /socials: the one registry behind the socials page. Four parts, in the
 * page's order: the skills that own General Translation's social work,
 * what Eliot's "The Mechanics of Attention" teaches about posting on X
 * (restated, with the owner of each rule), the social media in this
 * repository with the Series A launch first, and the metadata standards
 * every post and card follows. Pure data; the viewer renders it and the
 * shell's list reads the same rows.
 *
 * The rules live in the skills (social-draft, gt-voice, gt-graphics,
 * gt-verify); this page shows them in one place and owns none of them.
 * The media are the web copies in public/media/socials (made from the
 * launch's masters in funding-graphics) and files already served from
 * public/media and public/static/blogs.
 */

export type SocialVariant = {
  key: string;
  label: string;
  src: string;
  w: number;
  h: number;
  kind: 'image' | 'video';
  /** a video's poster frame */
  poster?: string;
};

/** One fact of a standard: a name and its value. */
export type SocialSpec = { key: string; value: string };

export type SocialRow = {
  id: string;
  /** the position in the whole page, padded (`07`) */
  n: string;
  title: string;
  /** the sidebar's name when the title runs long */
  short?: string;
  body: string;
  /** an internal page or an outside address the row points to */
  link?: { href: string; label: string };
  /** a path in a checkout, shown as code */
  path?: string;
  variants?: readonly SocialVariant[];
  specs?: readonly SocialSpec[];
};

export type SocialBlock = {
  id: string;
  label: string;
  lead: string;
  rows: readonly SocialRow[];
};

const M = '/media/socials';

const still = (key: string, label: string, src: string, w: number, h: number): SocialVariant => ({ key, label, src, w, h, kind: 'image' });
const film = (key: string, label: string, name: string, w = 1920, h = 1080, dir = M): SocialVariant => ({
  key,
  label,
  src: `${dir}/${name}-film.mp4`,
  poster: `${dir}/${name}-poster.jpg`,
  w,
  h,
  kind: 'video',
});
/** an X picture at 16:9 and its LinkedIn twin at 4:5 */
const pair = (name: string): readonly SocialVariant[] => [
  still('x', 'X, 16:9', `${M}/${name}.webp`, 3840, 2160),
  still('li', 'LinkedIn, 4:5', `${M}/${name}-li.webp`, 2160, 2700),
];

type RowInput = Omit<SocialRow, 'n'>;
type BlockInput = Omit<SocialBlock, 'rows'> & { rows: readonly RowInput[] };

const BLOCKS_INPUT: readonly BlockInput[] = [
  {
    id: 'skills',
    label: 'Skills',
    lead: 'Each rule about social work has one owner. These are the skills to load before drafting a post, cutting its media or shipping a card.',
    rows: [
      {
        id: 'social-draft',
        title: 'social-draft',
        body: 'The platform formats for X and LinkedIn: length, links in a reply, hashtags, the media limits of each platform, what earns attention on X, and Kevin’s own posting voice. A skill in Kevin’s wiki.',
        path: 'Kevin-Wiki skills/personal/social-draft/SKILL.md',
      },
      {
        id: 'humanizer',
        title: 'humanizer',
        body: 'The last pass over any text Kevin will publish, a post included: it removes AI-writing patterns, jargon and unexplained acronyms. A wiki skill.',
        path: 'Kevin-Wiki skills/personal/humanizer/SKILL.md',
      },
      {
        id: 'gt-voice',
        title: 'gt-voice',
        body: 'The words: the two registers, the hard rules, and the launch package in references/launch-posts.md, which covers the X thread and LinkedIn post drafted together, the open-source credit order and the launch-week shape.',
        link: { href: '/skills/gt-voice', label: 'Open gt-voice' },
      },
      {
        id: 'gt-graphics',
        title: 'gt-graphics',
        body: 'The pictures: the sizes rendered for X and LinkedIn, what a social picture may show, the blog’s 2400 by 1260 card, and the tags and image of a link’s card, in references/social-media.md.',
        link: { href: '/skills/gt-graphics', label: 'Open gt-graphics' },
      },
      {
        id: 'gt-website',
        title: 'gt-website',
        body: 'The blog post a launch links to: its frontmatter names the dark and light covers and the social card under ogImages, each with a ?v= stamp.',
        link: { href: '/skills/gt-website', label: 'Open gt-website' },
      },
      {
        id: 'gt-verify',
        title: 'gt-verify',
        body: 'The check after a deploy: the card’s tags read live, the image answering as a PNG, and the card opened and looked at.',
        link: { href: '/skills/gt-verify', label: 'Open gt-verify' },
      },
    ],
  },
  {
    id: 'attention',
    label: 'What earns attention',
    lead: 'Eliot’s guide to growing on X and Maran’s notes on X’s ranking after its change of 2026-11-25, restated. The social-draft skill holds these rules, and Kevin’s rules win where they differ.',
    rows: [
      {
        id: 'reader-first',
        title: 'Something for the reader',
        body: 'Before posting, name what a stranger takes away: a number, a method, a file or a clip. A post that only reports news about the author needs one of those added.',
        link: { href: 'https://x.com/CDTEliot/status/2123493376528175223', label: 'The guide on X' },
      },
      {
        id: 'next-step',
        title: 'One step past the conversation',
        body: 'When everyone is discussing a stat, a launch or a clip, post what comes next: the chart behind it, the source footage, the real number. The conversation already running carries the post.',
      },
      {
        id: 'five-seconds',
        title: 'Five seconds',
        body: 'The first line says what the reader gets and who it is for. A finding that overturns a common belief needs no reason to care, so state it with its proof, and never as an “X, not Y” flip.',
      },
      {
        id: 'native-media',
        title: 'Native media',
        body: 'Upload video to X directly instead of linking out. Cut the best minutes of a long source, give a full episode chapters and timestamps, and share an article as a screenshot of its passage with the key sentences highlighted. Every post carries a picture or a video.',
      },
      {
        id: 'clips',
        title: 'Clips worth posting',
        body: 'A claim against common practice, a prediction someone can check, a moment that shows work people no longer need to do, proof with numbers, or a hard idea explained in under 30 seconds.',
      },
      {
        id: 'sends-over-likes',
        title: 'Sends and replies over likes',
        body: 'X now ranks a copied link, a reply from a mutual follower, a quote and a DM share far above a like, and a report, a mute or a “not interested” costs more than any post earns. Original research, step-by-step guides, tool lists and breakdowns rank; bait, spam replies and gm posts get muted.',
        link: { href: 'https://x.com/TheMaran/status/2125596121754173810', label: 'Maran’s notes on X' },
      },
      {
        id: 'replies',
        title: 'Replies with substance',
        body: 'Reply to mutuals with a fact, a counter-angle or a specific example, never “nice”, and keep a good thread going over several replies. Don’t race to be the first reply on a post that just went up.',
      },
      {
        id: 'checks',
        title: 'Five checks',
        body: 'Easy to quote, adds something new, true, gives people something to reply to, and worth copying the link of or sending to someone. A draft that fails one waits.',
      },
      {
        id: 'kevin-wins',
        title: 'Where Kevin’s rules win',
        body: 'Eliot’s triggers built on status or belonging read as slogans and bait, so they stay out, and Maran’s exact weights have no source, so only their order is kept. Kevin’s X posts are lowercase, give real detail, and end on that detail with no closing one-liner and at most one emoji.',
      },
    ],
  },
  {
    id: 'series-a',
    label: 'Series A launch',
    lead: 'The media of the Series A launch week, posted from 2026-11-10 to 2026-11-23. Every comparison puts the shipped version first, and each picture has an X cut at 16:9 and a LinkedIn cut at 4:5.',
    rows: [
      {
        id: 'x-film',
        title: 'The X film',
        body: 'The 10-second announcement film: the logo, “Series A” over “$27m”, its characters cycling through other scripts, beside a turning earth tiled in letters.',
        variants: [film('x', 'X, 16:9', 'series-a-x-film')],
        link: { href: '/raise', label: 'Every final and round on /raise' },
      },
      {
        id: 'launch-b',
        title: 'Launch b',
        body: 'The launch film: a translated website, a product video, docs and an app set down on the earth, each on the countries whose languages it is in.',
        variants: [film('x', '16:9', 'series-a-launch-b')],
      },
      {
        id: 'logo-rounds',
        title: 'The logo and its rounds',
        body: 'The shipped globe mark, then three rounds before it: the dynamic round, the team picks and the first sketches.',
        variants: pair('series-a-logo-rounds'),
      },
      {
        id: 'earth-posters',
        title: 'The posters and their rounds',
        body: 'The shipped poster, then three earlier earths: poster B, the horizon poster and the stipple earth.',
        variants: pair('series-a-earth-posters'),
      },
      {
        id: 'raise-mosaic',
        title: 'Two weeks of files',
        body: 'A mosaic of 108 tiles from the review page, oldest at top left: blog figures, posters, investor cards, founders walls and earths.',
        variants: pair('series-a-raise-mosaic'),
      },
      {
        id: 'x-film-rounds',
        title: 'The X film and its rounds',
        body: 'The 10-second film beside the three rounds before it, playing in sync. LinkedIn carried a still of the same comparison.',
        variants: [film('x', 'X, 16:9', 'series-a-x-film-rounds'), still('li', 'LinkedIn still, 4:5', `${M}/series-a-x-film-rounds-li.webp`, 1080, 1350)],
      },
      {
        id: 'films-finalists',
        title: 'The launch film finalists',
        body: 'Launch b, the lead, beside launch c and launch a, playing in sync.',
        variants: [film('x', '16:9', 'series-a-films-finalists')],
      },
      {
        id: 'films-rounds',
        title: 'The launch film rounds',
        body: 'Launch b beside three earlier cuts: the first cut, the 3D film and the first Katagami cut.',
        variants: [film('x', '16:9', 'series-a-films-rounds')],
      },
      {
        id: 'translation-demo',
        title: 'The translation demo',
        body: 'The final demo beside two earlier rounds: a wall of nine clips translating in a wave, then each one full screen in its language.',
        variants: [
          film('x', 'X, 16:9', 'series-a-translation-demo-rounds'),
          still('li', 'LinkedIn still, 4:5', `${M}/series-a-translation-demo-rounds-li.webp`, 1080, 1350),
        ],
      },
      {
        id: 'music',
        title: 'The music',
        body: 'Five six-second excerpts of launch film a, each with the score it was tried with, the shipped one first. Play it with sound.',
        variants: [film('x', '16:9', 'series-a-music')],
      },
      {
        id: 'type',
        title: 'The type',
        body: '“Scale to every language” in Inter, then in Katagami Text, with the letters a, e, g and s matched at x-height and the numbers of the cut.',
        variants: pair('series-a-type'),
      },
      {
        id: 'blog-headers',
        title: 'The blog header and its rounds',
        body: 'The shipped header of the announcement post, then the magazine pick and the first header, which still carry the retired monogram.',
        variants: pair('series-a-blog-headers'),
      },
      {
        id: 'unshipped',
        title: 'What didn’t ship',
        body: 'The horizon poster in color and in mono, two frames of the 3D film (the Korean poster and the glass poster), and the glyph globe.',
        variants: [
          still('horizon', 'Horizon', `${M}/series-a-unshipped-horizon.webp`, 2160, 2700),
          still('bw', 'Mono', `${M}/series-a-unshipped-horizon-bw.webp`, 3200, 1800),
          still('korean', 'Korean', `${M}/series-a-unshipped-3d-korean.webp`, 1920, 1080),
          still('glass', 'Glass', `${M}/series-a-unshipped-3d-glass.webp`, 1920, 1080),
          still('globe', 'Globe', `${M}/series-a-unshipped-glyph-globe.webp`, 1080, 1350),
        ],
      },
    ],
  },
  {
    id: 'earlier',
    label: 'Earlier social media',
    lead: 'The social media already kept in this repository: a launch thread, the profile banners, announcement films and the blog’s cards.',
    rows: [
      {
        id: 'docs-launch',
        title: 'Designing docs for humans',
        body: 'The X thread of twelve posts and the LinkedIn post for the docs series, each post naming the image it carries. The cover led the thread.',
        path: 'graphics/social/designing-docs-for-humans.md',
        variants: [still('cover', 'Cover', '/static/blogs/designing-docs.webp', 3840, 2160)],
      },
      {
        id: 'x-banner',
        title: 'The X profile banner',
        body: 'The sign-in page’s dither globe and glyph rain beside the customer logos, at 1500 by 500 with a 3000 by 1000 master.',
        variants: [still('banner', 'Banner', '/media/gt-banner-signin@2x.webp', 3000, 1000)],
      },
      {
        id: 'slash-films',
        title: 'Supporting Slash companies',
        short: 'Slash films',
        body: 'The partnership announcement film in English, with its German, Spanish and Japanese cuts.',
        variants: [
          film('en', 'English', 'slash-announcement', 1920, 1080, '/media'),
          film('de', 'German', 'slash-announcement-de', 1920, 1080, '/media'),
          film('es', 'Spanish', 'slash-announcement-es', 1920, 1080, '/media'),
          film('ja', 'Japanese', 'slash-announcement-ja', 1920, 1080, '/media'),
        ],
      },
      {
        id: 'open-source-reel',
        title: 'The open source reel',
        body: 'The open source announcement reel: twelve shader materials cut to the music, ending on the grant reveal.',
        variants: [
          {
            key: 'reel',
            label: 'Reel',
            src: '/media/open-source-reel.mp4',
            poster: '/media/open-source-poster.jpg',
            w: 1920,
            h: 1080,
            kind: 'video',
          },
        ],
      },
      {
        id: 'blog-cards',
        title: 'The blog’s link cards',
        body: 'The cards the blog’s posts unfurl into on X and LinkedIn. Designing docs for humans has a 2400 by 1260 card in a dark and a light version; the older cards for Rewriting our docs and Fuma Nama are smaller.',
        variants: [
          still('dark', 'Dark', '/static/blogs/designing-docs-og.png', 2400, 1260),
          still('light', 'Light', '/static/blogs/designing-docs-og-light.png', 2400, 1260),
          still('rewriting', 'Rewriting', '/static/blogs/rewriting-our-docs-og.png', 1920, 1008),
          still('fuma', 'Fuma', '/static/blogs/fuma-nama-og.png', 960, 504),
        ],
      },
    ],
  },
  {
    id: 'metadata',
    label: 'Metadata',
    lead: 'The sizes and fields every post and card carries. gt-graphics owns them, in references/social-media.md, and social-draft owns the platform limits.',
    rows: [
      {
        id: 'post-media',
        title: 'Post media',
        body: 'Each X picture has a LinkedIn twin cut at 4:5 from the same composition.',
        specs: [
          { key: 'X still', value: '16:9, 3840 by 2160 master, under 5 MB, up to four per post' },
          { key: 'X film', value: '16:9, 1920 by 1080 MP4, one per post' },
          { key: 'X video feed', value: '9:16, 1080 by 1920 MP4, 15 to 60 seconds, hook in the first one or two seconds' },
          { key: 'X GIF', value: '1400 wide, under 15 MB, posted alone' },
          { key: 'LinkedIn still', value: '4:5, 2160 by 2700 master' },
          { key: 'LinkedIn film', value: '4:5, 1080 by 1350 MP4; a GIF shows as a still, so none are used' },
        ],
      },
      {
        id: 'video-file',
        title: 'Video files',
        body: 'Both feeds autoplay muted, so the first frame carries the point.',
        specs: [
          { key: 'Codec', value: 'H.264 with AAC audio' },
          { key: 'Start', value: 'moov atom at the front (-movflags +faststart)' },
          { key: 'Web copy', value: '<name>-film.mp4 and <name>-poster.jpg in public/media' },
        ],
      },
      {
        id: 'banners',
        title: 'Profile banners',
        body: 'A banner keeps its type and marks clear of the profile photo and of the phone crop.',
        specs: [
          { key: 'X', value: '1500 by 500, with a 3000 by 1000 master' },
          { key: 'LinkedIn', value: '1584 by 396, with a 3168 by 792 master' },
          { key: 'LinkedIn clear', value: 'from x 440 for the photo; x 132 to 1452 for the phone' },
        ],
      },
      {
        id: 'card',
        title: 'The link card',
        body: 'What a page or post unfurls into when its address is posted. X and LinkedIn cache a card by its address, so a changed card ships under a new ?v= stamp.',
        specs: [
          { key: 'Image', value: '1200 by 630 PNG at least; a blog card is 2400 by 1260, dark and light' },
          { key: 'OpenGraph', value: 'og:title, og:description, og:url, og:type, og:site_name, og:image with width, height and alt' },
          { key: 'X', value: 'twitter:card summary_large_image, twitter:site, twitter:creator' },
          { key: 'Description', value: '50 to 160 characters, no em dash, no exclamation mark' },
          { key: 'Prototemplate', value: 'seoRoute() in src/lib/seo/route.ts writes every tag' },
        ],
      },
      {
        id: 'post-record',
        title: 'Each post’s record',
        body: 'One file holds every post of a launch, so the preview Kevin reviews and the upload read the same data.',
        specs: [
          { key: 'Copy', value: 'the text as it will be posted, after the voice pass' },
          { key: 'Media', value: 'each file’s path, in post order' },
          { key: 'Alt text', value: 'what each picture shows, every tile label named, shipped first' },
          { key: 'Where', value: 'the platform, the account, the day and the post it quotes' },
          { key: 'Link', value: 'in a reply on X, never in the post itself' },
        ],
      },
    ],
  },
];

/** The blocks with every row numbered through the whole page. */
export const SOCIAL_BLOCKS: readonly SocialBlock[] = (() => {
  let n = 0;
  return BLOCKS_INPUT.map((block) => ({
    ...block,
    rows: block.rows.map((row) => {
      n += 1;
      return { ...row, n: String(n).padStart(2, '0') };
    }),
  }));
})();

export const SOCIAL_ROW_COUNT = SOCIAL_BLOCKS.reduce((total, block) => total + block.rows.length, 0);

/** The number of pictures and films the page shows. */
export const SOCIAL_MEDIA_COUNT = SOCIAL_BLOCKS.reduce(
  (total, block) => total + block.rows.reduce((sum, row) => sum + (row.variants?.length ?? 0), 0),
  0
);
