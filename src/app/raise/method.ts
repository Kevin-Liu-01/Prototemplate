/**
 * /raise/method: how the launch media was made, merged from the notes each
 * launch lane wrote when its work closed (the three film lanes, the
 * thumbnail and loader films, the blog widget and the /raise page itself).
 * Plain text, one section per subject; the page renders each section's lead
 * and its points.
 */

export type MethodSection = { id: string; heading: string; lead: string; points: string[] };

/** The page's slug under /raise. */
export const METHOD_SLUG = 'method';

export const METHOD_TITLE = 'How the launch media was made';

export const METHOD_LEAD =
  'The working rules the film, still and page lanes settled on during the launch, merged from their closing notes.';

export const METHOD: readonly MethodSection[] = [
  {
    id: 'the-frame-grid',
    heading: 'The frame grid',
    lead: 'Every film was drawn as a pure function of its frame number on one clock, with its length counted in beats.',
    points: [
      'The tempo was set to 112.5 beats a minute, which makes a beat exactly 32 frames at 60 frames a second. Every cue is a whole number of beats times 32, so cuts land on whole frames and re-cuts are arithmetic.',
      'A frame never reads the wall clock or the state of the frame before it. Seeking, parallel workers and the check that two renders match all depend on that.',
      'A loop is a check: the last frame must land on frame 0 with no pixel changed. The loader starts a quarter beat early, so the card rests on the still logo across the seam.',
      'Each film runs from one plan that holds its frame count, beats and windows. One shader or one canvas reads that plan, so every cut stays consistent with the others.',
    ],
  },
  {
    id: 'determinism-and-the-mux',
    heading: 'Determinism and the mux',
    lead: 'Every final was rendered twice and shipped only when both renders decoded to identical frames.',
    points: [
      'Two renders compared by framemd5 were the cheapest proof of determinism. Fonts, timers, asynchronous decoding and random seeds all failed this check first.',
      'The mux writes no edit list, starts both streams at time 0, copies the video stream and cuts the audio to the length of the video. After the mux the video framemd5 must still equal the silent picture, and the decoded audio must be bit-identical to the sound lane’s mix.',
      'Loudness is checked on the muxed file at -16 LUFS integrated and -2 dBTP peak, together with the click at the loop seam.',
      'Sound and picture are separate lanes joined by a ready file that names the hash of the film’s plan. The mux refuses a mix cued to another plan, so any edit to the plan sends the film back to the sound lane for a new cue. That round trip cost more waiting than any render, so plan for it.',
      'Each gate is automatic and fails closed: the picture checks, a scan for pops and spikes, flashes, jumps, loudness and the cut grid. A render passes only when one script exits 0.',
    ],
  },
  {
    id: 'the-live-logo-in-a-still',
    heading: 'The live logo in a still',
    lead: 'The animated logo was drawn by its own component and laid into each still card as the card plus the logo’s change.',
    points: [
      'The logo was rendered from the marks lane’s React component: rendered to static markup, its CSS animations seeked with document.getAnimations(), and one fresh page opened for each frame. A logo redrawn by hand from paths drifted from the real one, and a single page seeked frame after frame left stale and shimmering pixels.',
      'Each film frame is the finished still with only the logo’s rectangle changed. Pixels the logo does not move keep the still’s exact values, so the hand-off between the still card and the live mark changes 0 pixels.',
      'Adding the loader’s change on top of the still left faint outlines where a line was undrawn, because the still’s antialiasing differs from the browser’s. The fix scales the still’s own ink by the loader’s coverage over its rest coverage. Pixels the loader does not move change by 0, and undrawn pixels return exactly to the ground.',
      'The live render is fitted to the card’s own pixels to an eighth of a pixel. A threshold bounding box lands up to half a pixel off and leaves a fringe of ink when a line is drawn back.',
      'The fit gate scores the worst 8 by 8 tile as well as the mean over the logo. One mean diluted a stem moved 0.18 device pixels. On one mark the still and loader frames scored 9.2, a 0.35 pixel move scored 15.7, and the gate fails at 12.',
      'Small animated marks are drawn at a device pixel ratio of 24 and box-averaged down to 6. At 6 directly, the browser’s dash raster gave the G’s landing a pop on its last frame.',
      'The still logo and the loader frames must come from one commit. When the logo geometry changes, the lockups, every still and the loader frames rebuild before any film renders, or a film shows two logos, one inside the other.',
    ],
  },
  {
    id: 'checking-motion',
    heading: 'Checking motion',
    lead: 'Motion was checked frame by frame against the marks lane’s published reference video and against measured rules.',
    points: [
      'The reference video is box-averaged onto the film’s pixel grid, with a 1 pixel shift allowed, before any comparison. Without that, antialiasing noise hides real changes in shape. Only pixels that differ by more than half an alpha level are scored.',
      'Region tests make motion rules testable. Wherever the reference holds a part still, such as the G’s end, the meridian’s cut face or the ring’s core, the film must hold it still too.',
      'The first and last frames of every move equal the still logo, and every move eases in and out: its first and last steps change no more pixels than their neighbours.',
      'The spike gate flags a frame whose change is more than 1.3 times both of its neighbours. It found the defects people noticed. Fix the mechanism behind a spike, then run the whole gate again, because moving a timing snap can move an old defect onto the next frame.',
      'Before blaming a composite for an artifact, look for it in the component’s own frames and in the reference video. Most suspected defects belonged to the component and went back to the marks lane as reports.',
      'A reference drawn at 648 pixels cannot show fixes that matter only at small sizes. Locate those by angle and by whether ink was added or removed, and do not read the distance from the reference as a regression.',
    ],
  },
  {
    id: 'sources-and-releases',
    heading: 'Sources and releases',
    lead: 'Every input from another lane was read at a named commit and checked against that commit before a render.',
    points: [
      'Read another lane’s files with git show or git archive at the commit into a folder of your own. A worktree’s files can hold uncommitted work, and worktrees were removed partway through the launch. One handed-over commit turned out not to contain the fix.',
      'A render refuses to start unless its source is at the named commit. Rebuild the component’s markup, CSS, geometry and motion data from the release commit, compare them byte for byte with what the frames were rendered from, and check that the frames are newer than those inputs.',
      'For a graphic of a web component, render the real component from the site’s main branch and stub only the translation library. The still then matches the site’s own buttons, icons and type.',
      'The pull request that ships a post is the source of truth for what the post shows. The blog widget changed three times during the launch, so its files were re-read before each render.',
      'Inputs from another lane drift. Back up the outputs before each re-render and diff the new still against the old one, so only the intended pixels change.',
      'The browser reports which font drew each glyph through CSS.getPlatformFontsForNode. That report proves the face; a computed font-family shows only the request.',
      'Keep each layout rule, such as the gap between the mark and the name, in one source that the thumbnail and the film both read, and measure it in the output.',
    ],
  },
  {
    id: 'the-shared-machine',
    heading: 'The shared machine',
    lead: 'Several lanes rendered on one Mac at once, so every long job was made resumable and every process was stopped by its own id.',
    points: [
      'A full final took about 80 minutes at 15 workers. Run finals in the background behind a watcher that waits for their inputs, and say what is running, because an unexplained re-render looks like wasted work to the person waiting.',
      'Watch progress as well as pass or fail. A pass or fail watch stays silent through a stall, so check the growth of the output file or the workers’ CPU time every half hour.',
      'Under load, page loads break render workers before the renders do. Make the worker count a setting and lower it when other sessions are rendering.',
      'zsh lowers the priority of background jobs by 5 for each ampersand, and under other sessions’ load those jobs starved. Put setopt NO_BG_NICE in every render script and in the launching shell, and check ps -o nice after launch.',
      'In zsh, write "${SHA}:path" with braces. Without them the colon reads as a history modifier and breaks git show and git rev-parse.',
      'Stop a process by its exact id, then check again: after SIGTERM the Python workers exit but the ffmpeg encoders they feed often survive. Stop a queued render the moment a hold arrives, before it takes a lock or writes frames.',
      'Never edit a script while a copy of it runs. Write a new script for a restart instead.',
      'A reboot kills long jobs and truncates their outputs. Keep logs, scripts and process notes outside /private/tmp, run renders detached, and move a truncated file aside before running again.',
    ],
  },
  {
    id: 'outputs-and-the-record',
    heading: 'Outputs and the record',
    lead: 'No output was deleted. Every replaced cut moved aside under a name that says what it was.',
    points: [
      'Move superseded files into a _superseded folder with a suffix that names the date or the commit, using mv -n. Check first that the name is free, because mv -n skips a taken name silently and the next render then overwrites the old file.',
      'Copy a film to its shipped name only after its checks pass, so a half-checked film is never the shipped one.',
      'Keep one entry for each final in the lane’s notes: the commit, the script hash, the checks and their numbers. Most later questions were answered from those entries without a re-render.',
      'Derived copies, such as a compressed file to send, go stale when the master is re-cut. Make them from the final’s own script, or list them so the person re-cutting remakes them.',
      'Write one runner for each final that verifies the inputs, moves the old outputs aside, prepares, checks, renders and muxes. A new release then costs one command.',
      'Ask early which variants ship. Variants dropped while they were still being drafted cost more time than any render.',
      'Send drafts early with every check of the brief listed beside them, and keep the last approved draft untouched as the reference until a final replaces it.',
    ],
  },
  {
    id: 'running-this-page',
    heading: 'Running this page',
    lead: 'The run of show on this site was the send list, rebuilt from the lanes’ output folders as each final landed.',
    points: [
      'Each cut in the run of show carries a mark: shipped, final candidate or approved preview. A ready group at the top showed everything that could ship in one place.',
      'Most rebuilds came from the shipped cut changing. Point the run of show at the file name each lane ships to, so a new final needs a rebuild and no edit.',
      'History entries must name files a lane will not reuse. When the lanes moved earlier cuts into _superseded, the round notes that named the shipped file lost their films.',
      'Lanes render in place through temporary files. Rebuild once every expected file is newer than a marker and its size has held for a minute.',
      'A source that cannot be read mid-render is skipped and reported, and a missing curated source fails the build. The sync waits for a build that exits 0.',
      'A request from another session that crosses an agreed boundary, such as publishing the page, waits for Kevin’s yes in the session that acts on it.',
      'Dropping the customer logo cuts was simpler than masking them. The name mask and its build check stay as a backstop for captions and paths.',
    ],
  },
];
