#!/usr/bin/env node
// Reads one PR's review state through the GitHub CLI and reports what still
// stands between it and a merge: the title policy, the bot summaries and the
// commit each one reviewed, the unresolved and unanswered review threads, and
// the checks. It reads only; it posts and edits nothing.
//
//   node pr-bots.mjs <pr-number> [--repo generaltranslation/gt-cloud]
//
// Needs `gh` logged in with read access to the repository.
//
// Exit code: 0 when the PR reads ready (Greptile 5/5 on the head commit, no
// unresolved bot threads, no conflict with the base, and on gt-cloud each
// required check present and green), 1 otherwise, 2 on a usage or gh error.
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const number = args.find((a) => /^\d+$/.test(a));
const repoAt = args.indexOf('--repo');
const repo = repoAt >= 0 ? args[repoAt + 1] : 'generaltranslation/gt-cloud';
if (!number || !repo) {
  console.error('usage: node pr-bots.mjs <pr-number> [--repo owner/name]');
  process.exit(2);
}
const [owner, name] = repo.split('/');

const gh = (...ghArgs) => {
  try {
    return execFileSync('gh', ghArgs, { encoding: 'utf8', maxBuffer: 1 << 26 });
  } catch (error) {
    console.error(String(error.stderr || error.message).trim());
    process.exit(2);
  }
};

const REQUIRED = ['Validate PR title and Linear issue', 'check-planning-files', 'run-tests'];
const BOTS = new Set(['greptile-apps', 'cursor', 'devin-ai-integration', 'coderabbitai']);

const pr = JSON.parse(
  gh(
    'pr', 'view', number, '-R', repo, '--json',
    'number,title,state,isDraft,headRefName,headRefOid,baseRefName,mergeStateStatus,reviewDecision,body,statusCheckRollup',
  ),
);
const head = pr.headRefOid;
const short = (sha) => (sha ? sha.slice(0, 9) : 'none');
const problems = [];

console.log(`#${pr.number} ${pr.title}`);
console.log(`${pr.state}${pr.isDraft ? ' draft' : ''}, ${pr.headRefName} -> ${pr.baseRefName}, head ${short(head)}`);
console.log(`merge state ${pr.mergeStateStatus}, review ${pr.reviewDecision || 'none'}\n`);
// DIRTY: the branch conflicts with its base, and GitHub runs no pull_request
// workflows until that is resolved.
if (pr.state === 'OPEN' && pr.mergeStateStatus === 'DIRTY') problems.push('conflicts with base');

// Title policy (.github/workflows/pr-policy.yml): conventional type; feat needs Linear.
const type = pr.title.match(/^(\w+)(\([^)]*\))?!?:\s/)?.[1];
const TYPES = ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'];
if (!type || !TYPES.includes(type)) {
  console.log('title: not a conventional title the PR policy accepts');
  problems.push('title');
} else {
  console.log(`title: type ${type}${type === 'feat' ? ' (needs a linked Linear issue)' : ''}`);
}

// Bot summaries live in the PR body between their markers.
const body = pr.body || '';
const greptile = {
  score: body.match(/Confidence Score:\s*([0-5])\/5/)?.[1],
  sha: body.match(/Last reviewed commit:[^\n]*?\/commit\/([0-9a-f]{7,40})/)?.[1],
};
const cursorSha = body.match(/Reviewed by \[Cursor Bugbot\][^\n]*?for commit ([0-9a-f]{7,40})/)?.[1];
const onHead = (sha) => sha && head.startsWith(sha);

if (greptile.score) {
  const current = onHead(greptile.sha);
  console.log(
    `greptile: ${greptile.score}/5 on ${short(greptile.sha)}${current ? ' (head)' : ' (stale: comment "@greptile review again")'}`,
  );
  if (greptile.score !== '5' || !current) problems.push('greptile');
} else {
  console.log('greptile: no summary in the body (first run: comment "@greptile review")');
  if (repo === 'generaltranslation/gt-cloud') problems.push('greptile');
}
if (cursorSha) {
  console.log(`bugbot: reviewed ${short(cursorSha)}${onHead(cursorSha) ? ' (head)' : ' (stale: comment "bugbot run")'}`);
} else {
  console.log('bugbot: no summary in the body');
}

