'use client';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode } from '@/lib/shell-data';

import '../graphics/graphics.css';
import './raise.css';

const TITLE = PAGE_NAMES.raise.name;
const MODES: readonly ShellMode[] = ['book'];

/** /raise when the Blob store cannot be read: the shell and the head, and one line that says so. */
export default function StoreMissing({ updated }: { updated: PageUpdated }) {
  return (
    <ViewerShell id='raise' title={TITLE} mark='pt' count='0 finals' sections={[]} modes={MODES} thumb='row' surfaces='site' keys='flow' noun='piece'>
      <Sheet variant='flow'>
        <div className='gx-book ra-book pt-book-col'>
          <BookHead
            title={TITLE}
            lead='The media of the General Translation funding announcement could not be read from the store.'
            updated={updated}
            facts={[
              { icon: 'done', key: 'Finals', value: 'None' },
              { icon: 'queue-list', key: 'Rounds', value: 'None' },
              { icon: 'duration', key: 'Dates', value: 'None' },
            ]}
          />
        </div>
      </Sheet>
    </ViewerShell>
  );
}
