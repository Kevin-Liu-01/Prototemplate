/*
 * jihe-yuanben: what the film reads, measured on the scans (the page lane's
 * measurements, with the film's additions marked "film").
 *
 * Every number is a native pixel of the scan named by `src` (measured with
 * tools/grid.py, tools/fitellipse.py). Columns: x is the column's centre,
 * half its half width, chars the [top, bottom] of each printed character in
 * reading order. Citations follow assets/SOURCES-zh.md and SOURCES-west.md,
 * and BRIEF.md's image notes ("early 17th-century printing", "Qing edition").
 */
window.JYDATA = (function () {
  const LOC = '<i>Jihe yuanben</i> <span class="han">幾何原本</span> · early 17th-century printing · Library of Congress / National Library of China (World Digital Library)';
  const SIKU = '<span class="han">九章算術</span> <i>Nine Chapters on the Mathematical Art</i>, compiled by the 1st century CE · Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0';
  return {
    pages: {
      // Jihe yuanben, vol. 1, sp=8: end of Ricci's preface (right), first text page of 卷一 (left).
      p008: { src: 'assets/zh/pages/loc-wdl17216-v1-p008-full.jpg', w: 3435, h: 3070, cite: LOC, clip: 'inset(89px 90px 90px 88px)' },
      // vol. 1, sp=7: Ricci's preface 譯幾何原本引 (齟齬 on the right half; 口傳 / 筆受 and 凡三易稿 on the left).
      p007: {
        src: 'assets/zh/pages/loc-wdl17216-v1-p007-full.jpg', w: 3454, h: 3099, clip: 'inset(88px 90px 90px 96px)',
        cite: 'Ricci’s preface <span class="han">譯幾何原本引</span> · <i>Jihe yuanben</i>, early 17th-century printing · Library of Congress / National Library of China (World Digital Library)',
      },
      // vol. 1, sp=23: 幾何原本第一卷, credits, Prop. I.1 with its figure (left half).
      p023: { src: 'assets/zh/pages/loc-wdl17216-v1-p023-full.jpg', w: 3483, h: 3093, cite: LOC, clip: 'inset(88px 90px 90px 93px)' },
      kircher: {
        src: 'assets/west/kircher-plate-villanova-full.jpg', w: 4395, h: 6223,
        cite: 'Athanasius Kircher, <i>La Chine illustrée</i>, Amsterdam, 1670, plate facing p. 201 · Villanova University, Falvey Library',
      },
      siku19: { src: 'assets/zh/pages/sl-ninechapters-siku-v1-3-p019-full.jpg', w: 2363, h: 3164, cite: SIKU },
      siku132: {
        src: 'assets/zh/pages/sl-ninechapters-siku-v7-9-p132-full.jpg', w: 3472, h: 4315,
        cite: '<span class="han">句股容圓圖</span>, figure supplied by the Qing editors · <i>Nine Chapters</i>, Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0',
      },
      clav91p20: {
        src: 'assets/west/clavius1591-eth-p020.jpg', w: 2495, h: 3899, clip: 'inset(168px 60px 0 158px)',
        cite: 'Christoph Clavius, <i>Euclidis Elementorum libri XV</i>, 3rd ed., Cologne, 1591, p. 20 · ETH-Bibliothek Zürich, e-rara, Public Domain Mark',
      },
      clav74title: {
        src: 'assets/west/clavius1574-leaf004-title-page.png', w: 2300, h: 2956,
        cite: 'Christoph Clavius, <i>Euclidis Elementorum libri XV</i>, Rome: Vincenzo Accolti, 1574, title page · Boston College Library, via Internet Archive',
      },
      clav74f1: {
        src: 'assets/west/clavius1574-leaf084-fol1r-book1-definitiones.png', w: 2246, h: 3008,
        cite: 'Christoph Clavius, <i>Euclidis Elementorum libri XV</i>, Rome: Vincenzo Accolti, 1574, fol. 1r · Boston College Library, via Internet Archive',
      },
      clav74f21v: {
        src: 'assets/west/clavius1574-leaf125-fol21v-prop1.png', w: 2178, h: 3060,
        cite: 'Christoph Clavius, <i>Euclidis Elementorum libri XV</i>, Rome: Vincenzo Accolti, 1574, fol. 21v · Boston College Library, via Internet Archive',
      },
    },

    // p008, the first text page of 卷一, read right to left.
    p008: {
      title: { x: 1603, half: 58, chars: [[410, 500], [510, 600], [620, 720], [730, 840], [860, 960], [995, 1025], [1060, 1160], [1165, 1262], [1290, 1400]] }, // 幾何原本第一卷之首
      small: { jieshuo: { x: 1642, y0: 1440, y1: 1890 }, gonglun: { x: 1572, y0: 1440, y1: 1830 }, qiuzuo: { x: 1625, y0: 2115, y1: 2385 } },
      ricci: { x: 1446, half: 56, chars: [[1310, 1410], [1510, 1610], [1740, 1840], [1960, 2060], [2160, 2290], [2410, 2480], [2620, 2730]] }, // 泰西利瑪竇口譯
      xu: { x: 1286, half: 56, chars: [[1310, 1410], [1520, 1610], [1740, 1840], [1960, 2050], [2170, 2280], [2390, 2500], [2620, 2720]] }, // 吳淞徐光啓筆受
      jsHead: { x: 1155, half: 56, chars: [[625, 745], [752, 873], [898, 965], [965, 1063], [1086, 1177], [1196, 1291]] }, // 界說三十六則
      note: {
        x: 1002, half: 56,
        chars: [[520, 600], [610, 700], [710, 800], [810, 910], [920, 1010], [1020, 1110], [1120, 1240], [1250, 1350], [1360, 1470], [1480, 1580],
          [1590, 1690], [1700, 1790], [1800, 1900], [1910, 2010], [2020, 2120], [2130, 2240], [2260, 2350], [2380, 2470], [2480, 2590]],
      }, // 凡造論先當分別解說論中所用名目故曰界說
      noteSlip: { x0: 932, x1: 1063, y0: 492, y1: 2628 },
      fu: { x: 684, half: 55, chars: [[640, 730], [740, 830], [840, 940], [945, 1055], [1062, 1140], [1150, 1250], [1260, 1350], [1360, 1460], [1470, 1580]] }, // 依賴十府中幾何府屬
      di1: { x: 370, half: 45, chars: [[520, 600], [650, 675], [735, 830]] }, // 第一界
      dian: { x: 203, half: 45, chars: [[400, 490], [505, 590], [610, 700], [715, 820]] }, // 點者無分
      spread: { x0: 40, y0: 40, x1: 3395, y1: 3030 },
    },

    // vol. 1, sp=7, right half: Ricci's preface, 作輟三進三止嗚呼此游藝之學言象之粗而齟齬若是.
    p007: {
      juyu: { x: 2590, half: 55, chars: [[1900, 1990], [1995, 2090], [2135, 2205], [2235, 2330], [2350, 2430], [2440, 2530], [2540, 2630], [2640, 2730], [2750, 2840]] }, // 言象之粗而齟齬若是
    },

    // Nine Chapters, Siku Quanshu text, vol. 1-3 p. 19.
    siku19: {
      problem: { x: 1108, half: 58, chars: [[335, 400], [450, 550], [580, 660], [690, 800], [840, 920], [960, 1040], [1060, 1150], [1180, 1280], [1310, 1400], [1420, 1500], [1550, 1640], [1680, 1780], [1800, 1880], [1920, 2000], [2020, 2130], [2150, 2230], [2250, 2340], [2370, 2460], [2490, 2530], [2580, 2680]] }, // 今有田廣十五步從十六步問為田幾何答曰一畝
      // film (v2): the second problem, 又有田廣十二步從十四步問為田幾何, one column left;
      // its 幾何 measured on the scan (幾 2004 to 2129, 何 2156 to 2240, ink centre x 890)
      problem2: { x: 890, half: 58, ji: [2004, 2129], he: [2156, 2240], jh: [890, 2122] },
      shu: { x: 468, half: 58, chars: [[350, 420], [470, 560], [590, 680], [720, 790], [820, 920], [950, 1030], [1070, 1150], [1190, 1280], [1310, 1400], [1430, 1520], [1560, 1640], [1660, 1760], [1790, 1880]] }, // 方田術曰廣從步數相乘得積步
    },

    // 句股容圓圖 (vol. 7-9 p. 132): a right triangle on a 6 by 8 grid with its inscribed circle.
    siku132: {
      T: [1180, 797], BL: [1180, 2405], R: [2487, 2405],
      O: [1608, 2021], Lt: [1180, 2021], Bt: [1610, 2405], Ht: [1966, 1772],
      circle: { x: 1610, y: 2008, rx: 412, ry: 398 },
      labels: { zhu: [1475, 1380], qing: [1955, 2050], huang: [1525, 2150] },
    },

    // Clavius 1591, p. 20: superscript letters in the proof and their margin references.
    clav91p20: {
      refs: [
        { k: 'a', sup: [2140, 391], margin: [452, 405], mw: [388, 522] },
        { k: 'b', sup: [1421, 566], margin: [462, 601], mw: [400, 528] },
        { k: 'c', sup: [1449, 617], margin: [484, 652], mw: [400, 568] },
        { k: 'd', sup: [2237, 793], margin: [482, 848], mw: [400, 563] },
        { k: 'e', sup: [1529, 931], margin: [484, 958], mw: [400, 566] },
      ],
      figure: { cx: 860, cy: 625 },
    },

    // Clavius 1574 fol. 1r: the heading DEFINITIONES.
    clav74f1: { definitiones: { x0: 118, x1: 1122, y0: 822, y1: 896 } },


    // film: Clavius 1574 title page, the two lines the brush marks (k03's measurements).
    clav74title: { name: { x0: 530, y0: 2216, x1: 1244, y1: 2212 }, title: { x0: 500, y0: 1405, x1: 1292, y1: 1403 } },

    // film: Clavius 1591 p. 20, the top of the text block (the running head
    // EVCLIDIS GEOMETRIÆ sits above it, at y 320 to 362, and is framed out).
    clav91top: { head: [320, 362], text: 380 },

    // film: Clavius 1574 fol. 21v figure, lifted as ink (tools/derive.py): the box
    // and the four letters' boxes, from lib/derived/clav74-fig.json.
    clav74fig: {
      box: [940, 1946, 1288, 2230],
      letters: { A: [1029, 2054, 1066, 2099], B: [1187, 2064, 1222, 2107], C: [1120, 1949, 1158, 1988], D: [1096, 2180, 1138, 2217] },
    },

    // film: Kircher's plate, the two faces (SOURCES-west crop boxes).
    kircher: { ricci: [1700, 2280], xu: [3323, 2250] },

    // Prop. I.1: the printed construction in both books (fitted ellipses).
    prop1: {
      latin: {
        A: [1072.9, 2079.3], B: [1175.0, 2091.2], C: [1134.7, 1998.5], D: [1114.8, 2172.4],
        cA: { x: 1072.9, y: 2079.3, rx: 100.8, ry: 102.3 }, cB: { x: 1175.0, y: 2091.2, rx: 101.0, ry: 101.1 },
      },
      han: {
        A: [655.7, 683.8], B: [769.0, 682.9], C: [709.4, 591.6], D: [711.0, 775.1],
        cA: { x: 655.7, y: 683.8, rx: 109.7, ry: 105.7 }, cB: { x: 769.0, y: 682.9, rx: 110.4, ry: 108.4 },
        labels: { A: [628, 691], B: [791, 689], C: [708, 566], D: [713, 808] }, // 甲 乙 丙 丁
        fa: { x: 866, chars: { jia: [1085, 1160], yi: [1180, 1265] } }, // 法曰甲乙直線上
      },
      // Clavius 1574 fol. 21v: the same construction, A B C D (the edition Ricci carried).
      latin74: {
        A: [1072.9, 2079.3], B: [1175.0, 2091.2], C: [1134.7, 1998.5], D: [1114.8, 2172.4],
        ink: { src: 'lib/derived/clavius1574-f21v-prop1-ink.png', x0: 940, y0: 1946, w: 348, h: 284 },
      },
    },
  };
})();
