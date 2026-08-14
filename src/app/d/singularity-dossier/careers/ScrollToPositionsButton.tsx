'use client';

/** The hero's primary ask — scrolls the ledger into view. The live
    page's analytics capture is dropped for the prototype. */
export default function ScrollToPositionsButton() {
  return (
    <button
      type='button'
      className='tc-btn careers-primary-cta'
      onClick={() => {
        document
          .getElementById('positions')
          ?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      Explore open roles
    </button>
  );
}
