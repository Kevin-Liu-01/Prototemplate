#!/bin/sh
# Offline test of pr-assets.sh: uploads to a local bare repository and checks
# the branch's tree, the parent chain, the printed links, the dry run, the
# refusals and that the checkout's index, tree and branch are untouched.
#
# Run: sh skills/gt-ship/scripts/pr-assets.test.sh (pnpm test:skill-scripts
# runs it). It uses git on a temporary folder and touches no network.
set -eu
script=$(cd "$(dirname "$0")" && pwd)/pr-assets.sh
tmp=$(mktemp -d "${TMPDIR:-/tmp}/pr-assets-test.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
export GIT_AUTHOR_NAME=test GIT_AUTHOR_DATE='2026-10-10T00:00:00Z' GIT_COMMITTER_NAME=test GIT_COMMITTER_DATE='2026-10-10T00:00:00Z'
export GIT_AUTHOR_EMAIL=test GIT_COMMITTER_EMAIL=test GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
fail=0
check() { if eval "$1"; then :; else echo "FAIL $2"; fail=1; fi; }

git init -q --bare "$tmp/remote.git"
git init -q -b main "$tmp/work"
cd "$tmp/work"
echo app > app.txt && git add app.txt && git commit -q -m init && git remote add origin "$tmp/remote.git" && git push -q origin main
printf 'one' > "$tmp/a.png"; printf 'two' > "$tmp/b.png"; printf 'three' > "$tmp/c.png"

out=$(sh "$script" --repo acme/app --pr 7 "$tmp/a.png" "$tmp/b.png")
check '[ "$(git -C "$tmp/remote.git" ls-tree -r --name-only pr-assets | tr "\n" " ")" = "screenshots/pr-7/a.png screenshots/pr-7/b.png " ]' 'the first upload starts the branch with both files'
check '[ -z "$(git -C "$tmp/remote.git" rev-list --parents -n 1 pr-assets | cut -s -d" " -f2)" ]' 'the first commit is an orphan'
check 'echo "$out" | grep -qx "https://github.com/acme/app/blob/pr-assets/screenshots/pr-7/a.png?raw=true"' 'the link for each file is printed'

sh "$script" --repo acme/app --pr 7 --sub round2 "$tmp/c.png" > /dev/null
check '[ "$(git -C "$tmp/remote.git" ls-tree -r --name-only pr-assets | wc -l | tr -d " ")" = 3 ]' 'a later round keeps the earlier files'
check 'git -C "$tmp/remote.git" ls-tree -r --name-only pr-assets | grep -qx screenshots/pr-7/round2/c.png' 'the round goes in its subfolder'
check '[ "$(git -C "$tmp/remote.git" rev-list --count pr-assets)" = 2 ]' 'the second commit sits on the first'

before=$(git -C "$tmp/remote.git" rev-parse pr-assets)
sh "$script" --repo acme/app --pr 8 --dry-run "$tmp/a.png" > /dev/null
check '[ "$(git -C "$tmp/remote.git" rev-parse pr-assets)" = "$before" ]' 'a dry run pushes nothing'

check '[ -z "$(git status --porcelain)" ] && [ "$(git branch --show-current)" = main ] && [ "$(git ls-files)" = app.txt ]' 'the checkout index, tree and branch are untouched'
check '! sh "$script" --repo Kevin-Liu-01/Prototemplate --pr 1 "$tmp/a.png" 2>/dev/null' 'a Prototemplate repository is refused'
check '! sh "$script" --pr 1 "$tmp/a.png" 2>/dev/null' '--repo is required'
check 'sh "$script" --help | grep -q "Usage"' '--help prints the usage'

[ "$fail" -eq 0 ] && echo 'pr-assets: all checks pass'
exit "$fail"
