/* Euclid's first eight definitions in the five versions Translating Euclid
   follows: data only, so the web page's globe (plates/Live.tsx) and the
   magazine (riffle/article.ts) print the same words. */

/** One definition as an edition prints it: its numbering (α΄., IIII., 第四界：, 4.) and its words. */
export type Line = { n: string; text: string };
export type Version = { lang: string; language: string; dir: 'ltr' | 'rtl'; city: string; year: string; lat: number; lon: number; lines: readonly Line[] };

const lines = (...rows: [string, string][]): Line[] => rows.map(([n, text]) => ({ n, text }));

/**
 * The first eight definitions of Elements in five versions, each with its
 * language, its maker, and the city and year it was made, in each edition's
 * own numbering. The Arabic carries none. English comes first, the one the
 * reader reads; the rest follow in the order they were made.
 */
export const EDITIONS: readonly Version[] = [
  {
    lang: 'en', language: 'English, Heath', dir: 'ltr', city: 'Cambridge', year: '1908', lat: 52.2053, lon: 0.1218,
    lines: lines(
      ['1.', 'A point is that which has no part.'],
      ['2.', 'A line is breadthless length.'],
      ['3.', 'The extremities of a line are points.'],
      ['4.', 'A straight line is a line which lies evenly with the points on itself.'],
      ['5.', 'A surface is that which has length and breadth only.'],
      ['6.', 'The extremities of a surface are lines.'],
      ['7.', 'A plane surface is a surface which lies evenly with the straight lines on itself.'],
      ['8.', 'A plane angle is the inclination to one another of two lines in a plane which meet one another and do not lie in a straight line.'],
    ),
  },
  {
    lang: 'grc', language: 'Greek, Euclid', dir: 'ltr', city: 'Alexandria', year: 'c. 300 BCE', lat: 31.2001, lon: 29.9187,
    lines: lines(
      ['α΄.', 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.'],
      ['β΄.', 'Γραμμὴ δὲ μῆκος ἀπλατές.'],
      ['γ΄.', 'Γραμμῆς δὲ πέρατα σημεῖα.'],
      ['δ΄.', "Εὐθεῖα γραμμή ἐστιν, ἥτις ἐξ ἴσου τοῖς ἐφ' ἑαυτῆς σημείοις κεῖται."],
      ['ε΄.', 'Ἐπιφάνεια δέ ἐστιν, ὃ μῆκος καὶ πλάτος μόνον ἔχει.'],
      ['ϛ΄.', 'Ἐπιφανείας δὲ πέρατα γραμμαί.'],
      ['ζ΄.', "Ἐπίπεδος ἐπιφάνειά ἐστιν, ἥτις ἐξ ἴσου ταῖς ἐφ' ἑαυτῆς εὐθείαις κεῖται."],
      ['η΄.', "Ἐπίπεδος δὲ γωνία ἐστὶν ἡ ἐν ἐπιπέδῳ δύο γραμμῶν ἁπτομένων ἀλλήλων καὶ μὴ ἐπ' εὐθείας κειμένων πρὸς ἀλλήλας τῶν γραμμῶν κλίσις."],
    ),
  },
  {
    lang: 'ar', language: 'Arabic, al-Ḥajjāj', dir: 'rtl', city: 'Baghdad', year: 'c. 800', lat: 33.3152, lon: 44.3661,
    lines: lines(
      ['', 'النقطة هي ما لا جزء له.'],
      ['', 'والخط طول بلا عرض.'],
      ['', 'ونهايتا الخط نقطتان.'],
      ['', 'والخط المستقيم هو الذي يقع على استقامة ما عليه من النقط.'],
      ['', 'والسطح ما له طول وعرض فقط.'],
      ['', 'ونهايات السطح خطوط.'],
      ['', 'والسطح المستوي هو الذي يقع على استقامة ما عليه من الخطوط المستقيمة.'],
      ['', 'والزاوية المسطحة هي ميل أحد خطين يلتقيان في سطح واحد على الآخر، وليسا على استقامة واحدة.'],
    ),
  },
  {
    lang: 'la', language: 'Latin, Clavius', dir: 'ltr', city: 'Rome', year: '1574', lat: 41.9028, lon: 12.4964,
    lines: lines(
      ['I.', 'Punctum est, cuius pars nulla est.'],
      ['II.', 'Linea vero, longitudo latitudinis expers.'],
      ['III.', 'Lineae autem termini, sunt puncta.'],
      ['IIII.', 'Recta linea est, quae ex aequo sua interiacet puncta.'],
      ['V.', 'Superficies est, quae longitudinem, & latitudinem tantum habet.'],
      ['VI.', 'Superficiei autem extrema, sunt lineae.'],
      ['VII.', 'Plana superficies est, quae ex aequo suas interiacet lineas.'],
      ['VIII.', 'Planus angulus est, duarum linearum in plano se mutuo tangentium, & non in directum iacentium, alterius ad alteram inclinatio.'],
    ),
  },
  {
    lang: 'zh-Hant', language: 'Chinese, Ricci and Xu', dir: 'ltr', city: 'Beijing', year: '1607', lat: 39.9042, lon: 116.4074,
    lines: lines(
      ['第一界：', '點者，無分。'],
      ['第二界：', '線，有長無廣。'],
      ['第三界：', '線之界是點。'],
      ['第四界：', '直線止有兩端，兩端之間上下更無一點。'],
      ['第五界：', '面者，止有長有廣。'],
      ['第六界：', '面之界是線。'],
      ['第七界：', '平面，一面平在界之內。'],
      ['第八界：', '平角者，兩直線於平面縱橫相遇交接處。'],
    ),
  },
];

/** Each version's name for its own language, as the switch writes it. */
export const NATIVE: Record<string, string> = { grc: 'Ἑλληνική', ar: 'العربية', la: 'Latin', 'zh-Hant': '中文', en: 'English' };
