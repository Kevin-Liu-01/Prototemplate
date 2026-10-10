#!/usr/bin/env node
// Drafts Kevin's PR slate: every open PR he authored in gt-cloud, gt and
// content, sorted into the groups the slate uses, with the full link, the
// purpose (the title without its type), the line counts and the facts that
// put it in its group. It reads through the GitHub CLI and changes nothing.
//
//   node pr-slate.mjs                 grouped Markdown for the chat
//   node pr-slate.mjs --slack         lowercase plain text in a code fence
//   node pr-slate.mjs --author <login> --repos owner/a,owner/b --stale-days 14
//
// Needs `gh` logged in with read access to the repositories. The list call
// asks GitHub's GraphQL API for every PR's checks at once, which sometimes
// times out with a 502 or 504; the script retries it twice.
//
// The groups are mechanical. The script cannot tell which merged PR replaced
// an open one, whether a red check is a flake, or what order unrelated PRs
// should merge in; the agent adds those before Kevin sees the slate
// (SKILL.md, "The PR slate").
//
// Exit code: 0 after printing the slate, 2 on a usage or gh error.
//
// Requires: Node 20 or later and the GitHub CLI (gh) signed in.
// Last real run: none (kept for: every "give me my PR list" or "PR slate"
// ask; its seven runs on 2026-10-06 were authoring runs).
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const VALUED = new Set(['--author', '--repos', '--stale-days']);
for (let i = 0; i < args.length; i += 1) {
  if (VALUED.has(args[i]) && args[i + 1]) i += 1;
  else if (args[i] !== '--slack') {
    console.error('usage: node pr-slate.mjs [--slack] [--author <login>] [--repos owner/a,owner/b] [--stale-days N]');
    process.exit(2);
  }
}
const opt = (flag, fallback) => {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : fallback;
};
const slack = args.includes('--slack');
const author = opt('--author', '@me');
const repos = opt('--repos', 'generaltranslation/gt-cloud,generaltranslation/gt,generaltranslation/content').split(',');
const staleDays = Number(opt('--stale-days', '14'));
const LIMIT = 100;

const gh = (...ghArgs) => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return execFileSync('gh', ghArgs, { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      const message = String(error.stderr || error.message).trim();
      if (attempt < 3 && /HTTP 50[234]|unexpected end of JSON/.test(message)) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000 * attempt);
        continue;
      }
      console.error(message);
      process.exit(2);
    }
  }
};

const FIELDS =
  'number,title,url,isDraft,mergeStateStatus,reviewDecision,baseRefName,headRefName,additions,deletions,createdAt,updatedAt,statusCheckRollup';
// gt-cloud's ruleset requires these three; elsewhere they are reported only.
const REQUIRED = ['Validate PR title and Linear issue', 'check-planning-files', 'run-tests'];
const GREEN = new Set(['SUCCESS', 'SKIPPED', 'NEUTRAL']);
const PENDING = new Set(['PENDING', 'QUEUED', 'IN_PROGRESS', 'WAITING', 'EXPECTED', 'REQUESTED']);
// mergeStateStatus values GitHub merges without a further step.
const MERGEABLE = new Set(['CLEAN', 'UNSTABLE', 'HAS_HOOKS']);
const DAY = 24 * 60 * 60 * 1000;
const today = new Date().toLocaleDateString('en-CA');

/** The latest run of each check that was not cancelled stands for it, as in gt-ship's pr-bots.mjs. */
function standingChecks(rollup) {
  const runs = new Map();
  for (const c of rollup || []) {
    const name = c.name || c.context;
    const state = (c.conclusion || c.state || c.status || '').toUpperCase();
    if (!runs.has(name)) runs.set(name, []);
    runs.get(name).push({ name, state, at: c.startedAt || c.completedAt || '' });
  }
  return [...runs.values()].map((list) => {
    list.sort((a, b) => b.at.localeCompare(a.at));
    return list.find((r) => r.state !== 'CANCELLED') ?? list[0];
  });
}

const prs = [];
for (const repo of repos) {
  const list = JSON.parse(
    gh('pr', 'list', '-R', repo, '--author', author, '--state', 'open', '--limit', String(LIMIT), '--json', FIELDS),
  );
  if (list.length === LIMIT) console.error(`${repo}: only the first ${LIMIT} open PRs were read`);
  for (const pr of list) prs.push({ ...pr, repo, short: repo.split('/')[1] });
}

// A PR whose base is another open PR's head branch is stacked on it.
const byHead = new Map(prs.map((pr) => [`${pr.repo}:${pr.headRefName}`, pr]));
for (const pr of prs) pr.parent = byHead.get(`${pr.repo}:${pr.baseRefName}`);

