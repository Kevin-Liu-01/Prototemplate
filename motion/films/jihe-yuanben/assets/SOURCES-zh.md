# Chinese sources: jihe-yuanben

Fetched 2026-10-02. I looked at every page below at full resolution before keeping it. Full pages are in `assets/zh/pages/` at the largest pixel size each archive serves. Crops are in `assets/zh/`. Each crop was requested from the archive's IIIF image server as a lossless PNG of that region (LOC: `.../x,y,w,h/full/0/default.png`; Internet Archive: `.../x,y,w,h/max/0/default.png`), so nothing was resampled. Pixel boxes are `(left, top, right, bottom)` in the archive's native page image, which is the same pixel grid as the full-page file saved here.

Transcriptions are written as printed: no modern punctuation, and the printed character forms are kept (啓, 筭, 荅, 句 for 勾, and so on).

Access notes for whoever fetches next. loc.gov sends a Cloudflare challenge to curl's default user agent and answers normally to a browser user agent. Its `?fo=json` item and resource pages list every image. sourcelibrary.org's HTML pages are behind the same challenge. Its JSON API at `https://sourcelibrary.org/api/books/{id}` is open and lists `image_full` for every page. Those files are byte-for-pixel the Internet Archive masters (mean absolute difference 0.6/255 on page 19). The IA IIIF server serves the original 600 ppi bitonal TIFFs.

## Corrections and additions to BRIEF.md found in the scans

