import { MarksPlate } from './lazy';
import { markEntries } from './mark-entries';

/**
 * The marks picker's server half: it reads every speed mark, picture mark
 * and globe concept from public/marks at build time (markEntries) and hands
 * the files to the client plate, so the page ships the marks inline in
 * currentColor and fetches nothing.
 */
export default function MarksDemo() {
  return <MarksPlate entries={markEntries()} />;
}
