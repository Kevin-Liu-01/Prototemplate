#!/bin/sh
# routing-matrix.sh: checks generaltranslation.com's routing cases (real
# pages, near-miss corrections, section fallbacks, locale prefixes) by the
# status and redirect target each path answers, so a routing change is
# gated before it ships (gt-website section 4).
#
# Usage:
#   sh routing-matrix.sh [--base https://generaltranslation.com]
#                        [--cases <file>] [--verbose]
#   sh routing-matrix.sh --help
#
# Every request is one GET with curl and never follows a redirect: the
# immediate answer is the result. The cases file defaults to
# ../references/routing-cases.txt beside this folder. Each line is
#   label | path | expected status | expected target
# where the target is a path (the base is stripped from the Location
# header), - for no redirect, or * for any target; # starts a comment and
# a line "## <title>" starts a section of the printout. --base also reads
# the PT_BASE variable, so a local dev server or a preview is checked the
# same way (a preview behind SSO needs a protection bypass first).
#
# Exit status is the number of failed cases (capped at 125), so the matrix
# works as a gate; 0 when every case holds.
#
# Requires: curl.
# Last real run: 2026-10-10, against https://generaltranslation.com from
# the Prototemplate session (the command and its result are in
# references/routing-cases.txt). The matrix it generalizes ran as a
# 35-case script on the docs and blog near-miss PRs, 2026-08-20 to
# 2026-08-24.
set -u

usage() { sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; }

here=$(cd "$(dirname "$0")" && pwd)
base=${PT_BASE:-https://generaltranslation.com}
cases="$here/../references/routing-cases.txt"
verbose=0
while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --base) base=${2:?--base needs a URL}; shift 2 ;;
    --cases) cases=${2:?--cases needs a file}; shift 2 ;;
    --verbose|-v) verbose=1; shift ;;
    *) echo "routing-matrix: unknown argument $1" >&2; exit 125 ;;
  esac
done
base=${base%/}
[ -f "$cases" ] || { echo "routing-matrix: no cases file at $cases" >&2; exit 125; }

pass=0
fail=0
trim() { printf '%s' "$1" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//'; }

while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    '## '*) printf '\n%s\n' "${line#'## '}"; continue ;;
    '#'*|'') continue ;;
  esac
  label=$(trim "$(printf '%s' "$line" | cut -d'|' -f1)")
  path=$(trim "$(printf '%s' "$line" | cut -d'|' -f2)")
  want_code=$(trim "$(printf '%s' "$line" | cut -d'|' -f3)")
  want_to=$(trim "$(printf '%s' "$line" | cut -d'|' -f4)")
  out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 60 "$base$path")
  code=${out%% *}
  to=${out#* }
  to=${to#"$base"}
  [ -n "$to" ] || to='-'
  if [ "$code" = "$want_code" ] && { [ "$want_to" = '*' ] || [ "$to" = "$want_to" ]; }; then
    pass=$((pass + 1))
    [ "$verbose" -eq 1 ] && printf '  ok   %-48s %s %s\n' "$path" "$code" "$to"
  else
    fail=$((fail + 1))
    printf '  FAIL %-48s got  %s %s\n' "$path" "$code" "$to"
    printf '       %-48s want %s %s\n' "($label)" "$want_code" "$want_to"
  fi
done < "$cases"

printf '\n%d passed, %d failed against %s\n' "$pass" "$fail" "$base"
[ "$fail" -gt 125 ] && fail=125
exit "$fail"