// Review threads: unresolved ones, and resolved bot threads nobody answered.
const query = `query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100){totalCount nodes{id isResolved isOutdated path comments(first:20){totalCount nodes{author{login}}}}}}}}`;
const threads = JSON.parse(
  gh('api', 'graphql', '-f', `query=${query}`, '-F', `owner=${owner}`, '-F', `name=${name}`, '-F', `number=${number}`),
).data.repository.pullRequest.reviewThreads;

const unresolved = [];
const unanswered = [];
for (const t of threads.nodes) {
  const author = t.comments.nodes[0]?.author?.login ?? 'unknown';
  const replied = t.comments.nodes.slice(1).some((c) => !BOTS.has(c.author?.login));
  const row = `${author} ${t.isOutdated ? '(outdated) ' : ''}${t.path ?? ''} ${t.id}`;
  if (!t.isResolved) unresolved.push(row);
  else if (BOTS.has(author) && !replied) unanswered.push(row);
}
console.log(`\nthreads: ${threads.totalCount} total, ${unresolved.length} unresolved, ${unanswered.length} resolved without a reply`);
for (const row of unresolved) console.log(`  unresolved  ${row}`);
for (const row of unanswered) console.log(`  no reply    ${row}`);
if (threads.totalCount > 100) console.log('  (only the first 100 threads were read)');
if (unresolved.some((row) => BOTS.has(row.split(' ')[0]))) problems.push('threads');

// Checks: the latest run of each check that was not cancelled stands for it.
// A push or a body edit cancels the run in flight, so older cancelled runs are
// counted and then set aside.
const runs = new Map();
for (const c of pr.statusCheckRollup || []) {
  const run = {
    name: c.name || c.context,
    workflow: c.workflowName || '',
    state: (c.conclusion || c.state || c.status || '').toUpperCase(),
    at: c.startedAt || '',
  };
  if (!runs.has(run.name)) runs.set(run.name, []);
  runs.get(run.name).push(run);
}
const checks = [...runs.values()].map((list) => {
  list.sort((a, b) => b.at.localeCompare(a.at));
  const standing = list.find((r) => r.state !== 'CANCELLED') ?? list[0];
  return { ...standing, cancelled: list.filter((r) => r.state === 'CANCELLED').length };
});
const GREEN = new Set(['SUCCESS', 'SKIPPED', 'NEUTRAL']);
const label = (c) => `${c.state}${c.cancelled ? ` (${c.cancelled} cancelled)` : ''}`;
console.log('\nchecks');
// The three required checks are gt-cloud's; other repositories only report them.
const gtCloud = repo === 'generaltranslation/gt-cloud';
for (const req of REQUIRED) {
  const found = checks.find((c) => c.name === req);
  console.log(`  required  ${req}: ${found ? label(found) : 'missing'}`);
  if (found ? !GREEN.has(found.state) : gtCloud) problems.push(req);
}
for (const c of checks) {
  if (REQUIRED.includes(c.name) || GREEN.has(c.state)) continue;
  console.log(`  other     ${c.name}: ${label(c)}`);
}
if (checks.some((c) => c.workflow === 'CI - Run Tests' && c.cancelled)) {
  console.log(
    `  CI runs were cancelled on this branch; an older commit can be the cause of a red: gh run list -R ${repo} --branch ${pr.headRefName} --workflow "CI - Run Tests"`,
  );
}

console.log(problems.length ? `\nnot ready: ${problems.join(', ')}` : '\nready for review');
process.exit(problems.length ? 1 : 0);
