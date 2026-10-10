#!/bin/sh
# pr-assets.sh: uploads PR screenshots to the repository's pr-assets orphan
# branch under screenshots/pr-<n>/ and prints the link for each file, without
# touching the checkout's index, working tree or branch (gt-ship section 4,
# references/pr-body.md "Where the images live").
#
# Usage, from a checkout whose remote is the repository named by --repo:
#   sh pr-assets.sh --repo <owner/name> --pr <n> [--sub <folder>] [--remote origin]
#                   [--branch pr-assets] [--message <text>] [--dry-run] <file>...
#   sh pr-assets.sh --help
#
# It fetches the branch (or starts it as an orphan when the remote has none),
# writes a new tree through a private index file holding the parent's tree
# plus the files, commits it on the parent and pushes the commit to the
# branch. A later round goes in --sub (screenshots/pr-<n>/round3/) or under
# new file names, so the links an older body revision holds stay valid. Each
# link is https://github.com/<owner/name>/blob/<branch>/<path>?raw=true; it
# renders in the PR body for anyone who can read the repository. --dry-run
# builds the commit and prints the links but pushes nothing.
#
# --repo has no default. A Prototemplate repository is refused: Vercel builds
# every pushed branch there, and an orphan branch with no app fails each
# build, so Prototemplate is never the asset repository.
#
# Requires: git; push access to the remote. The commit takes the checkout's
# own user.name and user.email.
# Last real run: none as this script (kept for: every PR that shows
# screenshots). The private-index upload it wraps (references/pr-body.md)
# ran 56 times in gt-cloud sessions, and the per-PR branch script before it
# 26 times, 2026-09-25 to 2026-10-10.
set -eu

usage() { sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; }

repo='' pr='' sub='' remote='origin' branch='pr-assets' message='' dry=0
while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --repo) repo=${2:?--repo needs owner/name}; shift 2 ;;
    --pr) pr=${2:?--pr needs a number}; shift 2 ;;
    --sub) sub=${2:?--sub needs a folder}; shift 2 ;;
    --remote) remote=${2:?--remote needs a name}; shift 2 ;;
    --branch) branch=${2:?--branch needs a name}; shift 2 ;;
    --message) message=${2:?--message needs text}; shift 2 ;;
    --dry-run) dry=1; shift ;;
    --) shift; break ;;
    -*) echo "pr-assets: unknown flag $1" >&2; exit 2 ;;
    *) break ;;
  esac
done

case "$repo" in
  */*) ;;
  *) echo 'pr-assets: pass --repo <owner/name>' >&2; exit 2 ;;
esac
case "$pr" in
  ''|*[!0-9]*) echo 'pr-assets: pass --pr <number>' >&2; exit 2 ;;
esac
case "$(printf '%s' "$repo" | tr '[:upper:]' '[:lower:]')" in
  */prototemplate)
    echo 'pr-assets: refused: every branch pushed to Prototemplate starts Vercel builds; use the product repository' >&2
    exit 2 ;;
esac
[ $# -gt 0 ] || { echo 'pr-assets: name at least one file' >&2; exit 2; }
for f in "$@"; do
  [ -f "$f" ] || { echo "pr-assets: no such file: $f" >&2; exit 2; }
done

dir="screenshots/pr-$pr"
[ -n "$sub" ] && dir="$dir/$sub"
[ -n "$message" ] || message="screenshots: pr-$pr${sub:+ $sub}"

parent=''
if git ls-remote --exit-code --heads "$remote" "$branch" >/dev/null 2>&1; then
  git fetch -q "$remote" "+refs/heads/$branch:refs/remotes/$remote/$branch"
  parent=$(git rev-parse "refs/remotes/$remote/$branch")
fi

index=$(mktemp "${TMPDIR:-/tmp}/pr-assets-index.XXXXXX")
trap 'rm -f "$index"' EXIT
rm -f "$index"
if [ -n "$parent" ]; then
  GIT_INDEX_FILE="$index" git read-tree "$parent"
else
  GIT_INDEX_FILE="$index" git read-tree --empty
fi
for f in "$@"; do
  blob=$(git hash-object -w "$f")
  GIT_INDEX_FILE="$index" git update-index --add --cacheinfo "100644,${blob},${dir}/$(basename "$f")"
done
tree=$(GIT_INDEX_FILE="$index" git write-tree)

if [ -n "$parent" ] && [ "$tree" = "$(git rev-parse "${parent}^{tree}")" ]; then
  echo 'pr-assets: the branch already holds these files unchanged'
else
  if [ -n "$parent" ]; then
    commit=$(git commit-tree "$tree" -p "$parent" -m "$message")
  else
    commit=$(git commit-tree "$tree" -m "$message")
  fi
  if [ "$dry" -eq 1 ]; then
    echo "pr-assets: dry run, built ${commit} and pushed nothing"
  else
    # braced: in zsh a bare $commit:refs reads :r as a modifier
    git push -q "$remote" "${commit}:refs/heads/${branch}"
  fi
fi

for f in "$@"; do
  echo "https://github.com/${repo}/blob/${branch}/${dir}/$(basename "$f")?raw=true"
done
