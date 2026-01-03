#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_DIR="docs/Z_AGENT_REPORT/archive"
DATE_SUFFIX="$(date +%Y%m%d)"
DRY_RUN=true

usage() {
  cat <<EOF
Usage: $0 [--dry-run|--yes]
  --dry-run  (default) show actions without moving
  --yes      perform moves
EOF
  exit 1
}

if [[ "${1-}" == "--yes" ]]; then
  DRY_RUN=false
elif [[ "${1-}" == "--dry-run" || -z "${1-}" ]]; then
  DRY_RUN=true
else
  usage
fi

mkdir -p "$ARCHIVE_DIR"

# Resolve dest collisions by appending a counter
resolve_dest() {
  local d="$1"
  local n=0
  while [[ -e "$d" ]]; do
    n=$((n+1))
    d="${1%.*}_$n${1##*.}"
  done
  echo "$d"
}

move_to_archive() {
  local src="$1"
  local base
  base="$(basename "$src")"
  local dest="$ARCHIVE_DIR/${DATE_SUFFIX}_${base}"
  dest="$(resolve_dest "$dest")"
  if $DRY_RUN; then
    echo "[DRY-RUN] mv \"$src\" \"$dest\""
  else
    echo "Moving: \"$src\" -> \"$dest\""
    mv "$src" "$dest"
  fi
}

echo "Scanning docs/ for transient items..."

shopt -s nullglob
for entry in docs/*; do
  name="$(basename "$entry")"

  # Keep the Z_AGENT_REPORT folder itself, but archive its transient contents
  if [[ "$name" == "Z_AGENT_REPORT" ]]; then
    echo "Processing contents of docs/Z_AGENT_REPORT/ ..."
    for zitem in docs/Z_AGENT_REPORT/*; do
      zname="$(basename "$zitem")"
      # Preserve the archive dir and README
      if [[ "$zname" == "archive" || "$zname" == "README.md" ]]; then
        echo " Preserve: docs/Z_AGENT_REPORT/$zname"
        continue
      fi
      move_to_archive "$zitem"
    done
    continue
  fi

  # Preserve Master Docs that start with single letter A-Y followed by underscore
  if [[ "$name" =~ ^[A-Y]_ ]]; then
    echo "Preserve Master doc/dir: $name"
    continue
  fi

  # Preserve the scripts directory (tooling)
  if [[ "$name" == "scripts" ]]; then
    echo "Preserve tooling dir: $name"
    continue
  fi

  # Otherwise treat as transient -> archive
  move_to_archive "$entry"
done

echo
if $DRY_RUN; then
  echo "Dry run complete. Inspect the above list and re-run with '--yes' to apply moves."
else
  echo "Move complete. All selected transient docs were moved to: $ARCHIVE_DIR"
fi