1. **The 界說 note is not a small double-column note.** In this printing, 凡造論先當分別解說論中所用名目故曰界說 is one indented column of full-size characters. It sits directly under the heading 界說三十六則 on the first text page of 卷一 (vol. 1, sp=8, left half). The same page also carries the credit columns and the 幾何府 note. One page covers three beats.
2. **The credit columns are printed twice.** They appear on sp=8, opening 幾何原本第一卷之首 (the definitions), and on sp=23, opening 幾何原本第一卷 with 本篇論三角形 計四十八題 (the propositions). Both print **徐光啓** with the variant 啓, not 啟. Both read 泰西利瑪竇口譯 / 吳淞徐光啓筆受.
3. **The 凡三易稿 sentence is printed 重復訂政**, not 重複訂正 as the brief quotes it. It is on vol. 1, sp=7, left half, in Ricci's 譯幾何原本引. The column before it gives Ricci's own account of the method: 先生就功命余口傳自以筆受焉 ("he took up the work and had me transmit it by mouth while he himself received it with the brush"). On screen, 口傳 / 筆受 in Ricci's own preface rhymes with the 口譯 / 筆受 credit line.
4. **齟齬 is on the same spread as 凡三易稿** (sp=7, right half): 作輟三進三止嗚呼此游藝之學言象之粗而齟齬若是. The brief's quotation 言象之粗，而齟齬若是 matches the print.
5. **Ricci's preface is dated in the book.** It ends 萬曆丁未泰西利瑪竇謹書 (sp=8, right half), followed by two IHS seals, one oval and one square.
6. **Fact-check items 12 and 21: the LOC copy carries a dated collector's colophon.** On vol. 4, sp=81, a handwritten colophon is signed **應陛** with two seals, 應 and 陛 (Han Yingbi 韓應陛), and dated 咸豐七年正月九日 (1857). My reading of the cursive is tentative: 按此書利氏引末有西洋圖記方圓各一無徐氏序及考訂校閱姓氏及雜議題再校本二條當係京師[丁未歲]原刊板再校本係辛亥所定見於徐氏題再校本語中又云有所增定比於前刻差無遺憾是此冊仍有異字仍可兩存也. The gist: this copy has the two Western seals, round and square, after Ricci's preface (item 5). It lacks Xu's preface, the list of collators, the 雜議 and the 題再校本, so it should be the original Beijing printing of 丁未 (1607). The revised text dates from 辛亥 (1611). Xu's own phrase 比於前刻差無遺憾 is quoted. Volume 1 of the scan does open directly on Ricci's 引, with no Xu preface (sp=2), which fits the claim. This is a 19th-century collector's judgement, not a catalogue record. Keep the caption "early 17th-century printing". If the film wants more, it can say the copy was judged to be the 1607 printing by Han Yingbi in 1857.
7. **The Definition 12 note crosses the gutter.** 第十二界 and 凡角小于直角為銳角 are on the right half of vol. 1, sp=12. The note continues on the left half: 如前圖甲乙丁是 / 通上三界論之直角一而已鈍角銳角其大小不等乃至無數 / 是後凡指言角者俱用三字為識其第二字即所指角也 / 如前圖甲乙丙三字第二乙字即所指鈍角若言甲乙丁即第二乙字是所指銳角. The print says "the second character is the angle meant" (其第二字即所指角). "Vertex" is the brief's gloss. The note is in full-size characters, not small type. The figure it refers to (甲乙丙丁, an obtuse and an acute angle at 乙) is at the top of the right half, under 第十一界.
8. **Book I, Prop. 1 runs over two pages.** sp=23, left half: 第一題 / 于有界直線上求立平邊三角形 / 法曰甲乙直線上求立平邊三角形先以甲為心乙為界作丙乙丁圜… / 論曰…. The figure (two circles, triangle, labels 甲 乙 丙 丁) is at the top. sp=24, right half: …三邊等如所求, followed by a small double-column note 凡論有二種此以是為論者正論也下倣此 and a shortcut construction (其用法不必作兩圜…) with its own small figure. Cited references are printed in small type within the text, not in the margin: 界說十五 and 公論一. The statement uses 有界直線 ("bounded straight line") for the brief's 直線.
9. **The Nine Chapters page order is 今有 → 問…幾何 → 答曰 → 術曰.** The brief highlights the parts in the order 今有田 → 術曰 → 答曰. On the page, the answer comes before the procedure. In the Siku Quanshu page (vols 1–3, p. 19), one 方田術曰 follows two problems and serves both. If the film reorders the three parts, it should do so on purpose.
10. **In the 細草圖說 opening the 術曰 is on the next page.** p. 12 has the title, the credits (魏劉徽注 / 唐…李淳風等奉敕注釋 / 鍾祥李潢雲門譔), 方田, 今有田廣十五步從十六步問為田幾何 and 荅曰一畝, with 答 printed 荅. 術曰廣從步數相乘得積步 is at the top of p. 13. Next to it is a 12 × 14 grid, which is the figure for the *second* problem (廣十二步從十四步, 168 步). The figure was drawn by Li Huang because the original was lost: 潢按據注所云則舊有圖而今亡矣補之 (p. 12).
11. **The 勾股容圓 figure was drawn by the Qing editors.** Vols 7–9, p. 132: the figure is titled 句股容圓圖 and has the labels 朱冪, 青冪, 黃冪 (黃 printed with the 黄 form). The annotation below it ends 原本缺圖今補: "the original lacks the figure; it is now supplied". Caption it as a Qing reconstruction, not a Han or Liu Hui figure. The problem itself is on p. 128: 今有句八步股十五步一問句中容圓徑幾何答曰六步 / 術曰…. The page prints a 一 between 步 and 問. Check against a critical edition before setting this line in type.
12. **The Siku Quanshu scans are of a facsimile.** The IA description says 影印古籍 (photographic reprint of an old book) and 欽定四庫全書·子部六·天文算法類. The images are bitonal at 600 ppi, typical of the modern 景印文淵閣四庫全書 reprints. The record does not name which reprint was scanned.
13. **Archive dates.** sourcelibrary gives "1773" for the Siku volumes, which is the year the Siku project began, not a printing date. It gives "1798" for the 細草圖說. Li Huang's book is usually dated to a posthumous printing around 1820. I have not verified either date. Use "Qing edition" as BRIEF.md says.
14. **Fact-check item 20: LOC wdl_18198 is resolved.** Its LOC record (https://www.loc.gov/item/2021667076/) reads: Euclid's "Elements", Venice: Erhard Ratdolt, 1482-05-25, Latin, original at the Bavarian State Library (shelfmark Rar. 292). This matches SOURCES-west.md item 3.
15. **Ricci's preface uses 幾何 for "how many" and "how large".** Vol. 1, sp=3, right half: 幾何家者專察物之分限者也其分者若截以為數則顯物幾何眾也若完以為度則指物幾何大也. This is direct support for the 幾何 beat, from the same book.

## Rights, as each archive states them

- **Library of Congress / World Digital Library** (item record https://www.loc.gov/item/2021666487/, `rights` field, verbatim): "The Library of Congress is unaware of any copyright or other restrictions in the World Digital Library Collection. Absent any such restrictions, these materials are free to use and reuse. Researchers are encouraged to review the source information attached to each item. … The Library asks that researchers approach the materials in this collection with respect for the culture and sensibilities of the people whose lives, ideas, and creativity are documented here. Credit Line: [Original Source citation], World Digital Library". Notes field: "Original resource at: National Library of China."
- **sourcelibrary.org** (license block returned by `/api/books/{id}/text` and `/quote` for all three books): `"spdx": "CC-BY-SA-4.0"`, `"attribution": "Source Library (https://sourcelibrary.org)"`, `"original_texts": "public-domain"`. Dublin Core `dc_rights`: "CC BY-SA 4.0". Its `image_source.license` reads "publicdomain", which the site itself flags as "IA importer default, not read from the item". The site's attribution note reads: "Digitized by this institution [Internet Archive]. Page images are served from Source Library's own CDN; please do not bulk-fetch the source." My reading: the CC BY-SA applies to Source Library's translations and editorial layer, and the page images are scans of public-domain Qing texts. For the film, credit "Source Library / Internet Archive (CADAL)". Treat the images as CC BY-SA 4.0 if the brief's caution is kept.
- **Internet Archive items** (06057481.cn, 06057483.cn, 02094024.cn): the metadata has **no** `rights`, `licenseurl` or `possible-copyright-status` key. Sponsor: China-America Digital Academic Library (CADAL). Contributors: 浙江大学图书馆 for the two Siku items and 北京大學圖書館 for the 細草圖說.

## Captions (per BRIEF.md image notes)

- Every LOC asset: **Jihe yuanben 幾何原本 · early 17th-century printing · Library of Congress / National Library of China** (never "1607 first edition").
- Siku assets: **九章算術, compiled by the 1st century CE · Qing edition, Siku Quanshu** (+ "Source Library / Internet Archive").
- 細草圖說 assets: **李潢《九章算術細草圖說》· Qing edition** (+ "Source Library / Internet Archive").
- The p. 132 figure: add "figure supplied by the Qing editors (原本缺圖今補)".

## Assets in `assets/zh/`

### A. *Jihe yuanben* 幾何原本, LOC / WDL (item 2021666487, catalogued 1606, 4 vols)

IIIF service per page: `https://tile.loc.gov/image-services/iiif/service:gdc:gdcwdl:wd:l_:17:21:6_:00:{vol}:wdl_17216_00{vol}:{sp:03}`. Resource page: `https://www.loc.gov/resource/gdcwdl.wdl_17216_00{vol}/?sp={sp}`. Each scan is a two-page spread, read right half first. "sp" is the archive's image number in that volume. Full pages are the IIIF `full/pct:100` JPEG, which is the native size of the JP2 master.

#### Full spreads kept (`assets/zh/pages/`)

| File | Vol / sp | What is on it | URL |
|---|---|---|---|
| `loc-wdl17216-v1-p002-full.jpg` (3454×3093) | 1 / 2 | Opening of Ricci's preface 譯幾何原本引, with collectors' seals. The left half is a blank flyleaf | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=2 |
| `loc-wdl17216-v1-p003-full.jpg` (3471×3117) | 1 / 3 | Ricci's preface: 幾何家者…物幾何眾…物幾何大 | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=3 |
| `loc-wdl17216-v1-p007-full.jpg` (3454×3099) | 1 / 7 | Ricci's preface. Right half: 齟齬. Left half: 口傳 / 筆受, 凡三易稿 | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=7 |
| `loc-wdl17216-v1-p008-full.jpg` (3435×3070) | 1 / 8 | Right half: end of the preface, 萬曆丁未泰西利瑪竇謹書, and IHS seals. Left half: **first text page of 卷一**, with the credit columns, 界說 and the 界說 note, the 幾何府 note, and 第一界 點者無分 | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=8 |
| `loc-wdl17216-v1-p012-full.jpg` (3459×3099) | 1 / 12 | Defs. 10 (end) to 13: 第十一界, **第十二界 and its note**, 第十三界 | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=12 |
| `loc-wdl17216-v1-p023-full.jpg` (3483×3093) | 1 / 23 | Left half: 幾何原本第一卷, credits, **Prop. I.1** with its figure. Right half: a page with ink smudges | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=23 |
| `loc-wdl17216-v1-p024-full.jpg` (3471×3099) | 1 / 24 | Right half: end of I.1, **三邊等如所求**. Left half: Prop. I.2 | https://www.loc.gov/resource/gdcwdl.wdl_17216_001/?sp=24 |
| `loc-wdl17216-v4-p081-full.jpg` (3501×3111) | 4 / 81 | Han Yingbi's handwritten colophon, 1857 | https://www.loc.gov/resource/gdcwdl.wdl_17216_004/?sp=81 |

#### Crops

| File (px) | Box | Passage, as printed | Use / note |
|---|---|---|---|
| `loc-v1-p008-credit-columns.png` (505×2485) | sp=8 (1195, 375, 1700, 2860) | 幾何原本第一卷之首 [small: 界說三十六 公論十九 求作四] / 泰西利瑪竇口譯 / 吳淞徐光啓筆受, with the red collector's seal over the title | 0:22–0:30 credit beat |
| `loc-v1-p008-credit-tight.png` (330×1530) | sp=8 (1190, 1240, 1520, 2770) | 泰西利瑪竇口譯 / 吳淞徐光啓筆受 only | for lighting each column in turn: 泰西 column on the right, 吳淞 on the left |
| `loc-v1-p008-jieshuo-note.png` (295×2140) | sp=8 (915, 540, 1210, 2680) | 界說三十六則 / 凡造論先當分別解說論中所用名目故曰界說 | 0:46–0:58 界說 beat |
| `loc-v1-p008-jihefu-note.png` (465×2320) | sp=8 (455, 540, 920, 2860) | 凡歷法地理樂律筭章技藝工巧諸事有度有數者皆 / 依賴十府中幾何府屬凡論幾何先從一點始自 / 點引之為線線展為面面積為體是名三度 | 幾何府 beat |
| `loc-v1-p008-jihefu-tight.png` (160×1027) | sp=8 (600, 600, 760, 1627) | 依賴十府中幾何府屬 | tight 幾何府 |
| `loc-v1-p008-wanli-dingwei-date.png` (152×1310) | sp=8 (1690, 380, 1842, 1690) | 萬曆丁未泰西利瑪竇謹書 | Ricci's preface date, 1607 |
| `loc-v1-p008-ihs-seals.png` (335×680) | sp=8 (1695, 2150, 2030, 2830) | Oval IHS seal over a square IHS seal | the 西洋圖記方圓各一 that Han Yingbi cites |
| `loc-v1-p007-sanyigao-2col.png` (318×2500) | sp=7 (460, 380, 778, 2880) | 難自消微必成之先生就功命余口傳自以筆受焉反覆 / 展轉求合本書之意以中夏之文重復訂政凡三易稿先 | the preface on method (contains 口傳 / 筆受) |
| `loc-v1-p007-sanyigao-tight.png` (160×2128) | sp=7 (462, 612, 622, 2740) | 求合本書之意以中夏之文重復訂政凡三易稿 | |
| `loc-v1-p007-sanyigao-4char.png` (160×465) | sp=7 (462, 2275, 622, 2740) | 凡三易稿 | |
| `loc-v1-p007-juyu-column.png` (167×2495) | sp=7 (2505, 395, 2672, 2890) | 作輟三進三止嗚呼此游藝之學言象之粗而齟齬若是 | Shaozhou beat |
| `loc-v1-p007-juyu-tight.png` (167×960) | sp=7 (2505, 1920, 2672, 2880) | 言象之粗而齟齬若是 | |
| `loc-v1-p007-juyu-2char.png` (158×233) | sp=7 (2510, 2415, 2668, 2648) | 齟齬 | for laying over the Shaozhou pin |
| `loc-v1-p003-jihe-howmuch.png` (455×2520) | sp=3 (2890, 380, 3345, 2900) | 所致之知且深且固則無有若幾何一家者矣幾何家者 / 專察物之分限者也其分者若截以為數則顯物幾何眾 / 也若完以為度則指物幾何大也其數與度或脫于物體 | 幾何 = how many / how large, in Ricci's own preface |
| `loc-v1-p012-def12-spread.png` (1267×2495) | sp=12 (785, 395, 2052, 2890) | Across the gutter: 第十二界 凡角小于直角為銳角 and the full note | Def. 12 beat, wide |
| `loc-v1-p012-def12-note.png` (470×2490) | sp=12 (788, 395, 1258, 2885) | 是後凡指言角者俱用三字為識其第二字即所指角 / 也 如前圖甲乙丙三字第二乙字即所指鈍角若言 / 甲乙丁即第二乙字是所指銳角 | the rule with its worked example |
| `loc-v1-p012-def12-rule-column.png` (162×2490) | sp=12 (1096, 395, 1258, 2885) | 是後凡指言角者俱用三字為識其第二字即所指角 | the rule alone |
| `loc-v1-p023-prop1-page.png` (1615×2525) | sp=23 (150, 370, 1765, 2895) | The whole I.1 opening page: title, credits, 第一題, statement, figure, 法曰, 論曰 | to overlap with Clavius's I.1 |
| `loc-v1-p023-prop1-statement.png` (455×2525) | sp=23 (795, 370, 1250, 2895) | 第一題 / 于有界直線上求立平邊三角形 / 法曰甲乙直線上求立平邊三角形先以甲為 | 題 then 法 |
| `loc-v1-p023-prop1-figure.png` (375×355) | sp=23 (530, 500, 905, 855) | Figure: two circles and the triangle, labels 丙 (top), 甲, 乙, 丁 (bottom) | to match Clavius's A B C D (west item 7) |
| `loc-v1-p023-credit-tight.png` (315×1580) | sp=23 (1245, 1250, 1560, 2830) | 泰西利瑪竇口譯 / 吳淞徐光啓筆受 (second printing of the credits) | alternate |
| `loc-v1-p024-prop1-rusuoqiu.png` (630×2515) | sp=24 (2680, 380, 3310, 2895) | 以乙為心則乙甲線與乙丙乙丁線亦等何者凡為圜 / 自心至界各線俱等故[界說十五]既乙丙等于乙甲 / 而甲丙亦等于甲乙即甲丙亦等于乙丙[公論一] / 三邊等如所求 [note 凡論有二種…], with the figure repeated | end of I.1 with its two cited references |
| `loc-v1-p024-rusuoqiu-tight.png` (155×688) | sp=24 (2685, 860, 2840, 1548) | 三邊等如所求 | Chinese Q.E.F. |
| `loc-v4-p081-han-yingbi-colophon-1857.png` (680×2440) | vol 4, sp=81 (2780, 440, 3460, 2880) | Han Yingbi's colophon, 咸豐七年 (1857), signed 應陛 | dating evidence (correction 6) |

### B. *Nine Chapters* 九章算術, Siku Quanshu text (Qing edition), vols 1–3

- sourcelibrary: https://sourcelibrary.org/book/nine-chapters-on-the-mathematical-art-vols-1-3 (book id 6992ca56d4d545ae73fedb8a, 142 pages, "published 1773")
- Internet Archive: https://archive.org/details/06057481.cn, 九章算術·卷一~卷三, （晉）劉徽, 欽定四庫全書·子部六·天文算法類, 影印古籍, 600 ppi, 浙江大学图书馆 / CADAL
- **Page 19** (sourcelibrary page 19 = IA canvas "19" = `06057481.cn_0019.tif`): https://sourcelibrary.org/book/nine-chapters-on-the-mathematical-art-vols-1-3/page/6992ca56d4d545ae73fedb9d · image `https://images.sourcelibrary.org/archived/6992ca56d4d545ae73fedb8a/19.jpg` · IIIF `https://iiif.archive.org/image/iiif/3/06057481.cn%2F06057481.cn_tif.zip%2F06057481.cn_tif%2F06057481.cn_0019.tif`
- Printed text: 欽定四庫全書 / 九章算術卷一 / 晉劉徽注 / 唐李淳風注釋 / 方田以御田疇界域 / 今有田廣十五步從十六步問為田幾何答曰一畝 / 又有田廣十二步從十四步問為田幾何答曰一百六十八步 / 方田術曰廣從步數相乘得積步
- Full page: `pages/sl-ninechapters-siku-v1-3-p019-full.jpg` (2363×3164, grayscale)

| File (px) | Box | Passage | Use |
|---|---|---|---|
| `sl-siku-v1-3-p019-fangtian-block.png` (1050×2605) | (360, 280, 1410, 2885) | 方田以御田疇界域 → 今有田… → 又有田… → 方田術曰… (all five columns) | left half of the split screen: one page with 今有 / 問 / 答 / 術 |
| `sl-siku-v1-3-p019-jinyoutian-column.png` (200×2390) | (1000, 320, 1200, 2710) | 今有田廣十五步從十六步問為田幾何答曰一畝 | the whole first problem in one column |
| `sl-siku-v1-3-p019-wenweitian-jihe.png` (200×580) | (1000, 1670, 1200, 2250) | 問為田幾何 | 幾何 beat: "how much" |
| `sl-siku-v1-3-p019-dayue-yimu.png` (200×460) | (1000, 2240, 1200, 2700) | 答曰一畝 | |
| `sl-siku-v1-3-p019-shuyue-column.png` (210×1595) | (365, 320, 575, 1915) | 方田術曰廣從步數相乘得積步 | |

### C. *Nine Chapters*, Siku Quanshu text (Qing edition), vols 7–9 (the URL in the brief)

- sourcelibrary: https://sourcelibrary.org/book/nine-chapters-on-the-mathematical-art-vols-7-9 (book id 6992ca59d4d545ae73fedcd8, 198 pages, chapters 盈不足, 方程, 句股)
- Internet Archive: https://archive.org/details/06057483.cn, 九章算術·卷七~卷九, same series and reprint note as B, 浙江大学图书馆 / CADAL
- **Page 128** (IA `06057483.cn_0128.tif`): https://sourcelibrary.org/book/nine-chapters-on-the-mathematical-art-vols-7-9/page/6992ca59d4d545ae73fedd58 · image `https://images.sourcelibrary.org/archived/6992ca59d4d545ae73fedcd8/128.jpg`. Printed: 今有句八步股十五步一問句中容圓徑幾何答曰六 / 步 / 術曰八步為句十五步為股為之求弦三位并之為法 / 以句乘股倍之為實實如法得徑 [案徑字下原本衍一步二字乃後人妄加今刪正], followed by Liu Hui's commentary, which names the 朱青黃冪. Full page: `pages/sl-ninechapters-siku-v7-9-p128-full.jpg` (3472×4317).
- **Page 132** (IA `06057483.cn_0132.tif`): https://sourcelibrary.org/book/nine-chapters-on-the-mathematical-art-vols-7-9/page/6992ca59d4d545ae73fedd5c · short link https://sourcelibrary.org/q/BgScAZ9XrcjWMJIOZxk · image `https://images.sourcelibrary.org/archived/6992ca59d4d545ae73fedcd8/132.jpg`. Printed: 句股容圓圖, the figure, then 案句股相乘半之為句股積有朱青黃冪各一則句股相乘倍之有朱青黃冪各四截朱青冪各成小句股者二今倒順相補各成小長方合四朱四青四黃而成大長方以容圓之徑為廣并句股弦為袤原本缺圖今補. Full page: `pages/sl-ninechapters-siku-v7-9-p132-full.jpg` (3472×4315).

| File (px) | Box | Passage | Use |
|---|---|---|---|
| `sl-siku-v7-9-p128-gougu-rongyuan-problem.png` (1555×3740) | p128 (1525, 290, 3080, 4030) | The problem, answer, procedure and the commentary that names 朱青黃冪 | 勾股容圓 problem page |
| `sl-siku-v7-9-p128-problem-columns.png` (600×3700) | p128 (2470, 300, 3070, 4000) | 今有句八步股十五步一問句中容圓徑幾何答曰六 / 步 | |
| `sl-siku-v7-9-p128-wen-jihe.png` (300×1380) | p128 (2760, 2045, 3060, 3425) | 問句中容圓徑幾何 | a second 問…幾何, at larger size than B |
| `sl-siku-v7-9-p132-figure-with-title.png` (1520×2210) | p132 (1060, 250, 2580, 2460) | 句股容圓圖 with the figure: a right triangle on a square grid, its inscribed circle, and the labels 朱冪, 青冪, 黃冪 | two-second cutaway |
| `sl-siku-v7-9-p132-figure.png` (1400×1745) | p132 (1090, 700, 2490, 2445) | Figure only | |
| `sl-siku-v7-9-p132-annotation.png` (2475×1455) | p132 (600, 2540, 3075, 3995) | The 案 note, ending 原本缺圖今補 | source for the reconstruction caption |

### D. Li Huang 李潢, *Jiuzhang suanshu xicao tushuo* 九章算術細草圖說, vol. 1 (Qing edition)

- sourcelibrary: https://sourcelibrary.org/book/jiuzhang-suanshu-xicao-tushuo-illustrated-commentary-on-dynasty (book id 69af0e3abe5fc7f363546705, 123 pages, "published 1798" per the site, see correction 13)
- Internet Archive: https://archive.org/details/02094024.cn, 九章算術細草圖說(一), (清)李潢撰, 古籍, 600 ppi, 北京大學圖書館 / CADAL. Its description notes 原書有些字跡不清、有些頁殘 (some characters unclear, some leaves damaged).
- **Page 12**, 卷一 opening (IA `02094024.cn_0012.tif`): https://sourcelibrary.org/book/jiuzhang-suanshu-xicao-tushuo-illustrated-commentary-on-dynasty/page/69af0e3abe5fc7f363546711 · image `https://images.sourcelibrary.org/archived/69af0e3abe5fc7f363546705/12.jpg`. Printed: 九章算術細草圖說卷一 / 魏劉徽注 / 唐朝議大夫行太史令上輕車都尉臣李淳風等奉敕注釋 / 鍾祥李潢雲門譔 / 方田[以御田疇界域] / 今有田廣十五步從十六步問為田幾何 / 荅曰一畝 / 又有田廣十二步從十四步問為田幾何 / 荅曰一百六十八步[圖從十四廣十二] / 潢按據注所云則舊有圖而今亡矣補之. Full page: `pages/sl-xicao-tushuo-v1-p012-full.jpg` (1900×3000).
- **Page 13** (IA `02094024.cn_0013.tif`): https://sourcelibrary.org/book/jiuzhang-suanshu-xicao-tushuo-illustrated-commentary-on-dynasty/page/69af0e3abe5fc7f363546712 · image `https://images.sourcelibrary.org/archived/69af0e3abe5fc7f363546705/13.jpg`. Printed: the 12 × 14 grid [從十四步, 廣十二步] / 如圖廣十二步從十四步相乘得一百六十八步 / 方田 / 術曰廣從步數相乘得積步 [then Li Chunfeng's commentary in small type]. Full page: `pages/sl-xicao-tushuo-v1-p013-full.jpg` (1900×3000).

| File (px) | Box | Passage | Use |
|---|---|---|---|
| `sl-xicao-v1-p012-opening.png` (1133×2318) | p12 (645, 350, 1778, 2668) | Title, credits, 方田, first problem, 荅曰一畝 | the brief's "細草圖說 卷一 opening page" |
| `sl-xicao-v1-p012-jinyoutian-dayue.png` (324×2255) | p12 (648, 385, 972, 2640) | 今有田廣十五步從十六步問為田幾何 / 荅曰一畝 | |
| `sl-xicao-v1-p013-shuyue.png` (280×1248) | p13 (495, 620, 775, 1868) | 方田 / 術曰廣從步數相乘得積步 | the 術曰 that follows on the next page |
| `sl-xicao-v1-p013-field-grid.png` (730×860) | p13 (860, 670, 1590, 1530) | 12 × 14 grid of unit squares, labelled 從十四步 / 廣十二步 | the field drawn as 168 squares (problem 2), drawn by Li Huang |

## What I looked at and did not keep

- LOC vol. 1, all 69 images, at quarter size. Kept: sp=2, 3, 7, 8, 12, 23, 24. sp=9–11 hold Defs. 2–10, which are not saved. I read sp=11 at half size: its right half continues the Def. 8 (平角) note with 如上甲乙乙丙二線雖相遇不作平角為是曲線 / 所謂角止是兩線相遇不以線之大小較論. Fetch sp=10 and sp=11 from the same service if the 平角 false-friend line is used.
- LOC vol. 4, sp=75–82, at quarter size: the end of Book VI, the colophon (sp=81) and the back cover. Kept: sp=81.
- sourcelibrary vols 7–9, p. 131 (blank columns, end of a commentary) and p. 133. Not kept.
- I did not use sourcelibrary's 九章算經 vol. 1 (IA 02094022.cn, a separate Peking University copy). It is a further Qing-era option for 方田 if a third page style is wanted.

Nothing the task asked for went unfound. The one gap: in the 細草圖說, the 術曰 for the opening problem is not on the opening page itself (p. 12). It is at the top of p. 13.
