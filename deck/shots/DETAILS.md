# Website detail crops

Round five, section 2. Every image below exists as a light and a dark twin cut from the same pixel region of the same page, so a slide can carry `src="shots/detail-<name>-light.jpg"` and `data-dark="shots/detail-<name>-dark.jpg"` and switch with the deck theme.

Sources are the production captures at 1440x900 with a device scale of 2, so every pixel region below is in 2x coordinates on a 2880x1800 viewport capture. Two crops come from the full-page captures (also 2880 wide) because their content sits below the first viewport; those rows are marked. Crops are saved at native 2x pixels, JPEG quality 88, without resampling. Coordinates are `left, top, right, bottom`.

The page twins are separate files: `site-<page>-light.jpg` and `site-<page>-dark.jpg` at 1440x900, JPEG quality 84, downsampled from the same captures for home, pricing, usage, enterprise, careers, docs, docs-quickstart, blog, blog-post, blog-oss, contact, report-card, 404 and dash.

Two notes for the slide author. The live hero headline has no doubled underline, so `detail-hero` is captioned for what the page shows. The code panel on the docs site is a light plate in light mode and a near-black plate in dark mode; the deck's own `#101010` panel rule applies to deck code, not to this screenshot.

| Crop | Source page | Region (2x px) | Size | Caption |
| --- | --- | --- | --- | --- |
| `detail-nav-mark` | home | 300, 0, 1500, 200 | 1200x200 | The navigation bar carries the mark and four text links and is closed by a single hairline; the left page rail starts at that hairline instead of running through the header. |
| `detail-nav-actions` | home | 1720, 0, 2560, 200 | 840x200 | The header's right side pairs an outlined Sign In button with a filled Get a Demo button, and the search field shows its shortcut as two keycaps. |
| `detail-hero` | home | 840, 210, 2040, 600 | 1200x390 | The hero sets the headline in the display face at one weight, places the mark inline in the subtitle, and pairs a filled primary button whose border carries the brand gradient with an outlined secondary button. |
| `detail-cross` | home | 240, 1400, 1440, 1600 | 1200x200 | A registration cross marks the point where the left rail meets the rule that closes the hero band, and the caption line below it sits inside the rails. |
| `detail-logo-row` | home (full-page capture) | 300, 1548, 1500, 1820 | 1200x272 | The customer logos sit in ruled cells with one hairline per seam, rendered in a single ink and aligned to a common cap height; a hatched band closes the row. |
| `detail-pricing-seam` | pricing | 1240, 600, 2560, 916 | 1320x316 | The two pricing cards share one vertical seam, and the hero rule runs into it; the Enterprise card is the only surface with a dotted plate and a 1px accent border. |
| `detail-docs-sidebar` | docs | 0, 590, 988, 1348 | 988x758 | The docs sidebar hangs each group of links from one vertical hairline and separates itself from the content column with a second rail; the quickstart cards use the same 1px border. |
| `detail-docs-toc` | docs-quickstart | 2040, 0, 2880, 352 | 840x352 | The table of contents marks the active heading and its active sub-heading with a vertical hairline that steps in at an elbow, and the docs header repeats the outlined and filled button pair. |
| `detail-code-panel` | docs-quickstart | 600, 1510, 2000, 1730 | 1400x220 | The install panel keeps the package manager tabs on a plate above the code, marks the active tab with a short underline, and sets the commands in monospace; in dark mode the plate is near-black with light text. |
| `detail-footer` | contact (full-page capture) | 300, 1700, 1500, 2352 | 1200x652 | The footer opens with a rule that the page rail meets at a registration cross and the contact column divider meets at a T junction; column headings are in ink and links in the secondary ink, all at one text size. |
| `detail-404-copy` | 404 | 840, 720, 2040, 1200 | 1200x480 | The 404 page states the failure in full sentences and offers two resolutions as a filled and an outlined button, set over the ring artwork. |
| `detail-report-grid` | report-card | 1340, 1040, 2560, 1540 | 1220x500 | The report card lays out its grade scale as a ruled axis with monospace tick labels at the grade thresholds, inside hairline cells under a hatched separator band. |
| `detail-blog-changelog` | blog | 260, 640, 1652, 1176 | 1392x536 | The changelog row sits between two registration crosses on the left rail; each release card holds a date, a package name, a summary and a version chip on a plate. |
| `detail-ent-logos` | enterprise | 1594, 190, 2544, 752 | 950x562 | The enterprise page lists customers as ruled rows with a single-ink logo at a fixed cap height on the left and the locale count in the secondary ink on the right. |
| `detail-contact-mark` | contact | 400, 370, 1270, 1090 | 870x720 | The contact page draws the mark as four dashed contours in the accent color under a headline that carries the accent on one word. |
| `detail-post-head` | blog-post | 960, 240, 2020, 660 | 1060x420 | The blog post header stacks a breadcrumb in titanium, a two-line title in the display face and an author line with a small avatar. |

Rejected while choosing: a wider pricing crop cut the word "localization" at its edge; a crop of the home demo cut the "Welcome back" heading at its bottom edge; an enterprise crop of the rail and plate junction showed the cross and nothing else; a section-band crop from the home page duplicated the cross, hatched band and ruled heading already covered above.
