import FretBand from './FretBand';

/**
 * Ornament home: the dark band. The facade of the Hall of Columns at Mitla
 * is three stacked panels of stepped frets, each panel a different fret at
 * a different scale, separated by plain limestone courses. This is that
 * facade inverted: cream frets on black stone, the opposed frets at the
 * field scale, the stepped diamonds at the band scale, the stepped chevron
 * at the fine scale, with a plain cream course one band cell thick between
 * each pair. The courses own themselves; the bands draw no rules here.
 */
export default function Facade() {
  return (
    <div className='sf-facade' aria-hidden='true'>
      <FretBand fret='opposed' scale='field' tone='paper' edges='none' />
      <div className='sf-course' />
      <FretBand fret='lozenge' scale='band' tone='paper' edges='none' />
      <div className='sf-course' />
      <FretBand fret='zigzag' scale='fine' tone='paper' edges='none' />
    </div>
  );
}
