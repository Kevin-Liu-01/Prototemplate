/**
 * THE SHIPPED /yc STATEMENT, reproduced.
 *
 * 1-1 with apps/landing/src/components/landing/shared/CursorTestimonial.tsx
 * as the `yc-testimonial` section mounts it: one quote, its attribution, and
 * the LinkedIn post it comes from. The words, the name, the title and the
 * source URL are the real component's; the portrait is the same
 * github.com/leerob.png the real page loads.
 */
export default function YcTestimonial() {
  return (
    <section className='tc-sec yc-testimonial'>
      <div className='mx-auto max-w-[600px] text-center'>
        <p
          className='text-foreground text-lg leading-relaxed italic sm:text-xl'
          style={{ textWrap: 'pretty' }}
        >
          Kudos to General Translation for helping with the localization efforts
          (great team)
        </p>
        <a
          href='https://www.linkedin.com/posts/leeerob_just-shipped-new-docs-for-cursor-been-hacking-activity-7374285675900297216-veY1/'
          target='_blank'
          rel='noopener noreferrer'
          className='mt-8 inline-flex items-center gap-3 transition-opacity hover:opacity-80'
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the real
              component ships a plain img for this one remote avatar too */}
          <img
            src='https://github.com/leerob.png'
            alt='Lee Robinson'
            width={40}
            height={40}
            className='size-10 rounded-full'
          />
          <div className='text-left text-sm'>
            <p className='text-foreground font-medium'>Lee Robinson</p>
            <p className='text-muted-foreground'>
              VP of Developer Experience, Cursor
            </p>
          </div>
        </a>
      </div>
    </section>
  );
}
