import StorySection from '@/components/shared/StorySection';

/**
 * Acts II + III — the shared nine-beat story, skinned for the graphite sheet.
 *
 * `field` is on. The shared timeline only raises it through beats 8 and 9, when
 * the window has already become the dark editor, so it reads as the merge
 * moment's flare behind the diff rather than a wash over the paper sheet — and
 * a mask in styles.css holds it to a low band clear of the code plate's type.
 *
 * The scrub length is tuned against this page's own height so that every
 * sampled scroll depth lands on a settled beat rather than on a dissolve, the
 * climax — diff in, cursor on "Open PR" — included.
 */
export default function Story() {
  return (
    <StorySection
      className='ba-story'
      id='story'
      heading='How it works'
      subheading='Scroll to drive the machine: one page, translated in place, then shipped by an agent.'
      sliderMode='slide'
      navSelector='[data-ba-nav]'
      scrollLength={{ desktop: 7050, mobile: 4400 }}
    />
  );
}
