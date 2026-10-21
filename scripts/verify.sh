#!/usr/bin/env bash
# TOOLSMITH — toolchain audit. Presence + version + responsiveness for the whole registry.
# Usage: verify.sh [tool ...] [--category c] [--json]
set -uo pipefail
REG_FILE="$(dirname "$0")/install_tool.sh"
JSON=0; CATEGORY=""; TOOLS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --json) JSON=1 ;;
    --category) CATEGORY="$2"; shift ;;
    *) TOOLS+=("$1") ;;
  esac
  shift
done

have() { command -v "$1" >/dev/null 2>&1; }
ver_of() {
  local t="$1" o
  for f in --version -version -V; do
    o=$(timeout 10 "$t" "$f" 2>&1 | head -1)
    [ -n "$o" ] && { printf '%s' "$o"; return 0; }
  done
  o=$(timeout 10 "$t" -h 2>&1 | head -1)
  [ -n "$o" ] && { printf '%s' "$o"; return 0; }
  printf 'present-no-version'
}

if [ ${#TOOLS[@]} -eq 0 ]; then
  if [ -n "$CATEGORY" ]; then
    TOOLS=($(bash "$REG_FILE" --search "" | awk -F'|' -v c="$CATEGORY" '$2==c {print $1}'))
  else
    TOOLS=($(bash "$REG_FILE" --list-all | awk -F'|' 'NF>3 {print $1}'))
  fi
fi

PRESENT=0; NOVER=0; MISSING=0
printf '%-22s %-10s %s\n' "TOOL" "STATE" "VERSION / PATH"
printf '%s\n' "------------------------------------------------------------------------------"
for t in "${TOOLS[@]}"; do
  if have "$t"; then
    v=$(ver_of "$t")
    if [ "$v" = "present-no-version" ]; then state="NO-VERSION"; NOVER=$((NOVER+1))
    else state="ok"; PRESENT=$((PRESENT+1)); fi
    printf '%-22s %-10s %s\n' "$t" "$state" "${v:0:60}"
    [ "$JSON" = "1" ] && printf '{"tool":"%s","state":"%s","version":"%s"}\n' "$t" "$state" "$v"
  else
    MISSING=$((MISSING+1))
    printf '%-22s %-10s %s\n' "$t" "MISSING" "-"
    [ "$JSON" = "1" ] && printf '{"tool":"%s","state":"missing"}\n' "$t"
  fi
done
printf '%s\n' "------------------------------------------------------------------------------"
printf 'ok=%d  no-version=%d  missing=%d  total=%d\n' "$PRESENT" "$NOVER" "$MISSING" "${#TOOLS[@]}"
[ "$JSON" = "1" ] && printf '{"summary":{"ok":%d,"no_version":%d,"missing":%d,"total":%d}}\n' "$PRESENT" "$NOVER" "$MISSING" "${#TOOLS[@]}"
exit 0
