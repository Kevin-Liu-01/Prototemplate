/* A book's title as it is printed on its cover and spine: English titles
   in title case, with the short words lowercase inside the title; other
   languages keep their own capitalization. */

const SMALL = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'nor',
  'for',
  'as',
  'at',
  'by',
  'in',
  'into',
  'of',
  'on',
  'onto',
  'to',
  'via',
  'with',
  'from',
]);

function capital(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** 'Fuma Nama: The philosophy of an open-sourcerer' -> 'Fuma Nama: The Philosophy of an Open-Sourcerer' */
export function bookTitle(title: string, lang: string): string {
  if (lang !== 'en') return title;
  const words = title.split(' ');
  return words
    .map((word, i) => {
      // the first word, the last, and the first after a colon always take a capital
      const opens =
        i === 0 || i === words.length - 1 || /[:：]$/.test(words[i - 1] ?? '');
      if (!opens && SMALL.has(word.toLowerCase())) return word.toLowerCase();
      return word.split('-').map(capital).join('-');
    })
    .join(' ');
}
