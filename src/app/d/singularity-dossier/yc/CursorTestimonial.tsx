/** The Cursor quote, its theme-token classes re-inked on the sheet. */
export default function CursorTestimonial() {
  return (
    <div className='yc-quote mx-auto max-w-[600px] text-center'>
      <p
        className='yc-quote-text text-lg leading-relaxed italic sm:text-xl'
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
        <img
          src='https://github.com/leerob.png'
          alt='Lee Robinson'
          width={40}
          height={40}
          className='size-10 rounded-full'
        />
        <div className='text-left text-sm'>
          <p className='yc-quote-name font-medium'>Lee Robinson</p>
          <p className='yc-quote-role'>VP of Developer Experience, Cursor</p>
        </div>
      </a>
    </div>
  );
}
