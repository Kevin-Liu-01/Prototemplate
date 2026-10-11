/* modern-hebrew: every picture the film shows and every box it isolates, in
   the picture's own pixels (x0, y0, x1, y1). The dictionary boxes were read
   off the plates by the dictionary lane (motion/concepts/modern-hebrew/
   dictionary/lib/data.js, tools/lines.py and tools/grid.py) and checked again
   for this film by drawing them on the plates. Plates are the scans at their
   own resolution, flat-fielded onto the book's paper by tools/plates.py; the
   documents from outside the book keep their own paper (tools/docs.py). */
window.MHDATA = {
  plates: {
    'v1-n12': { src: 'assets/plates/v1-n12.jpg', ghost: 'assets/plates/v1-n12-ghost.jpg', w: 2571, h: 3887 },
    'v1-n16': { src: 'assets/plates/v1-n16.jpg', ghost: 'assets/plates/v1-n16-ghost.jpg', w: 2571, h: 3887 },
    'v1-n131': { src: 'assets/plates/v1-n131.jpg', ghost: 'assets/plates/v1-n131-ghost.jpg', w: 2532, h: 3887 },
    'v4-n408': { src: 'assets/plates/v4-n408.jpg', ghost: 'assets/plates/v4-n408-ghost.jpg', w: 3148, h: 5013 },
  },
  // v2 cuts the 1913 and 1922 story (SCRIPT-v2.md). Its pictures stay in
  // assets/ for a longer cut and are not loaded: the funders' page, the
  // Technikum photograph, the Jaffa poster and Cmd. 1785's Article 22. Their
  // boxes stay below (funders, mandate, poster).
  longerCut: {
    'v1-n19': { src: 'assets/plates/v1-n19.jpg', ghost: 'assets/plates/v1-n19-ghost.jpg', w: 2532, h: 3887 },
    technikum: { src: 'assets/raw/technikum-1913.png', w: 500, h: 500 },
    poster: { src: 'assets/raw/asefa-nave-shalom.jpg', w: 1722, h: 2329 },
    mandate: { src: 'assets/plates/mandate-art22.jpg', ghost: 'assets/plates/mandate-art22-ghost.jpg', w: 1890, h: 520 },
  },
  // ink cut out of a plate (tools/inkcut.py), drawn over any paper without an edge
  inks: {
    milon: { src: 'assets/derived/title-milon-ink.png', r: [1779, 362, 2142, 578] }, // the title's מלון
  },
  // vol. 1, Hebrew title page (leaf n12)
  title: {
    milon: [1795, 378, 2126, 562], // the first word of the title, מלון
    promise3: [338, 1224, 1472, 1297], // "ומספר רב של מלים אשר יצר המחבר למושגים ישנים"
    promise4: [2128, 1317, 2297, 1384], // "וחדשים,"
  },
  // vol. 1, the note and the key of signs (leaf n16)
  key: {
    heading: [1588, 1878, 2322, 1934], // ואלה הסימנים שהשתמשתי בהם:
    rows: [
      [1737, 1961, 2326, 2018], // no sign: words from the Bible
      [1407, 2032, 2324, 2091], // asterisk: Ben Sira, the Mishnah, the Talmud and the Midrash
      [1289, 2104, 2327, 2159], // the sign for the literature after the Talmud
      [776, 2176, 2325, 2234], // the coinage sign
    ],
    signCoin: [2281, 2187, 2323, 2205], // the printed coinage sign (ink box)
  },
  // vol. 1, end of the abbreviations: the societies that shared the printing (leaf n19)
  funders: {
    line1: [110, 2716, 1986, 2787],
    line2: [110, 2803, 1986, 2868],
    hilfsverein: [1072, 2802, 1988, 2869], // Hilfsverein der Deutschen Juden;
  },
  // vol. 1, p. 110 (leaf n131)
  p110: {
    sign: [1080, 779, 1124, 798], // the printed coinage sign before the headword (ink box)
    head: [868, 758, 1130, 848], // ∞אָפְנַיִם¹)
    entry: [126, 758, 1130, 1014], // the entry, four lines
    mark: [874, 760, 902, 792], // ¹)
    note1: [552, 2424, 1006, 2494], // ¹) מן, אופן, ע״מ אזנים.
    noteMark: [950, 2425, 1004, 2472],
    rule: [350, 2380, 1299, 2392],
    gutter: 1164, // the clear gutter between the two columns (x 1130 to 1198)
  },
  // vol. 4, p. 1806 (leaf n408)
  p1806: {
    sense: [1458, 2402, 2650, 2460], // ג) ⁘הכח הטבעי ...
    senseIso: [1870, 2402, 2650, 2460], // the part of the sense line v2 isolates: ג) to גופים, the last whole word inside the window at 1.6 (the window's left edge is at x 1725; the word gap before גופים runs 1856 to 1883)
    elec: [1448, 2592, 2650, 2648], // ... Elektrizität; électricité; e-ty
    german: [1926, 2582, 2528, 2650], // Elektrizität; électricité (v2 isolates these two words; ink columns read off the plate: ':' ends at 1914, 'é' at 2526, ';' from 2534)
    sign: [2551, 2421, 2573, 2439], // the printed post-Talmudic sign (ink box)
    signBand: [2549, 2416, 2575, 2458], // its place in the line: the sign's width, the line's letter height (for its crop marks)
    gordon: [[1458, 3618, 2564, 3686], [1842, 3693, 2700, 3765]], // Gordon's note, quoted
  },
  // Cmd. 1785, p. 8, cut to Article 22 (tools/docs.py)
  mandate: {
    line1: [120, 230, 1778, 294], // English, Arabic and Hebrew shall be the official languages of
    line2: [120, 296, 364, 358], // Palestine.
  },
  poster: {
    topic: [120, 990, 1600, 1620], // השפה העברית־ שפת הלמוד בבתי הספר העבריים בא״י.
  },
};