for (const pr of prs) {
  const checks = standingChecks(pr.statusCheckRollup);
  const failing = checks.filter((c) => !GREEN.has(c.state) && !PENDING.has(c.state) && c.state !== '');
  const pending = checks.filter((c) => PENDING.has(c.state) || c.state === '');
  const titleCheck = checks.find((c) => c.name === REQUIRED[0]);
  const type = pr.title.match(/^(\w+)(\([^)]*\))?!?:\s/)?.[1];
  const ageDays = (Date.now() - Date.parse(pr.updatedAt)) / DAY;
  const notes = [];
  if (pr.parent) notes.push(`after #${pr.parent.number}`);
  if (pr.createdAt.slice(0, 10) === today) notes.push('new today');
  if (pr.mergeStateStatus === 'UNKNOWN') notes.push('merge state not computed yet');
  if (pending.length) notes.push(`${pending.length} checks running`);

  let group;
  if (pr.isDraft) group = 'draft';
  else if (ageDays > staleDays) group = 'stale';
  else if (pr.mergeStateStatus === 'DIRTY') group = 'conflicts';
  else if (
    pr.repo === 'generaltranslation/gt-cloud' &&
    ((titleCheck && !GREEN.has(titleCheck.state) && !PENDING.has(titleCheck.state)) || (type === 'feat' && !titleCheck))
  ) {
    group = 'linear';
    notes.push('feat title needs a Linear issue id');
  } else if (pr.reviewDecision === 'CHANGES_REQUESTED') group = 'changes';
  else if (failing.length) {
    group = 'work';
    notes.push(`failing: ${failing.map((c) => c.name).join(', ')}`);
  } else if (pr.reviewDecision === 'APPROVED' && MERGEABLE.has(pr.mergeStateStatus) && !pending.length && !pr.parent) {
    group = 'merge';
  } else {
    group = 'approval';
    if (pr.reviewDecision === 'APPROVED') notes.push(`approved, merge state ${pr.mergeStateStatus.toLowerCase()}`);
  }
  Object.assign(pr, { group, notes, purpose: pr.title.replace(/^\w+(\([^)]*\))?!?:\s*/, '') });
}

const GROUPS = [
  ['merge', 'Merge now', 'merge now'],
  ['approval', 'Green or running, waiting on an approval', 'needs an approval'],
  ['linear', 'Blocked on a Linear issue id', 'needs a linear id in the title'],
  ['work', 'Needs work: failing checks (read each log: flake or real)', 'needs work'],
  ['changes', 'Changes requested by a reviewer', 'changes requested'],
  ['conflicts', 'Conflicts with its base', 'conflicts, needs a rebase'],
  ['draft', 'Drafts, open on purpose', 'drafts'],
  ['stale', `Stale, not updated in ${staleDays} days (keep or close)`, 'stale'],
];

/** Parents before their stacked children, otherwise by repository in --repos order, then oldest first. */
function ordered(list) {
  const out = [];
  const seen = new Set();
  const visit = (pr) => {
    if (seen.has(pr)) return;
    if (pr.parent && list.includes(pr.parent)) visit(pr.parent);
    seen.add(pr);
    out.push(pr);
  };
  const rank = (pr) => repos.indexOf(pr.repo);
  [...list].sort((a, b) => rank(a) - rank(b) || a.number - b.number).forEach(visit);
  return out;
}

const size = (pr) => `+${pr.additions}/-${pr.deletions}`;
// The Slack version leaves out drafts and stale PRs and counts them instead,
// since Kevin pastes it to get the day's merges done.
const QUIET = new Set(['draft', 'stale']);
const lines = [];
for (const [id, heading, slackHeading] of GROUPS) {
  const list = ordered(prs.filter((pr) => pr.group === id));
  if (!list.length || (slack && QUIET.has(id))) continue;
  if (slack) {
    lines.push(`${slackHeading}:`);
    for (const pr of list) {
      const extra = pr.notes.length ? `, ${pr.notes.join(', ')}` : '';
      lines.push(`- ${pr.url} (${pr.purpose}${extra})`.toLowerCase());
    }
  } else {
    lines.push(`**${heading}**`);
    for (const pr of list) {
      const extra = pr.notes.length ? ` ${pr.notes.join('; ')}.` : '';
      lines.push(`- [${pr.short}#${pr.number}](${pr.url}) ${pr.purpose} (${size(pr)}).${extra}`);
    }
  }
  lines.push('');
}

if (slack) {
  const quiet = prs.filter((pr) => QUIET.has(pr.group)).length;
  if (quiet) lines.push(`plus ${quiet} draft or stale prs left open on purpose`);
  console.log(['```', ...lines, '```'].join('\n').replace(/\n\n```$/, '\n```'));
} else {
  const counts = `${prs.length} open PRs by ${author} across ${repos.join(', ')}`;
  console.log([counts, '', ...lines].join('\n').trimEnd());
}
