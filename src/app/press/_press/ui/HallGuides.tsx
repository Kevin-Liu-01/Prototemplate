/* The magazine's front page drawn over a layout sheet, as a designer's
   pasteboard shows it: twelve column guides between the margins and the
   margins themselves (the horizon the magazines stand on is the shelf's
   own, in rack.css), and faint behind the rack Euclid's
   first construction (two circles through each other's centres and the
   triangle they give). Decoration only: it takes no pointer and no reader
   hears it (rack.css, .gtp-guides). */
export default function HallGuides() {
  return (
    <div className='gtp-guides' aria-hidden='true'>
      <i className='gtp-guides-cols' />
      <i className='gtp-guides-rows' />
      <svg className='gtp-guides-figure' viewBox='-150 -110 300 220'>
        <circle cx='-40' cy='0' r='80' />
        <circle cx='40' cy='0' r='80' />
        <path d='M-40 0 L40 0 L0 -69.28 Z' />
      </svg>
    </div>
  );
}
