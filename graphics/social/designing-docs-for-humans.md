# Designing docs for humans: launch posts

The X thread and the LinkedIn post for the third post of the docs series,
with the image from `public/static/blogs` each one carries. Export the
images at 1920 by 1080 PNG for upload (X keeps images under 5 MB; a GIF
posts alone, up to 15 MB; LinkedIn shows GIFs as stills, so its set is
images only). Post link: https://generaltranslation.com/blog/designing-docs-for-humans

## X thread

Each entry is one post; the image line names the file(s) it carries (up to
four images per post, a GIF on its own).

1. we redesigned the General Translation docs. a thread on the principles, with Taylor Fang.

   agents read most docs now. humans still open them to decide if a product is worth their time. that makes design matter more, not less.
   image: `designing-docs.webp` (the cover)

2. every area of the screen does one job. navigation on the left, actions top right, links and preferences bottom left. nothing else competes for the eye.
   image: `designing-docs-H0-cover-final.webp` (the page map)

3. step one was deleting. above the fold, the old page had a search field, a GitHub banner, a sidebar toggle and a header rule. they became one row of five controls.
   image: `designing-docs-B2-before-after-split.webp`

4. the old page had six navigation surfaces. the new one has three. the sidebar is one accordion, and it keeps your place when you click.
   image: `designing-docs-C1-nav-census.webp`

5. anatomy of the sidebar: a section switcher, one active item, group headings, footer links, preferences. the switcher is the only place the tree changes.
   image: `designing-docs-C2-accordion-anatomy.webp`

6. hierarchy does the guiding: solid icons, separators between sections, italics for meta, 400 weight for body. the quickstarts went from eight logo tiles to eight cards with one line each.
   images: `designing-docs-D5-quickstart-pages.webp`, `designing-docs-D1-type-specimen.webp`

7. the fun part. the table-of-contents thumb is an SVG path used as a CSS mask, so it works with server rendering and slides along the rail as you scroll.
   gif: `designing-docs-toc-slide.gif`

8. the same mask runs down the sidebar. it steps in 12px per nesting level with a 45° bend, and the blue thumb follows you row by row.
   gif: `designing-docs-sidebar-mask.gif`

9. small things that fight AI-design symptoms: solid icons where an icon carries meaning and thin outlines only on controls, 6 to 8px corners instead of pills, custom matte flag SVGs instead of emoji, one scrollbar style everywhere.
   images: `designing-docs-E2-solid-vs-outline.webp`, `designing-docs-E3-corners.webp`, `designing-docs-E4-micro-ui.webp`

10. and it has to hold in every language. same spacing, alignment and order in English and Chinese.
    image: `designing-docs-E5-localized.webp`

11. our hit list of docs anti-patterns. if you built a docs site from a template, you have probably shipped a few.
    images: `designing-docs-F5-poster.webp`, `designing-docs-F2-spot-the-antipatterns.webp`

12. the full post, with every before and after: https://generaltranslation.com/blog/designing-docs-for-humans

    built on Fumadocs, with a debt to Linear's docs for the restraint.

## LinkedIn

Images, in order: the cover, the page map, the before-and-after split, the
navigation census, the sidebar anatomy, the quickstarts, solid vs outline
icons, the flags menus, the hit list poster.

We redesigned the General Translation docs. Taylor Fang and I wrote up the principles behind it, with before-and-after images of every change.

The question we started with: if agents are now most of the traffic to a docs site, is design still worth the effort? We think it matters more, not less. Humans still open docs to understand a product and decide whether to trust it, and they need an interface that removes noise instead of adding it.

What we did:

1. Gave each area of the screen one job. Navigation on the left, actions top right, links and preferences bottom left.
2. Deleted. The old page had a search field, a GitHub banner, a sidebar toggle and a header rule above the fold. They became one row of five controls.
3. Consolidated navigation. Six surfaces became three, and the sidebar is one accordion that keeps your place.
4. Let hierarchy guide the eye: solid icons, separators between sections, italics for meta, a lighter weight for body text. The quickstarts went from eight logo tiles to eight cards with one line each.
5. Added small details that fit the brand without getting in the way, like a thumb drawn as an SVG mask that slides along the table of contents and the sidebar rail.
6. Made it hold in every language: the same spacing, alignment and order in English and Chinese.

We also kept a hit list of anti-patterns we kept running into: eyebrow text, over-rounded boxes, non-solid icons, sidebars that expand forever or change when you click.

Built on Fumadocs, with a debt to Linear's docs for the restraint.

The full post: https://generaltranslation.com/blog/designing-docs-for-humans

## X, short form

One post and three replies, for when the thread is too much.

1. Main. image: `designing-docs.webp` (the cover)

   agents read most docs these days, but it's humans who open them to decide if a product is worth their time.

   so we redesigned our docs for humans. one sidebar, fewer lines and buttons, hierarchy that guides the eye, and a few details that feel like us. with Taylor Fang.

2. Reply 1. images: `designing-docs-H0-cover-final.webp`, `designing-docs-B2-before-after-split.webp`, `designing-docs-C1-nav-census.webp`, `designing-docs-F5-poster.webp`

   where things live on the page, what we cut, six navigation surfaces down to three, and our hit list of docs anti-patterns.

3. Reply 2.

   the full post, with every before and after: https://generaltranslation.com/blog/designing-docs-for-humans

4. Reply 3. images: four grounds from `public/graphics/bg` (`blue/u16-A`, `blue/u25-A`, `user/u20`, `user/u27`)

   every background in the post is a glyphfield export: the dither ground under each figure, the covers, the OG cards. https://glyphfield.com
